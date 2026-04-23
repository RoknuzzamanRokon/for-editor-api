import os
import tempfile
import uuid
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, Query, Request, Response, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, load_only

from core.deps import get_current_user, require_owner
from core.permissions import ConversionNotPermittedError, ensure_permission
from core.points import (
    POINTS_COST_PER_REQUEST,
    InsufficientPointsError,
    charge_points,
    get_user_balance,
    record_conversion_result,
    refund_points,
)
from db.models import Conversion, RoleEnum, User
from db.session import SessionLocal, get_db
from models.conversions import (
    ConversionCreateResponse,
    ConversionHistoryItem,
    ConversionHistoryResponse,
    ConversionStatusResponse,
)
from services.docx_to_pdf_converter import DOCXToPDFConverterService
from services.excel_to_pdf_converter import ExcelToPDFConverterService
from services.background_remover import BackgroundRemoverService
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

remove_background_file_manager = FileManagerService(storage_dir="static/removeBackground")
background_remover = BackgroundRemoverService()

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
            return ConversionCreateResponse.model_validate(charge_result.existing_result), charge_result
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Idempotency-Key already used and result unavailable",
        )

    return None, charge_result


def _new_private_output(file_manager: FileManagerService, extension: str) -> tuple[str, str]:
    filename = f"{uuid.uuid4().hex}{extension}"
    output_path = str((file_manager.storage_dir / filename).resolve())
    return filename, output_path


def _create_conversion_row(db: Session, user: User, action: str, input_filename: str, request_id: str) -> Conversion:
    conversion = Conversion(
        owner_user_id=user.id,
        action=action,
        input_filename=input_filename,
        status="processing",
        request_id=request_id,
        points_charged=0,
    )
    db.add(conversion)
    db.commit()
    db.refresh(conversion)
    return conversion


def _process_pdf_to_word_background(
    conversion_id: int,
    user_id: int,
    is_super_user: bool,
    request_id: str,
    pdf_bytes: bytes,
) -> None:
    db = SessionLocal()
    temp_pdf_path: Optional[str] = None
    try:
        conversion = db.query(Conversion).filter(Conversion.id == conversion_id).first()
        if not conversion:
            return

        _, output_path = _new_private_output(pdf_to_docs_file_manager, ".docx")
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            temp_pdf.write(pdf_bytes)
            temp_pdf_path = temp_pdf.name

        success, error_msg = pdf_to_docs_converter.convert_pdf_to_docx(temp_pdf_path, output_path)
        if not success:
            if not is_super_user:
                refund_points(db, user_id, "pdf_to_docs", request_id)
            conversion.status = "failed"
            conversion.error_message = error_msg or "Conversion failed"
            conversion.points_charged = 0
            db.commit()

            if not is_super_user:
                failure_result = ConversionCreateResponse(
                    conversion_id=conversion.id,
                    status="failed",
                    download_url=None,
                    points_charged=0,
                    remaining_balance=get_user_balance(db, user_id),
                )
                record_conversion_result(
                    db,
                    user_id,
                    "pdf_to_docs",
                    request_id,
                    failure_result.model_dump(),
                )
            return

        points_charged = POINTS_COST_PER_REQUEST if not is_super_user else 0
        conversion.status = "success"
        conversion.output_filename = output_path
        conversion.error_message = None
        conversion.points_charged = points_charged
        db.commit()

        if not is_super_user:
            success_result = ConversionCreateResponse(
                conversion_id=conversion.id,
                status="success",
                download_url=f"/api/v3/conversions/{conversion.id}/download",
                points_charged=points_charged,
                remaining_balance=get_user_balance(db, user_id),
            )
            record_conversion_result(
                db,
                user_id,
                "pdf_to_docs",
                request_id,
                success_result.model_dump(),
            )
    except Exception as exc:
        conversion = db.query(Conversion).filter(Conversion.id == conversion_id).first()
        if conversion:
            if not is_super_user:
                refund_points(db, user_id, "pdf_to_docs", request_id)
            conversion.status = "failed"
            conversion.error_message = str(exc)
            conversion.points_charged = 0
            db.commit()
    finally:
        if temp_pdf_path and os.path.exists(temp_pdf_path):
            os.unlink(temp_pdf_path)
        db.close()


