from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


class FileMetadata(BaseModel):
    """Metadata for a converted file"""
    filename: str = Field(..., description="Unique filename for the converted file")
    original_name: str = Field(..., description="Original uploaded filename")
    conversion_date: datetime = Field(..., description="Date and time of conversion")
    file_size: int = Field(..., gt=0, description="File size in bytes")
    status: str = Field(..., description="Conversion status: success, failed, or processing")
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v: str) -> str:
        """Validate that status is one of the allowed values"""
        allowed_statuses = ['success', 'failed', 'processing']
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of {allowed_statuses}")
        return v
    
    @field_validator('filename', 'original_name')
    @classmethod
    def validate_filename(cls, v: str) -> str:
        """Validate filename is not empty and doesn't contain path traversal"""
        if not v or not v.strip():
            raise ValueError("Filename cannot be empty")
        if '..' in v or '/' in v or '\\' in v:
            raise ValueError("Filename cannot contain path traversal characters")
        return v


class ConversionResponse(BaseModel):
    """Response for PDF to Excel conversion"""
    success: bool = Field(..., description="Whether the conversion was successful")
    message: str = Field(..., description="Status message or error description")
    filename: Optional[str] = Field(None, description="Generated filename for the converted file")
    download_url: Optional[str] = Field(None, description="URL to download the converted file")
    
    @field_validator('message')
    @classmethod
    def validate_message(cls, v: str) -> str:
        """Validate message is not empty"""
        if not v or not v.strip():
            raise ValueError("Message cannot be empty")
        return v


class FileListResponse(BaseModel):
    """Response containing list of converted files"""
    files: List[FileMetadata] = Field(default_factory=list, description="List of file metadata")
    total_count: int = Field(..., ge=0, description="Total number of files")
    
    @field_validator('total_count')
    @classmethod
    def validate_total_count_matches_files(cls, v: int, info) -> int:
        """Validate that total_count matches the length of files list"""
        files = info.data.get('files', [])
        if v != len(files):
            raise ValueError(f"total_count ({v}) must match the number of files ({len(files)})")
        return v


# Validation constants for file upload (Requirements 1.4, 1.5)
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10MB
ALLOWED_FILE_TYPES = ['application/pdf']
ALLOWED_FILE_EXTENSIONS = ['.pdf']
