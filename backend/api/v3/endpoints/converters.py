import os
import tempfile
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, Response, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from core.deps import get_current_user
from core.permissions import ConversionNotPermittedError, ensure_permission
from core.points import InsufficientPointsError, charge_points, record_conversion_result, refund_points
from db.models import RoleEnum, User
from db.session import get_db
from models.schemas import ConversionResponse, FileListResponse
from services.docx_to_pdf_converter import DOCXToPDFConverterService
from services.excel_to_pdf_converter import ExcelToPDFConverterService
from services.file_manager import FileManagerService
from services.image_to_pdf_converter import ImageToPDFConverterService
from services.pdf_page_remover import PDFPageRemoverService
from services.pdf_to_docs_converter import PDFToDocsConverterService
from services.pdf_to_excel_converter import PDFToExcelConverterService

router = APIRouter(prefix="/conversions", tags=["conversions"])

pdf_to_excel_file_manager = FileManagerService()
pdf_to_excel_converter = PDFToExcelConverterService()

pdf_to_docs_file_manager = FileManagerService(storage_dir="static/pdfToDocs")
pdf_to_docs_converter = PDFToDocsConverterService()

docx_to_pdf_file_manager = FileManagerService(storage_dir="static/docxToPdf")
docx_to_pdf_converter = DOCXToPDFConverterService()

excel_to_pdf_file_manager = FileManagerService(storage_dir="static/excelToPdf")
excel_to_pdf_converter = ExcelToPDFConverterService()

image_to_pdf_file_manager = FileManagerService(storage_dir="static/imageToPdf")
image_to_pdf_converter = ImageToPDFConverterService()

pdf_page_remove_file_manager = FileManagerService(storage_dir="static/pdfPageRemove")
pdf_page_remover = PDFPageRemoverService()


def _build_meta(request: Request, file: UploadFile, size: Optional[int]) -> Dict[str, Any]:
    return {
        "path": str(request.url.path),
        "filename": file.filename,
        "content_type": file.content_type,
        "size": size,
    }


def _enforce_access(
    db: Session,
    user: User,
    action: str,
    request: Request,
    file: UploadFile,
    response: Response,
    size: Optional[int],
):
    if user.role == RoleEnum.demo_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Demo user is read-only")

    ensure_permission(db, user, action)

    idempotency_key = request.headers.get("Idempotency-Key")
    charge_result = charge_points(
        db,
        user=user,
        action=action,
        request_id=idempotency_key,
        meta=_build_meta(request, file, size),
    )

    if charge_result.already_processed:
        response.headers["X-Idempotent-Replay"] = "true"
        if charge_result.existing_result:
            return ConversionResponse(**charge_result.existing_result), charge_result
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Idempotency-Key already used and result unavailable",
        )

    return None, charge_result


@router.post("/pdf-to-excel", response_model=ConversionResponse)
async def upload_pdf(
    request: Request,
    response: Response,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    action = "pdf_to_excel"
    if current_user.role == RoleEnum.demo_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Demo user is read-only")
    charge_result = None
    try:
        is_valid, error_message = await pdf_to_excel_file_manager.validate_pdf_file(file)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_message)

        content = await file.read()
        await file.seek(0)
        early_response, charge_result = _enforce_access(
            db, current_user, action, request, file, response, len(content)
        )
        if early_response:
            return early_response

        output_filename = pdf_to_excel_file_manager.generate_unique_filename(file.filename)
        output_path = str(pdf_to_excel_file_manager.storage_dir / output_filename)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            temp_pdf.write(content)
            temp_pdf_path = temp_pdf.name

        try:
            success, error_msg = pdf_to_excel_converter.convert_pdf_to_excel(temp_pdf_path, output_path)

            if not success:
                result = ConversionResponse(
                    success=False,
                    message=error_msg or "Conversion failed",
                    filename=None,
                    download_url=None,
                )
                if current_user.role != RoleEnum.super_user:
                    refund_points(db, current_user.id, action, charge_result.request_id)
                    record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
                return result

            download_url = f"/api/v3/conversions/pdf-to-excel/files/{output_filename}"
            result = ConversionResponse(
                success=True,
                message="PDF converted successfully",
                filename=output_filename,
                download_url=download_url,
            )
            if current_user.role != RoleEnum.super_user:
                record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
            return result
        finally:
            if os.path.exists(temp_pdf_path):
                os.unlink(temp_pdf_path)
    except (HTTPException, ConversionNotPermittedError, InsufficientPointsError):
        raise
    except Exception as exc:
        if current_user.role != RoleEnum.super_user and charge_result and charge_result.charged:
            refund_points(db, current_user.id, action, charge_result.request_id)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(exc)}")