def _query_owned_conversion(db: Session, current_user: User, conversion_id: int) -> Conversion:
    query = db.query(Conversion).filter(Conversion.id == conversion_id)
    if current_user.role != RoleEnum.super_user:
        query = query.filter(Conversion.owner_user_id == current_user.id)
    conversion = query.first()
    if not conversion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversion not found")
    return conversion


def _media_type_for_suffix(suffix: str) -> str:
    mapping = {
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".pdf": "application/pdf",
        ".png": "image/png",
    }
    return mapping.get(suffix.lower(), "application/octet-stream")


def _build_history_item(conversion: Conversion) -> ConversionHistoryItem:
    download_url = None
    if conversion.status == "success" and conversion.output_filename:
        download_url = f"/api/v3/conversions/{conversion.id}/download"
    return ConversionHistoryItem(
        id=conversion.id,
        owner_user_id=conversion.owner_user_id,
        action=conversion.action,
        input_filename=conversion.input_filename,
        status=conversion.status,
        points_charged=conversion.points_charged,
        error_message=conversion.error_message,
        created_at=conversion.created_at,
        updated_at=conversion.updated_at,
        download_url=download_url,
    )


def _build_status_response(
    db: Session,
    current_user: User,
    conversion: Conversion,
) -> ConversionStatusResponse:
    download_url = None
    normalized_status = conversion.status

    if conversion.status == "success" and conversion.output_filename:
        normalized_status = "completed"
        download_url = f"/api/v3/conversions/{conversion.id}/download"

    remaining_balance = None
    if current_user.role != RoleEnum.super_user:
        remaining_balance = get_user_balance(db, current_user.id)

    return ConversionStatusResponse(
        conversion_id=conversion.id,
        action=conversion.action,
        input_filename=conversion.input_filename,
        status=normalized_status,
        error_message=conversion.error_message,
        points_charged=conversion.points_charged,
        remaining_balance=remaining_balance,
        download_url=download_url,
        created_at=conversion.created_at,
        updated_at=conversion.updated_at,
    )


def _get_action_history(
    action: str,
    db: Session,
    current_user: User,
    limit: int,
    user_id: Optional[int],
) -> ConversionHistoryResponse:
    query = db.query(Conversion).filter(Conversion.action == action)

    if current_user.role == RoleEnum.super_user:
        if user_id is not None:
            query = query.filter(Conversion.owner_user_id == user_id)
    else:
        query = query.filter(Conversion.owner_user_id == current_user.id)

    items = (
        query.options(
            load_only(
                Conversion.id,
                Conversion.owner_user_id,
                Conversion.action,
                Conversion.input_filename,
                Conversion.status,
                Conversion.points_charged,
                Conversion.error_message,
                Conversion.created_at,
                Conversion.updated_at,
                Conversion.output_filename,
            )
        )
        .order_by(Conversion.created_at.desc(), Conversion.id.desc())
        .limit(limit)
        .all()
    )
    return ConversionHistoryResponse(items=[_build_history_item(item) for item in items], limit=limit)


@router.get("/history", response_model=ConversionHistoryResponse)
def get_conversion_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=200),
    user_id: Optional[int] = Query(None),
) -> ConversionHistoryResponse:
    query = db.query(Conversion)

    if current_user.role == RoleEnum.super_user:
        if user_id is not None:
            query = query.filter(Conversion.owner_user_id == user_id)
    else:
        query = query.filter(Conversion.owner_user_id == current_user.id)

    items = (
        query.options(
            load_only(
                Conversion.id,
                Conversion.owner_user_id,
                Conversion.action,
                Conversion.input_filename,
                Conversion.status,
                Conversion.points_charged,
                Conversion.error_message,
                Conversion.created_at,
                Conversion.updated_at,
                Conversion.output_filename,
            )
        )
        .order_by(Conversion.created_at.desc(), Conversion.id.desc())
        .limit(limit)
        .all()
    )
    return ConversionHistoryResponse(items=[_build_history_item(item) for item in items], limit=limit)


