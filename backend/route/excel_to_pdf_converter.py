"""
Excel to PDF Converter route endpoints
"""
import os
import tempfile

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from models.schemas import ConversionResponse, FileListResponse
from services.excel_to_pdf_converter import ExcelToPDFConverterService
from services.file_manager import FileManagerService


router = APIRouter(prefix="/v1/conversions/excel-to-pdf", tags=["Excel to PDF"])

file_manager = FileManagerService(storage_dir="static/excelToPdf")
excel_to_pdf_converter = ExcelToPDFConverterService()


@router.post("", response_model=ConversionResponse)
async def upload_excel_for_pdf(file: UploadFile = File(...)):
    """Upload and convert Excel file to PDF"""
    try:
        is_valid, error_message = await file_manager.validate_excel_file(file)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_message)

        output_filename = file_manager.generate_unique_filename(file.filename, output_extension=".pdf")
        output_path = str(file_manager.storage_dir / output_filename)

        suffix = os.path.splitext(file.filename)[1].lower() or ".xlsx"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_excel:
            content = await file.read()
            temp_excel.write(content)
            temp_excel_path = temp_excel.name

        try:
            success, error_msg = excel_to_pdf_converter.convert_excel_to_pdf(temp_excel_path, output_path)

            if not success:
                return ConversionResponse(
                    success=False,
                    message=error_msg or "Conversion failed",
                    filename=None,
                    download_url=None,
                )

            download_url = f"/v1/conversions/excel-to-pdf/files/{output_filename}"
            return ConversionResponse(
                success=True,
                message="Excel converted successfully",
                filename=output_filename,
                download_url=download_url,
            )
        finally:
            if os.path.exists(temp_excel_path):
                os.unlink(temp_excel_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/files", response_model=FileListResponse)
async def list_pdf_files():
    """List all converted PDF files"""
    try:
        files = file_manager.list_converted_files(file_extension=".pdf")
        return FileListResponse(files=files, total_count=len(files))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list files: {str(e)}")


@router.get("/files/{filename}")
async def download_pdf_file(filename: str):
    """Download a converted PDF file"""
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