@router.get("/pdf-to-excel/files", response_model=FileListResponse)
async def list_files(current_user: User = Depends(get_current_user)):
    try:
        files = pdf_to_excel_file_manager.list_converted_files()
        return FileListResponse(files=files, total_count=len(files))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to list files: {str(exc)}")


@router.get("/pdf-to-excel/files/{filename}")
async def download_file(filename: str, current_user: User = Depends(get_current_user)):
    try:
        file_path = pdf_to_excel_file_manager.get_file_path(filename)
        if not file_path:
            raise HTTPException(status_code=404, detail="File not found")

        original_name = pdf_to_excel_file_manager._extract_original_name(filename)
        return FileResponse(
            path=file_path,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename=f"{original_name}.xlsx",
            headers={"Content-Disposition": f'attachment; filename="{original_name}.xlsx"'},
        )
    except (HTTPException, ConversionNotPermittedError, InsufficientPointsError):
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to download file: {str(exc)}")


@router.post("/pdf-to-word", response_model=ConversionResponse)
async def upload_pdf_for_docs(
    request: Request,
    response: Response,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    action = "pdf_to_docs"
    if current_user.role == RoleEnum.demo_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Demo user is read-only")
    charge_result = None
    try:
        is_valid, error_message = await pdf_to_docs_file_manager.validate_pdf_file(file)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_message)

        content = await file.read()
        await file.seek(0)
        early_response, charge_result = _enforce_access(
            db, current_user, action, request, file, response, len(content)
        )
        if early_response:
            return early_response

        output_filename = pdf_to_docs_file_manager.generate_unique_filename(file.filename, output_extension=".docx")
        output_path = str(pdf_to_docs_file_manager.storage_dir / output_filename)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            temp_pdf.write(content)
            temp_pdf_path = temp_pdf.name

        try:
            success, error_msg = pdf_to_docs_converter.convert_pdf_to_docx(temp_pdf_path, output_path)
            if not success:
                result = ConversionResponse(
                    success=False,
                    message=error_msg or "Conversion failed",
                    filename=None,
                    download_url=None,
                )
                if current_user.role != RoleEnum.super_user:
                    refund_points(db, current_user.id, action, charge_result.request_id)
                    record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
                return result

            download_url = f"/api/v3/conversions/pdf-to-word/files/{output_filename}"
            result = ConversionResponse(
                success=True,
                message="PDF converted successfully",
                filename=output_filename,
                download_url=download_url,
            )
            if current_user.role != RoleEnum.super_user:
                record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
            return result
        finally:
            if os.path.exists(temp_pdf_path):
                os.unlink(temp_pdf_path)
    except (HTTPException, ConversionNotPermittedError, InsufficientPointsError):
        raise
    except Exception as exc:
        if current_user.role != RoleEnum.super_user and charge_result and charge_result.charged:
            refund_points(db, current_user.id, action, charge_result.request_id)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(exc)}")


@router.get("/pdf-to-word/files", response_model=FileListResponse)
async def list_docs_files(current_user: User = Depends(get_current_user)):
    try:
        files = pdf_to_docs_file_manager.list_converted_files(file_extension=".docx")
        return FileListResponse(files=files, total_count=len(files))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to list files: {str(exc)}")


@router.get("/pdf-to-word/files/{filename}")
async def download_docs_file(filename: str, current_user: User = Depends(get_current_user)):
    try:
        file_path = pdf_to_docs_file_manager.get_file_path(filename)
        if not file_path:
            raise HTTPException(status_code=404, detail="File not found")

        original_name = pdf_to_docs_file_manager._extract_original_name(filename)
        return FileResponse(
            path=file_path,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=f"{original_name}.docx",
            headers={"Content-Disposition": f'attachment; filename="{original_name}.docx"'},
        )
    except (HTTPException, ConversionNotPermittedError, InsufficientPointsError):
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to download file: {str(exc)}")