@router.get("/remove-background/files/history", response_model=ConversionHistoryResponse)
def get_remove_background_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=200),
    user_id: Optional[int] = Query(None),
) -> ConversionHistoryResponse:
    return _get_action_history("remove_background", db, current_user, limit, user_id)


@router.get("/pdf-to-excel/files/history", response_model=ConversionHistoryResponse)
def get_pdf_to_excel_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=200),
    user_id: Optional[int] = Query(None),
) -> ConversionHistoryResponse:
    return _get_action_history("pdf_to_excel", db, current_user, limit, user_id)


@router.get("/pdf-to-word/files/history", response_model=ConversionHistoryResponse)
def get_pdf_to_word_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=200),
    user_id: Optional[int] = Query(None),
) -> ConversionHistoryResponse:
    return _get_action_history("pdf_to_docs", db, current_user, limit, user_id)


@router.get("/docx-to-pdf/files/history", response_model=ConversionHistoryResponse)
def get_docx_to_pdf_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=200),
    user_id: Optional[int] = Query(None),
) -> ConversionHistoryResponse:
    return _get_action_history("docx_to_pdf", db, current_user, limit, user_id)


@router.get("/excel-to-pdf/files/history", response_model=ConversionHistoryResponse)
def get_excel_to_pdf_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=200),
    user_id: Optional[int] = Query(None),
) -> ConversionHistoryResponse:
    return _get_action_history("excel_to_pdf", db, current_user, limit, user_id)


@router.get("/image-to-pdf/files/history", response_model=ConversionHistoryResponse)
def get_image_to_pdf_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=200),
    user_id: Optional[int] = Query(None),
) -> ConversionHistoryResponse:
    return _get_action_history("image_to_pdf", db, current_user, limit, user_id)


@router.get("/remove-pages-from-pdf/files/history", response_model=ConversionHistoryResponse)
def get_remove_pages_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=200),
    user_id: Optional[int] = Query(None),
) -> ConversionHistoryResponse:
    return _get_action_history("pdf_page_remove", db, current_user, limit, user_id)


