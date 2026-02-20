"""
Remove Background route endpoints
"""
import os
import tempfile

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from models.schemas import ConversionResponse, FileListResponse
from services.background_remover import BackgroundRemoverService
from services.file_manager import FileManagerService


router = APIRouter(prefix="/v1/conversions/remove-background", tags=["Remove Background"])

file_manager = FileManagerService(storage_dir="static/removeBackground")
background_remover = BackgroundRemoverService()


@router.post("", response_model=ConversionResponse)
async def remove_background_from_image(file: UploadFile = File(...)):
    """Upload an image and remove its background"""
    try:
        is_valid, error_message = await file_manager.validate_image_file(file)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_message)

        output_filename = file_manager.generate_unique_filename(file.filename, output_extension=".png")
        output_path = str(file_manager.storage_dir / output_filename)

        suffix = os.path.splitext(file.filename)[1].lower() or ".png"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_image:
            content = await file.read()
            temp_image.write(content)
            temp_image_path = temp_image.name

        try:
            success, error_msg = background_remover.remove_background(temp_image_path, output_path)

            if not success:
                return ConversionResponse(
                    success=False,
                    message=error_msg or "Background removal failed",
                    filename=None,
                    download_url=None,
                )

            download_url = f"/v1/conversions/remove-background/files/{output_filename}"
            return ConversionResponse(
                success=True,
                message="Background removed successfully",
                filename=output_filename,
                download_url=download_url,
            )
        finally:
            if os.path.exists(temp_image_path):
                os.unlink(temp_image_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/files", response_model=FileListResponse)
async def list_removed_background_files():
    """List all processed PNG files"""
    try:
        files = file_manager.list_converted_files(file_extension=".png")
        return FileListResponse(files=files, total_count=len(files))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list files: {str(e)}")


@router.get("/files/{filename}")
async def download_removed_background_file(filename: str):
    """Download a processed PNG file"""
    try:
        file_path = file_manager.get_file_path(filename)
        if not file_path:
            raise HTTPException(status_code=404, detail="File not found")

        original_name = file_manager._extract_original_name(filename)

        return FileResponse(
            path=file_path,
            media_type="image/png",
            filename=f"{original_name}.png",
            headers={"Content-Disposition": f'attachment; filename="{original_name}.png"'},
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download file: {str(e)}")