@router.post("/docx-to-pdf", response_model=ConversionResponse)
async def upload_docx_for_pdf(
    request: Request,
    response: Response,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    action = "docx_to_pdf"
    if current_user.role == RoleEnum.demo_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Demo user is read-only")
    charge_result = None
    try:
        is_valid, error_message = await docx_to_pdf_file_manager.validate_docx_file(file)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_message)

        content = await file.read()
        await file.seek(0)
        early_response, charge_result = _enforce_access(
            db, current_user, action, request, file, response, len(content)
        )
        if early_response:
            return early_response

        output_filename = docx_to_pdf_file_manager.generate_unique_filename(file.filename, output_extension=".pdf")
        output_path = str(docx_to_pdf_file_manager.storage_dir / output_filename)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as temp_docx:
            temp_docx.write(content)
            temp_docx_path = temp_docx.name

        try:
            success, error_msg = docx_to_pdf_converter.convert_docx_to_pdf(temp_docx_path, output_path)
            if not success:
                result = ConversionResponse(
                    success=False,
                    message=error_msg or "Conversion failed",
                    filename=None,
                    download_url=None,
                )
                if current_user.role != RoleEnum.super_user:
                    refund_points(db, current_user.id, action, charge_result.request_id)
                    record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
                return result

            download_url = f"/api/v3/conversions/docx-to-pdf/files/{output_filename}"
            result = ConversionResponse(
                success=True,
                message="DOCX converted successfully",
                filename=output_filename,
                download_url=download_url,
            )
            if current_user.role != RoleEnum.super_user:
                record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
            return result
        finally:
            if os.path.exists(temp_docx_path):
                os.unlink(temp_docx_path)
    except (HTTPException, ConversionNotPermittedError, InsufficientPointsError):
        raise
    except Exception as exc:
        if current_user.role != RoleEnum.super_user and charge_result and charge_result.charged:
            refund_points(db, current_user.id, action, charge_result.request_id)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(exc)}")


@router.get("/docx-to-pdf/files", response_model=FileListResponse)
async def list_docx_pdf_files(current_user: User = Depends(get_current_user)):
    try:
        files = docx_to_pdf_file_manager.list_converted_files(file_extension=".pdf")
        return FileListResponse(files=files, total_count=len(files))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to list files: {str(exc)}")


@router.get("/docx-to-pdf/files/{filename}")
async def download_docx_pdf_file(filename: str, current_user: User = Depends(get_current_user)):
    try:
        file_path = docx_to_pdf_file_manager.get_file_path(filename)
        if not file_path:
            raise HTTPException(status_code=404, detail="File not found")

        original_name = docx_to_pdf_file_manager._extract_original_name(filename)
        return FileResponse(
            path=file_path,
            media_type="application/pdf",
            filename=f"{original_name}.pdf",
            headers={"Content-Disposition": f'attachment; filename="{original_name}.pdf"'},
        )
    except (HTTPException, ConversionNotPermittedError, InsufficientPointsError):
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to download file: {str(exc)}")


