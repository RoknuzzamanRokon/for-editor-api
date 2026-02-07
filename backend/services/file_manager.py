"""
File Manager Service for handling file operations
"""
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
from fastapi import UploadFile

from models.schemas import FileMetadata, MAX_FILE_SIZE_BYTES


class FileManagerService:
    """Service for managing file uploads, validation, and storage"""
    
    # PDF magic numbers (file signatures)
    PDF_MAGIC_NUMBERS = [
        b'%PDF-',  # Standard PDF signature
    ]
    
    def __init__(self, storage_dir: str = "backend/static/pdfToExcel"):
        """
        Initialize FileManagerService
        
        Args:
            storage_dir: Directory to store converted Excel files
        """
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)
    
    def validate_pdf_file_type(self, file_content: bytes) -> bool:
        """
        Validate that a file is a PDF using magic numbers
        
        Args:
            file_content: First few bytes of the file
            
        Returns:
            True if file is a valid PDF, False otherwise
            
        Requirements: 1.2, 1.4
        """
        if not file_content:
            return False
        
        # Check if file starts with any of the PDF magic numbers
        for magic in self.PDF_MAGIC_NUMBERS:
            if file_content.startswith(magic):
                return True
        
        return False
    
    def validate_file_size(self, file_size: int) -> bool:
        """
        Validate that file size is within allowed limit
        
        Args:
            file_size: Size of file in bytes
            
        Returns:
            True if file size is valid, False otherwise
            
        Requirements: 1.5
        """
        return 0 < file_size <= MAX_FILE_SIZE_BYTES
    
    async def validate_pdf_file(self, file: UploadFile) -> tuple[bool, Optional[str]]:
        """
        Validate uploaded PDF file (type and size)
        
        Args:
            file: Uploaded file object
            
        Returns:
            Tuple of (is_valid, error_message)
            
        Requirements: 1.2, 1.4, 1.5
        """
        # Check file extension
        if not file.filename or not file.filename.lower().endswith('.pdf'):
            return False, "Only PDF files are accepted"
        
        # Read the entire file to get size and content
        content = await file.read()
        await file.seek(0)  # Reset file pointer
        
        if not content:
            return False, "File is empty"
        
        # Check magic number
        if not self.validate_pdf_file_type(content):
            return False, "Only PDF files are accepted"
        
        # Check file size
        if not self.validate_file_size(len(content)):
            return False, "File size exceeds 10MB limit"
        
        return True, None
    
    def generate_unique_filename(self, original_filename: str) -> str:
        """
        Generate a unique filename with timestamp and UUID
        
        Args:
            original_filename: Original name of the uploaded file
            
        Returns:
            Unique filename in format: {name}_{timestamp}_{uuid}.xlsx
            
        Requirements: 2.5
        """
        # Extract base name without extension
        base_name = Path(original_filename).stem
        
        # Sanitize filename - remove special characters
        sanitized_name = "".join(
            c for c in base_name if c.isalnum() or c in (' ', '-', '_')
        ).strip()
        
        # Replace spaces with underscores
        sanitized_name = sanitized_name.replace(' ', '_')
        
        # If name is empty after sanitization or is just the extension, use default
        if not sanitized_name or sanitized_name.lower() in ['pdf', 'xlsx']:
            sanitized_name = "converted"
        
        # Generate timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Generate short UUID
        unique_id = str(uuid.uuid4())[:8]
        
        # Combine into unique filename
        unique_filename = f"{sanitized_name}_{timestamp}_{unique_id}.xlsx"
        
        return unique_filename
    
    async def save_uploaded_file(self, file: UploadFile, filename: str) -> str:
        """
        Save uploaded file to storage directory
        
        Args:
            file: Uploaded file object
            filename: Name to save the file as
            
        Returns:
            Full path to saved file
            
        Requirements: 2.5, 4.2
        """
        file_path = self.storage_dir / filename
        
        # Read file content
        content = await file.read()
        
        # Write to disk
        with open(file_path, 'wb') as f:
            f.write(content)
        
        return str(file_path)
    
    def get_file_path(self, filename: str) -> Optional[str]:
        """
        Get full path for a file in storage
        
        Args:
            filename: Name of the file
            
        Returns:
            Full path if file exists, None otherwise
            
        Requirements: 4.2
        """
        # Sanitize filename to prevent path traversal
        if '..' in filename or '/' in filename or '\\' in filename:
            return None
        
        file_path = self.storage_dir / filename
        
        if file_path.exists() and file_path.is_file():
            return str(file_path)
        
        return None
    
    def list_converted_files(self) -> List[FileMetadata]:
        """
        List all converted Excel files in storage directory
        
        Args:
            None
            
        Returns:
            List of FileMetadata objects for each file
            
        Requirements: 4.1, 4.2, 4.4
        """
        files = []
        
        # Scan directory for .xlsx files
        if not self.storage_dir.exists():
            return files
        
        for file_path in self.storage_dir.glob("*.xlsx"):
            if file_path.is_file():
                try:
                    # Get file stats
                    stat = file_path.stat()
                    
                    # Extract metadata
                    metadata = FileMetadata(
                        filename=file_path.name,
                        original_name=self._extract_original_name(file_path.name),
                        conversion_date=datetime.fromtimestamp(stat.st_mtime),
                        file_size=stat.st_size,
                        status='success'
                    )
                    
                    files.append(metadata)
                except Exception:
                    # Skip files that cause errors
                    continue
        
        # Sort by conversion date (newest first)
        files.sort(key=lambda x: x.conversion_date, reverse=True)
        
        return files
    
    def _extract_original_name(self, filename: str) -> str:
        """
        Extract original name from generated filename
        
        Args:
            filename: Generated filename (e.g., invoice_20260207_194943_abc12345.xlsx)
            
        Returns:
            Original name portion
        """
        # Remove .xlsx extension
        name_without_ext = filename.rsplit('.', 1)[0]
        
        # Split by underscore
        parts = name_without_ext.split('_')
        
        if len(parts) < 3:
            # Not enough parts to have timestamp and uuid
            return name_without_ext
        
        # The last part should be UUID (6-8 chars hex)
        # The second-to-last should be time (HHMMSS - 6 digits)
        # The third-to-last should be date (YYYYMMDD - 8 digits)
        
        # Check if last part looks like UUID (6-8 hex chars)
        if 6 <= len(parts[-1]) <= 8 and all(c in '0123456789abcdef' for c in parts[-1].lower()):
            # Check if second-to-last looks like time (6 digits)
            if len(parts) >= 2 and len(parts[-2]) == 6 and parts[-2].isdigit():
                # Check if third-to-last looks like date (8 digits)
                if len(parts) >= 3 and len(parts[-3]) == 8 and parts[-3].isdigit():
                    # Remove last three parts (date, time, uuid)
                    original_parts = parts[:-3]
                    if original_parts:
                        return '_'.join(original_parts)
        
        # Fallback: just return the name without extension
        return name_without_ext
