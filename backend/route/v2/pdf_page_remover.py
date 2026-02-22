"""
Remove Pages from PDF route endpoints
"""
import os
import tempfile

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from models.schemas import ConversionResponse, FileListResponse
from services.file_manager import FileManagerService
from services.pdf_page_remover import PDFPageRemoverService


router = APIRouter(prefix="/conversions/remove-pages-from-pdf", tags=["Remove Pages from PDF"])

file_manager = FileManagerService(storage_dir="static/pdfPageRemove")
pdf_page_remover = PDFPageRemoverService()


@router.post("", response_model=ConversionResponse)
async def remove_pages_from_pdf(
    file: UploadFile = File(...),
    pages: str | None = Form(None),
    remove_blank: bool = Form(False),
):
    """Upload a PDF and remove selected and/or blank pages"""
    try:
        is_valid, error_message = await file_manager.validate_pdf_file(file)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_message)

        output_filename = file_manager.generate_unique_filename(file.filename, output_extension=".pdf")
        output_path = str(file_manager.storage_dir / output_filename)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            content = await file.read()
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
                return ConversionResponse(
                    success=False,
                    message=error_msg or "Page removal failed",
                    filename=None,
                    download_url=None,
                )

            download_url = f"/api/v1/conversions/remove-pages-from-pdf/files/{output_filename}"
            return ConversionResponse(
                success=True,
                message="PDF updated successfully",
                filename=output_filename,
                download_url=download_url,
            )
        finally:
            if os.path.exists(temp_pdf_path):
                os.unlink(temp_pdf_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/files", response_model=FileListResponse)
async def list_pdf_files():
    """List all updated PDF files"""
    try:
        files = file_manager.list_converted_files(file_extension=".pdf")
        return FileListResponse(files=files, total_count=len(files))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list files: {str(e)}")


@router.get("/files/{filename}")
async def download_pdf_file(filename: str):
    """Download a processed PDF file"""
    try:
        file_path = file_manager.get_file_path(filename)
        if not file_path:
            raise HTTPException(status_code=404, detail="File not found")

        original_name = file_manager._extract_original_name(filename)

        return FileResponse(
            path=file_path,
            media_type="application/pdf",
            filename=f"{original_name}.pdf",
            headers={"Content-Disposition": f'attachment; filename="{original_name}.pdf"'},
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download file: {str(e)}")