@router.post("/excel-to-pdf", response_model=ConversionResponse)
async def upload_excel_for_pdf(
    request: Request,
    response: Response,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    action = "excel_to_pdf"
    if current_user.role == RoleEnum.demo_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Demo user is read-only")
    charge_result = None
    try:
        is_valid, error_message = await excel_to_pdf_file_manager.validate_excel_file(file)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_message)

        content = await file.read()
        await file.seek(0)
        early_response, charge_result = _enforce_access(
            db, current_user, action, request, file, response, len(content)
        )
        if early_response:
            return early_response

        output_filename = excel_to_pdf_file_manager.generate_unique_filename(file.filename, output_extension=".pdf")
        output_path = str(excel_to_pdf_file_manager.storage_dir / output_filename)

        suffix = os.path.splitext(file.filename)[1].lower() or ".xlsx"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_excel:
            temp_excel.write(content)
            temp_excel_path = temp_excel.name

        try:
            success, error_msg = excel_to_pdf_converter.convert_excel_to_pdf(temp_excel_path, output_path)
            if not success:
                result = ConversionResponse(
                    success=False,
                    message=error_msg or "Conversion failed",
                    filename=None,
                    download_url=None,
                )
                if current_user.role != RoleEnum.super_user:
                    refund_points(db, current_user.id, action, charge_result.request_id)
                    record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
                return result

            download_url = f"/api/v3/conversions/excel-to-pdf/files/{output_filename}"
            result = ConversionResponse(
                success=True,
                message="Excel converted successfully",
                filename=output_filename,
                download_url=download_url,
            )
            if current_user.role != RoleEnum.super_user:
                record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
            return result
        finally:
            if os.path.exists(temp_excel_path):
                os.unlink(temp_excel_path)
    except (HTTPException, ConversionNotPermittedError, InsufficientPointsError):
        raise
    except Exception as exc:
        if current_user.role != RoleEnum.super_user and charge_result and charge_result.charged:
            refund_points(db, current_user.id, action, charge_result.request_id)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(exc)}")


@router.get("/excel-to-pdf/files", response_model=FileListResponse)
async def list_excel_pdf_files(current_user: User = Depends(get_current_user)):
    try:
        files = excel_to_pdf_file_manager.list_converted_files(file_extension=".pdf")
        return FileListResponse(files=files, total_count=len(files))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to list files: {str(exc)}")


@router.get("/excel-to-pdf/files/{filename}")
async def download_excel_pdf_file(filename: str, current_user: User = Depends(get_current_user)):
    try:
        file_path = excel_to_pdf_file_manager.get_file_path(filename)
        if not file_path:
            raise HTTPException(status_code=404, detail="File not found")

        original_name = excel_to_pdf_file_manager._extract_original_name(filename)
        return FileResponse(
            path=file_path,
            media_type="application/pdf",
            filename=f"{original_name}.pdf",
            headers={"Content-Disposition": f'attachment; filename="{original_name}.pdf"'},
        )
    except (HTTPException, ConversionNotPermittedError, InsufficientPointsError):
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to download file: {str(exc)}")


@router.post("/image-to-pdf", response_model=ConversionResponse)
async def upload_image_for_pdf(
    request: Request,
    response: Response,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    action = "image_to_pdf"
    if current_user.role == RoleEnum.demo_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Demo user is read-only")
    charge_result = None
    try:
        is_valid, error_message = await image_to_pdf_file_manager.validate_image_file(file)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_message)

        content = await file.read()
        await file.seek(0)
        early_response, charge_result = _enforce_access(
            db, current_user, action, request, file, response, len(content)
        )
        if early_response:
            return early_response

        output_filename = image_to_pdf_file_manager.generate_unique_filename(file.filename, output_extension=".pdf")
        output_path = str(image_to_pdf_file_manager.storage_dir / output_filename)

        suffix = os.path.splitext(file.filename)[1].lower() or ".png"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_image:
            temp_image.write(content)
            temp_image_path = temp_image.name

        try:
            success, error_msg = image_to_pdf_converter.convert_image_to_pdf(temp_image_path, output_path)
            if not success:
                result = ConversionResponse(
                    success=False,
                    message=error_msg or "Conversion failed",
                    filename=None,
                    download_url=None,
                )
                if current_user.role != RoleEnum.super_user:
                    refund_points(db, current_user.id, action, charge_result.request_id)
                    record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
                return result

            download_url = f"/api/v3/conversions/image-to-pdf/files/{output_filename}"
            result = ConversionResponse(
                success=True,
                message="Image converted successfully",
                filename=output_filename,
                download_url=download_url,
            )
            if current_user.role != RoleEnum.super_user:
                record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
            return result
        finally:
            if os.path.exists(temp_image_path):
                os.unlink(temp_image_path)
    except (HTTPException, ConversionNotPermittedError, InsufficientPointsError):
        raise
    except Exception as exc:
        if current_user.role != RoleEnum.super_user and charge_result and charge_result.charged:
            refund_points(db, current_user.id, action, charge_result.request_id)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(exc)}")


