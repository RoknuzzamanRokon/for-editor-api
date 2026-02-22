"""
Excel Converter route endpoints for PDF to Excel conversion
"""
import os
import tempfile
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse

from models.schemas import ConversionResponse, FileListResponse
from services.file_manager import FileManagerService
from services.pdf_to_excel_converter import PDFToExcelConverterService


router = APIRouter(prefix="/conversions/pdf-to-excel", tags=["PDF to Excel"])

# Initialize services
file_manager = FileManagerService()
pdf_to_excel_converter = PDFToExcelConverterService()


@router.post("", response_model=ConversionResponse)
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload and convert PDF file to Excel
    
    Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5
    """
    try:
        # Validate the uploaded file
        is_valid, error_message = await file_manager.validate_pdf_file(file)
        
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_message)
        
        # Generate unique filename for output Excel file
        output_filename = file_manager.generate_unique_filename(file.filename)
        output_path = str(file_manager.storage_dir / output_filename)
        
        # Save PDF to temporary file for processing
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_pdf:
            content = await file.read()
            temp_pdf.write(content)
            temp_pdf_path = temp_pdf.name
        
        try:
            # Convert PDF to Excel
            success, error_msg = pdf_to_excel_converter.convert_pdf_to_excel(temp_pdf_path, output_path)
            
            if not success:
                return ConversionResponse(
                    success=False,
                    message=error_msg or "Conversion failed",
                    filename=None,
                    download_url=None
                )
            
            # Generate download URL
            download_url = f"/api/v1/conversions/pdf-to-excel/files/{output_filename}"
            
            return ConversionResponse(
                success=True,
                message="PDF converted successfully",
                filename=output_filename,
                download_url=download_url
            )
        
        finally:
            # Clean up temporary PDF file
            if os.path.exists(temp_pdf_path):
                os.unlink(temp_pdf_path)
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/files", response_model=FileListResponse)
async def list_files():
    """
    List all converted Excel files
    
    Requirements: 4.1, 4.2, 4.4
    """
    try:
        # Get list of converted files from file manager
        files = file_manager.list_converted_files()
        
        return FileListResponse(
            files=files,
            total_count=len(files)
        )
    
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail=f"Failed to list files: {str(e)}")


@router.get("/files/{filename}")
async def download_file(filename: str):
    """
    Download a converted Excel file
    
    Requirements: 3.1, 3.2, 3.3, 3.4, 4.3
    """
    try:
        # Validate and get file path
        file_path = file_manager.get_file_path(filename)
        
        if not file_path:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Extract original name for the download
        original_name = file_manager._extract_original_name(filename)
        
        # Serve the file with appropriate headers
        return FileResponse(
            path=file_path,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename=f"{original_name}.xlsx",
            headers={
                "Content-Disposition": f'attachment; filename="{original_name}.xlsx"'
            }
        )
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail=f"Failed to download file: {str(e)}")