@router.get("/{conversion_id}", response_model=ConversionStatusResponse)
def get_conversion_status(
    conversion_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ConversionStatusResponse:
    conversion = _query_owned_conversion(db, current_user, conversion_id)
    return _build_status_response(db, current_user, conversion)


@router.delete("/{conversion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversion(
    conversion_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversion = _query_owned_conversion(db, current_user, conversion_id)
    require_owner(conversion.owner_user_id, current_user)

    if conversion.output_filename:
        file_path = Path(conversion.output_filename)
        if file_path.exists() and file_path.is_file():
            file_path.unlink()

    db.delete(conversion)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{conversion_id}/download")
def download_conversion(
    conversion_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversion = _query_owned_conversion(db, current_user, conversion_id)
    require_owner(conversion.owner_user_id, current_user)

    if conversion.status != "success" or not conversion.output_filename:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    file_path = Path(conversion.output_filename)
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    original_stem = Path(conversion.input_filename).stem or "converted"
    download_name = f"{original_stem}{file_path.suffix}"

    return FileResponse(
        path=str(file_path),
        media_type=_media_type_for_suffix(file_path.suffix),
        filename=download_name,
        headers={"Content-Disposition": f'attachment; filename="{download_name}"'},
    )


@router.post("/pdf-to-excel", response_model=ConversionCreateResponse)
async def upload_pdf(
    request: Request,
    response: Response,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    action = "pdf_to_excel"
    charge_result = None
    conversion: Optional[Conversion] = None
    temp_pdf_path: Optional[str] = None

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

        _, output_path = _new_private_output(pdf_to_excel_file_manager, ".xlsx")
        conversion = _create_conversion_row(
            db,
            current_user,
            action,
            file.filename or "upload.pdf",
            charge_result.request_id,
        )

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            temp_pdf.write(content)
            temp_pdf_path = temp_pdf.name

        success, error_msg = pdf_to_excel_converter.convert_pdf_to_excel(temp_pdf_path, output_path)
        if not success:
            if current_user.role != RoleEnum.super_user:
                refund_points(db, current_user.id, action, charge_result.request_id)
            conversion.status = "failed"
            conversion.error_message = error_msg or "Conversion failed"
            conversion.points_charged = 0
            db.commit()

            result = ConversionCreateResponse(
                conversion_id=conversion.id,
                status="failed",
                download_url=None,
                points_charged=0,
                remaining_balance=get_user_balance(db, current_user.id) if current_user.role != RoleEnum.super_user else None,
            )
            if current_user.role != RoleEnum.super_user:
                record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
            return result

        points_charged = POINTS_COST_PER_REQUEST if current_user.role != RoleEnum.super_user else 0
        conversion.status = "success"
        conversion.output_filename = output_path
        conversion.error_message = None
        conversion.points_charged = points_charged
        db.commit()

        result = ConversionCreateResponse(
            conversion_id=conversion.id,
            status="success",
            download_url=f"/api/v3/conversions/{conversion.id}/download",
            points_charged=points_charged,
            remaining_balance=get_user_balance(db, current_user.id) if current_user.role != RoleEnum.super_user else None,
        )
        if current_user.role != RoleEnum.super_user:
            record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
        return result
    except (HTTPException, ConversionNotPermittedError, InsufficientPointsError):
        raise
    except Exception as exc:
        if current_user.role != RoleEnum.super_user and charge_result and charge_result.charged:
            refund_points(db, current_user.id, action, charge_result.request_id)
        if conversion:
            conversion.status = "failed"
            conversion.error_message = str(exc)
            conversion.points_charged = 0
            db.commit()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(exc)}")
    finally:
        if temp_pdf_path and os.path.exists(temp_pdf_path):
            os.unlink(temp_pdf_path)


@router.post("/pdf-to-word", response_model=ConversionCreateResponse)
async def upload_pdf_for_docs(
    request: Request,
    response: Response,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    action = "pdf_to_docs"
    charge_result = None
    conversion: Optional[Conversion] = None

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

        conversion = _create_conversion_row(
            db,
            current_user,
            action,
            file.filename or "upload.pdf",
            charge_result.request_id,
        )

        points_charged = POINTS_COST_PER_REQUEST if current_user.role != RoleEnum.super_user else 0
        result = ConversionCreateResponse(
            conversion_id=conversion.id,
            status="processing",
            download_url=None,
            points_charged=points_charged,
            remaining_balance=get_user_balance(db, current_user.id) if current_user.role != RoleEnum.super_user else None,
        )
        if current_user.role != RoleEnum.super_user:
            record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())

        background_tasks.add_task(
            _process_pdf_to_word_background,
            conversion.id,
            current_user.id,
            current_user.role == RoleEnum.super_user,
            charge_result.request_id,
            content,
        )
        return result
    except (HTTPException, ConversionNotPermittedError, InsufficientPointsError):
        raise
    except Exception as exc:
        if current_user.role != RoleEnum.super_user and charge_result and charge_result.charged:
            refund_points(db, current_user.id, action, charge_result.request_id)
        if conversion:
            conversion.status = "failed"
            conversion.error_message = str(exc)
            conversion.points_charged = 0
            db.commit()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(exc)}")


@router.post("/docx-to-pdf", response_model=ConversionCreateResponse)
async def upload_docx_for_pdf(
    request: Request,
    response: Response,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    action = "docx_to_pdf"
    charge_result = None
    conversion: Optional[Conversion] = None
    temp_docx_path: Optional[str] = None

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

        _, output_path = _new_private_output(docx_to_pdf_file_manager, ".pdf")
        conversion = _create_conversion_row(
            db,
            current_user,
            action,
            file.filename or "upload.docx",
            charge_result.request_id,
        )

        with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as temp_docx:
            temp_docx.write(content)
            temp_docx_path = temp_docx.name

        success, error_msg = docx_to_pdf_converter.convert_docx_to_pdf(temp_docx_path, output_path)
        if not success:
            if current_user.role != RoleEnum.super_user:
                refund_points(db, current_user.id, action, charge_result.request_id)
            conversion.status = "failed"
            conversion.error_message = error_msg or "Conversion failed"
            conversion.points_charged = 0
            db.commit()

            result = ConversionCreateResponse(
                conversion_id=conversion.id,
                status="failed",
                download_url=None,
                points_charged=0,
                remaining_balance=get_user_balance(db, current_user.id) if current_user.role != RoleEnum.super_user else None,
            )
            if current_user.role != RoleEnum.super_user:
                record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
            return result

        points_charged = POINTS_COST_PER_REQUEST if current_user.role != RoleEnum.super_user else 0
        conversion.status = "success"
        conversion.output_filename = output_path
        conversion.error_message = None
        conversion.points_charged = points_charged
        db.commit()

        result = ConversionCreateResponse(
            conversion_id=conversion.id,
            status="success",
            download_url=f"/api/v3/conversions/{conversion.id}/download",
            points_charged=points_charged,
            remaining_balance=get_user_balance(db, current_user.id) if current_user.role != RoleEnum.super_user else None,
        )
        if current_user.role != RoleEnum.super_user:
            record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
        return result
    except (HTTPException, ConversionNotPermittedError, InsufficientPointsError):
        raise
    except Exception as exc:
        if current_user.role != RoleEnum.super_user and charge_result and charge_result.charged:
            refund_points(db, current_user.id, action, charge_result.request_id)
        if conversion:
            conversion.status = "failed"
            conversion.error_message = str(exc)
            conversion.points_charged = 0
            db.commit()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(exc)}")
    finally:
        if temp_docx_path and os.path.exists(temp_docx_path):
            os.unlink(temp_docx_path)


@router.post("/excel-to-pdf", response_model=ConversionCreateResponse)
async def upload_excel_for_pdf(
    request: Request,
    response: Response,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    action = "excel_to_pdf"
    charge_result = None
    conversion: Optional[Conversion] = None
    temp_excel_path: Optional[str] = None

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

        _, output_path = _new_private_output(excel_to_pdf_file_manager, ".pdf")
        conversion = _create_conversion_row(
            db,
            current_user,
            action,
            file.filename or "upload.xlsx",
            charge_result.request_id,
        )

        suffix = os.path.splitext(file.filename or "")[1].lower() or ".xlsx"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_excel:
            temp_excel.write(content)
            temp_excel_path = temp_excel.name

        success, error_msg = excel_to_pdf_converter.convert_excel_to_pdf(temp_excel_path, output_path)
        if not success:
            if current_user.role != RoleEnum.super_user:
                refund_points(db, current_user.id, action, charge_result.request_id)
            conversion.status = "failed"
            conversion.error_message = error_msg or "Conversion failed"
            conversion.points_charged = 0
            db.commit()

            result = ConversionCreateResponse(
                conversion_id=conversion.id,
                status="failed",
                download_url=None,
                points_charged=0,
                remaining_balance=get_user_balance(db, current_user.id) if current_user.role != RoleEnum.super_user else None,
            )
            if current_user.role != RoleEnum.super_user:
                record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
            return result

        points_charged = POINTS_COST_PER_REQUEST if current_user.role != RoleEnum.super_user else 0
        conversion.status = "success"
        conversion.output_filename = output_path
        conversion.error_message = None
        conversion.points_charged = points_charged
        db.commit()

        result = ConversionCreateResponse(
            conversion_id=conversion.id,
            status="success",
            download_url=f"/api/v3/conversions/{conversion.id}/download",
            points_charged=points_charged,
            remaining_balance=get_user_balance(db, current_user.id) if current_user.role != RoleEnum.super_user else None,
        )
        if current_user.role != RoleEnum.super_user:
            record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
        return result
    except (HTTPException, ConversionNotPermittedError, InsufficientPointsError):
        raise
    except Exception as exc:
        if current_user.role != RoleEnum.super_user and charge_result and charge_result.charged:
            refund_points(db, current_user.id, action, charge_result.request_id)
        if conversion:
            conversion.status = "failed"
            conversion.error_message = str(exc)
            conversion.points_charged = 0
            db.commit()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(exc)}")
    finally:
        if temp_excel_path and os.path.exists(temp_excel_path):
            os.unlink(temp_excel_path)


@router.post("/image-to-pdf", response_model=ConversionCreateResponse)
async def upload_image_for_pdf(
    request: Request,
    response: Response,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    action = "image_to_pdf"
    charge_result = None
    conversion: Optional[Conversion] = None
    temp_image_path: Optional[str] = None

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

        _, output_path = _new_private_output(image_to_pdf_file_manager, ".pdf")
        conversion = _create_conversion_row(
            db,
            current_user,
            action,
            file.filename or "upload.png",
            charge_result.request_id,
        )

        suffix = os.path.splitext(file.filename or "")[1].lower() or ".png"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_image:
            temp_image.write(content)
            temp_image_path = temp_image.name

        success, error_msg = image_to_pdf_converter.convert_image_to_pdf(temp_image_path, output_path)
        if not success:
            if current_user.role != RoleEnum.super_user:
                refund_points(db, current_user.id, action, charge_result.request_id)
            conversion.status = "failed"
            conversion.error_message = error_msg or "Conversion failed"
            conversion.points_charged = 0
            db.commit()

            result = ConversionCreateResponse(
                conversion_id=conversion.id,
                status="failed",
                download_url=None,
                points_charged=0,
                remaining_balance=get_user_balance(db, current_user.id) if current_user.role != RoleEnum.super_user else None,
            )
            if current_user.role != RoleEnum.super_user:
                record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
            return result

        points_charged = POINTS_COST_PER_REQUEST if current_user.role != RoleEnum.super_user else 0
        conversion.status = "success"
        conversion.output_filename = output_path
        conversion.error_message = None
        conversion.points_charged = points_charged
        db.commit()

        result = ConversionCreateResponse(
            conversion_id=conversion.id,
            status="success",
            download_url=f"/api/v3/conversions/{conversion.id}/download",
            points_charged=points_charged,
            remaining_balance=get_user_balance(db, current_user.id) if current_user.role != RoleEnum.super_user else None,
        )
        if current_user.role != RoleEnum.super_user:
            record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
        return result
    except (HTTPException, ConversionNotPermittedError, InsufficientPointsError):
        raise
    except Exception as exc:
        if current_user.role != RoleEnum.super_user and charge_result and charge_result.charged:
            refund_points(db, current_user.id, action, charge_result.request_id)
        if conversion:
            conversion.status = "failed"
            conversion.error_message = str(exc)
            conversion.points_charged = 0
            db.commit()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(exc)}")
    finally:
        if temp_image_path and os.path.exists(temp_image_path):
            os.unlink(temp_image_path)


@router.post("/remove-pages-from-pdf", response_model=ConversionCreateResponse)
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
    charge_result = None
    conversion: Optional[Conversion] = None
    temp_pdf_path: Optional[str] = None

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

        _, output_path = _new_private_output(pdf_page_remove_file_manager, ".pdf")
        conversion = _create_conversion_row(
            db,
            current_user,
            action,
            file.filename or "upload.pdf",
            charge_result.request_id,
        )

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            temp_pdf.write(content)
            temp_pdf_path = temp_pdf.name

        success, error_msg = pdf_page_remover.remove_pages(
            temp_pdf_path,
            output_path,
            pages_spec=pages,
            remove_blank=remove_blank,
        )
        if not success:
            if current_user.role != RoleEnum.super_user:
                refund_points(db, current_user.id, action, charge_result.request_id)
            conversion.status = "failed"
            conversion.error_message = error_msg or "Page removal failed"
            conversion.points_charged = 0
            db.commit()

            result = ConversionCreateResponse(
                conversion_id=conversion.id,
                status="failed",
                download_url=None,
                points_charged=0,
                remaining_balance=get_user_balance(db, current_user.id) if current_user.role != RoleEnum.super_user else None,
            )
            if current_user.role != RoleEnum.super_user:
                record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
            return result

        points_charged = POINTS_COST_PER_REQUEST if current_user.role != RoleEnum.super_user else 0
        conversion.status = "success"
        conversion.output_filename = output_path
        conversion.error_message = None
        conversion.points_charged = points_charged
        db.commit()

        result = ConversionCreateResponse(
            conversion_id=conversion.id,
            status="success",
            download_url=f"/api/v3/conversions/{conversion.id}/download",
            points_charged=points_charged,
            remaining_balance=get_user_balance(db, current_user.id) if current_user.role != RoleEnum.super_user else None,
        )
        if current_user.role != RoleEnum.super_user:
            record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
        return result
    except (HTTPException, ConversionNotPermittedError, InsufficientPointsError):
        raise
    except Exception as exc:
        if current_user.role != RoleEnum.super_user and charge_result and charge_result.charged:
            refund_points(db, current_user.id, action, charge_result.request_id)
        if conversion:
            conversion.status = "failed"
            conversion.error_message = str(exc)
            conversion.points_charged = 0
            db.commit()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(exc)}")
    finally:
        if temp_pdf_path and os.path.exists(temp_pdf_path):
            os.unlink(temp_pdf_path)


@router.post("/remove-background", response_model=ConversionCreateResponse)
async def remove_background(
    request: Request,
    response: Response,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    action = "remove_background"
    charge_result = None
    conversion: Optional[Conversion] = None
    temp_image_path: Optional[str] = None

    try:
        is_valid, error_message = await remove_background_file_manager.validate_image_file(file)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_message)

        content = await file.read()
        await file.seek(0)
        early_response, charge_result = _enforce_access(
            db, current_user, action, request, file, response, len(content)
        )
        if early_response:
            return early_response

        _, output_path = _new_private_output(remove_background_file_manager, ".png")
        conversion = _create_conversion_row(
            db,
            current_user,
            action,
            file.filename or "upload.png",
            charge_result.request_id,
        )

        suffix = os.path.splitext(file.filename or "")[1].lower() or ".png"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_image:
            temp_image.write(content)
            temp_image_path = temp_image.name

        success, error_msg = background_remover.remove_background(temp_image_path, output_path)
        if not success:
            if current_user.role != RoleEnum.super_user:
                refund_points(db, current_user.id, action, charge_result.request_id)
            conversion.status = "failed"
            conversion.error_message = error_msg or "Background removal failed"
            conversion.points_charged = 0
            db.commit()

            result = ConversionCreateResponse(
                conversion_id=conversion.id,
                status="failed",
                download_url=None,
                points_charged=0,
                remaining_balance=get_user_balance(db, current_user.id) if current_user.role != RoleEnum.super_user else None,
            )
            if current_user.role != RoleEnum.super_user:
                record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
            return result

        points_charged = POINTS_COST_PER_REQUEST if current_user.role != RoleEnum.super_user else 0
        conversion.status = "success"
        conversion.output_filename = output_path
        conversion.error_message = None
        conversion.points_charged = points_charged
        db.commit()

        result = ConversionCreateResponse(
            conversion_id=conversion.id,
            status="success",
            download_url=f"/api/v3/conversions/{conversion.id}/download",
            points_charged=points_charged,
            remaining_balance=get_user_balance(db, current_user.id) if current_user.role != RoleEnum.super_user else None,
        )
        if current_user.role != RoleEnum.super_user:
            record_conversion_result(db, current_user.id, action, charge_result.request_id, result.model_dump())
        return result
    except (HTTPException, ConversionNotPermittedError, InsufficientPointsError):
        raise
    except Exception as exc:
        if current_user.role != RoleEnum.super_user and charge_result and charge_result.charged:
            refund_points(db, current_user.id, action, charge_result.request_id)
        if conversion:
            conversion.status = "failed"
            conversion.error_message = str(exc)
            conversion.points_charged = 0
            db.commit()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(exc)}")
    finally:
        if temp_image_path and os.path.exists(temp_image_path):
            os.unlink(temp_image_path)