@router.get("/image-to-pdf/files", response_model=FileListResponse)
async def list_image_pdf_files(current_user: User = Depends(get_current_user)):
    try:
        files = image_to_pdf_file_manager.list_converted_files(file_extension=".pdf")
        return FileListResponse(files=files, total_count=len(files))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to list files: {str(exc)}")


@router.get("/image-to-pdf/files/{filename}")
async def download_image_pdf_file(filename: str, current_user: User = Depends(get_current_user)):
    try:
        file_path = image_to_pdf_file_manager.get_file_path(filename)
        if not file_path:
            raise HTTPException(status_code=404, detail="File not found")

        original_name = image_to_pdf_file_manager._extract_original_name(filename)
        return FileResponse(
            path=file_path,
            media_type="application/pdf",
            filename=f"{original_name}.pdf",
            headers={"Content-Disposition": f'attachment; filename="{original_name}.pdf"'},
        )
    except (HTTPException, ConversionNotPermittedError, InsufficientPointsError):
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to download file: {str(exc)}")


@router.post("/remove-pages-from-pdf", response_model=ConversionResponse)
async def remove_pages_from_pdf(
    request: Request,
    response: Response,
    file: UploadFile = File(...),
    pages: str | None = Form(None),
    remove_blank: bool = Form(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    action = "pdf_page_remove"
    if current_user.role == RoleEnum.demo_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Demo user is read-only")
    charge_result = None
    try:
        is_valid, error_message = await pdf_page_remove_file_manager.validate_pdf_file(file)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_message)

        content = await file.read()
        await file.seek(0)
        early_response, charge_result = _enforce_access(
            db, current_user, action, request, file, response, len(content)
        )
        if early_response:
            return early_response

        output_filename = pdf_page_remove_file_manager.generate_unique_filename(file.filename, output_extension=".pdf")
        output_path = str(pdf_page_remove_file_manager.storage_dir / output_filename)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            temp_pdf.write(content)
            temp_pdf_path = temp_pdf.name

        try:
            success, error_msg = pdf_page_remover.remove_pages(
                temp_pdf_path,
                output_path,
                pages_spec=pages,
                remove_blank=remove_blank,
            )
            if not success:
                result = ConversionResponse(
                    success=False,
                    message=error_msg or "Page removal failed",
                    filename=None,
                    download_url=None,
                )
                if current_user.role != RoleEnum.super_user:
                    refund_points(db, current_user.id, action, charge_result.request_id)
                    record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
                return result

            download_url = f"/api/v3/conversions/remove-pages-from-pdf/files/{output_filename}"
            result = ConversionResponse(
                success=True,
                message="PDF updated successfully",
                filename=output_filename,
                download_url=download_url,
            )
            if current_user.role != RoleEnum.super_user:
                record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
            return result
        finally:
            if os.path.exists(temp_pdf_path):
                os.unlink(temp_pdf_path)
    except (HTTPException, ConversionNotPermittedError, InsufficientPointsError):
        raise
    except Exception as exc:
        if current_user.role != RoleEnum.super_user and charge_result and charge_result.charged:
            refund_points(db, current_user.id, action, charge_result.request_id)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(exc)}")


@router.get("/remove-pages-from-pdf/files", response_model=FileListResponse)
async def list_removed_pages_files(current_user: User = Depends(get_current_user)):
    try:
        files = pdf_page_remove_file_manager.list_converted_files(file_extension=".pdf")
        return FileListResponse(files=files, total_count=len(files))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to list files: {str(exc)}")


@router.get("/remove-pages-from-pdf/files/{filename}")
async def download_removed_pages_file(filename: str, current_user: User = Depends(get_current_user)):
    try:
        file_path = pdf_page_remove_file_manager.get_file_path(filename)
        if not file_path:
            raise HTTPException(status_code=404, detail="File not found")

        original_name = pdf_page_remove_file_manager._extract_original_name(filename)
        return FileResponse(
            path=file_path,
            media_type="application/pdf",
            filename=f"{original_name}.pdf",
            headers={"Content-Disposition": f'attachment; filename="{original_name}.pdf"'},
        )
    except (HTTPException, ConversionNotPermittedError, InsufficientPointsError):
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to download file: {str(exc)}")
