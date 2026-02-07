"""
Docs Converter route endpoints for PDF to Word document conversion
"""
import os
import tempfile
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse

from models.schemas import ConversionResponse, FileListResponse
from services.file_manager import FileManagerService
from services.pdf_to_docs_converter import PDFToDocsConverterService


router = APIRouter(prefix="/v1/conversions/pdf-to-word", tags=["PDF to Word"])

# Initialize services with docs-specific storage directory
docs_file_manager = FileManagerService(storage_dir="static/pdfToDocs")
pdf_to_docs_converter = PDFToDocsConverterService()


@router.post("", response_model=ConversionResponse)
async def upload_pdf_for_docs(file: UploadFile = File(...)):
    """
    Upload and convert PDF file to Word document
    
    Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
    """
    try:
        # Validate the uploaded file
        is_valid, error_message = await docs_file_manager.validate_pdf_file(file)
        
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_message)
        
        # Generate unique filename for output Word document with .docx extension
        output_filename = docs_file_manager.generate_unique_filename(file.filename, output_extension=".docx")
        output_path = str(docs_file_manager.storage_dir / output_filename)
        
        # Save PDF to temporary file for processing
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_pdf:
            content = await file.read()
            temp_pdf.write(content)
            temp_pdf_path = temp_pdf.name
        
        try:
            # Convert PDF to Word document
            success, error_msg = pdf_to_docs_converter.convert_pdf_to_docx(temp_pdf_path, output_path)
            
            if not success:
                return ConversionResponse(
                    success=False,
                    message=error_msg or "Conversion failed",
                    filename=None,
                    download_url=None
                )
            
            # Generate download URL
            download_url = f"/v1/conversions/pdf-to-word/files/{output_filename}"
            
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
async def list_docs_files():
    """
    List all converted Word documents
    
    Requirements: 4.1, 4.2, 4.3, 4.4, 5.3
    """
    try:
        # Use FileManagerService to list all .docx files
        files = docs_file_manager.list_converted_files(file_extension=".docx")
        
        # Return FileListResponse with list of files and total count
        return FileListResponse(
            files=files,
            total_count=len(files)
        )
    
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail=f"Failed to list files: {str(e)}")


@router.get("/files/{filename}")
async def download_docs_file(filename: str):
    """
    Download a converted Word document
    
    Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
    """
    try:
        # Validate and get file path (prevents path traversal attacks)
        file_path = docs_file_manager.get_file_path(filename)
        
        if not file_path:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Extract original name for the download
        original_name = docs_file_manager._extract_original_name(filename)
        
        # Serve the file with appropriate headers
        return FileResponse(
            path=file_path,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=f"{original_name}.docx",
            headers={
                "Content-Disposition": f'attachment; filename="{original_name}.docx"'
            }
        )
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail=f"Failed to download file: {str(e)}")
