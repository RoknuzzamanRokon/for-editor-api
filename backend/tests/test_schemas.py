import pytest
from datetime import datetime
from pydantic import ValidationError
from models.schemas import (
    FileMetadata,
    ConversionResponse,
    FileListResponse,
    MAX_FILE_SIZE_BYTES,
    ALLOWED_FILE_TYPES,
    ALLOWED_FILE_EXTENSIONS
)


class TestFileMetadata:
    """Test FileMetadata model validation"""
    
    def test_valid_file_metadata(self):
        """Test creating FileMetadata with valid data"""
        metadata = FileMetadata(
            filename="test_file.xlsx",
            original_name="original.pdf",
            conversion_date=datetime.now(),
            file_size=1024,
            status="success"
        )
        assert metadata.filename == "test_file.xlsx"
        assert metadata.original_name == "original.pdf"
        assert metadata.file_size == 1024
        assert metadata.status == "success"
    
    def test_invalid_status(self):
        """Test that invalid status raises ValidationError (Requirement 2.4)"""
        with pytest.raises(ValidationError) as exc_info:
            FileMetadata(
                filename="test.xlsx",
                original_name="test.pdf",
                conversion_date=datetime.now(),
                file_size=1024,
                status="invalid_status"
            )
        assert "Status must be one of" in str(exc_info.value)
    
    def test_valid_statuses(self):
        """Test all valid status values"""
        for status in ['success', 'failed', 'processing']:
            metadata = FileMetadata(
                filename="test.xlsx",
                original_name="test.pdf",
                conversion_date=datetime.now(),
                file_size=1024,
                status=status
            )
            assert metadata.status == status
    
    def test_empty_filename(self):
        """Test that empty filename raises ValidationError (Requirement 1.4)"""
        with pytest.raises(ValidationError) as exc_info:
            FileMetadata(
                filename="",
                original_name="test.pdf",
                conversion_date=datetime.now(),
                file_size=1024,
                status="success"
            )
        assert "Filename cannot be empty" in str(exc_info.value)
    
    def test_filename_with_path_traversal(self):
        """Test that filename with path traversal raises ValidationError (Requirement 3.4)"""
        invalid_filenames = ["../test.xlsx", "test/../file.xlsx", "test/file.xlsx", "test\\file.xlsx"]
        for invalid_filename in invalid_filenames:
            with pytest.raises(ValidationError) as exc_info:
                FileMetadata(
                    filename=invalid_filename,
                    original_name="test.pdf",
                    conversion_date=datetime.now(),
                    file_size=1024,
                    status="success"
                )
            assert "path traversal" in str(exc_info.value).lower()
    
    def test_negative_file_size(self):
        """Test that negative file size raises ValidationError (Requirement 1.5)"""
        with pytest.raises(ValidationError) as exc_info:
            FileMetadata(
                filename="test.xlsx",
                original_name="test.pdf",
                conversion_date=datetime.now(),
                file_size=-100,
                status="success"
            )
        assert "greater than 0" in str(exc_info.value).lower()
    
    def test_zero_file_size(self):
        """Test that zero file size raises ValidationError (Requirement 1.5)"""
        with pytest.raises(ValidationError) as exc_info:
            FileMetadata(
                filename="test.xlsx",
                original_name="test.pdf",
                conversion_date=datetime.now(),
                file_size=0,
                status="success"
            )
        assert "greater than 0" in str(exc_info.value).lower()


class TestConversionResponse:
    """Test ConversionResponse model validation"""
    
    def test_valid_success_response(self):
        """Test creating successful ConversionResponse"""
        response = ConversionResponse(
            success=True,
            message="Conversion completed successfully",
            filename="converted_file.xlsx",
            download_url="/download/converted_file.xlsx"
        )
        assert response.success is True
        assert response.message == "Conversion completed successfully"
        assert response.filename == "converted_file.xlsx"
        assert response.download_url == "/download/converted_file.xlsx"
    
    def test_valid_error_response(self):
        """Test creating error ConversionResponse (Requirement 2.4)"""
        response = ConversionResponse(
            success=False,
            message="Failed to parse PDF file",
            filename=None,
            download_url=None
        )
        assert response.success is False
        assert response.message == "Failed to parse PDF file"
        assert response.filename is None
        assert response.download_url is None
    
    def test_empty_message(self):
        """Test that empty message raises ValidationError (Requirement 2.4)"""
        with pytest.raises(ValidationError) as exc_info:
            ConversionResponse(
                success=True,
                message="",
                filename="test.xlsx"
            )
        assert "Message cannot be empty" in str(exc_info.value)
    
    def test_optional_fields(self):
        """Test that filename and download_url are optional"""
        response = ConversionResponse(
            success=False,
            message="Error occurred"
        )
        assert response.filename is None
        assert response.download_url is None


class TestFileListResponse:
    """Test FileListResponse model validation"""
    
    def test_valid_file_list_response(self):
        """Test creating FileListResponse with files"""
        files = [
            FileMetadata(
                filename="file1.xlsx",
                original_name="file1.pdf",
                conversion_date=datetime.now(),
                file_size=1024,
                status="success"
            ),
            FileMetadata(
                filename="file2.xlsx",
                original_name="file2.pdf",
                conversion_date=datetime.now(),
                file_size=2048,
                status="success"
            )
        ]
        response = FileListResponse(files=files, total_count=2)
        assert len(response.files) == 2
        assert response.total_count == 2
    
    def test_empty_file_list(self):
        """Test creating FileListResponse with no files"""
        response = FileListResponse(files=[], total_count=0)
        assert len(response.files) == 0
        assert response.total_count == 0
    
    def test_mismatched_total_count(self):
        """Test that mismatched total_count raises ValidationError"""
        files = [
            FileMetadata(
                filename="file1.xlsx",
                original_name="file1.pdf",
                conversion_date=datetime.now(),
                file_size=1024,
                status="success"
            )
        ]
        with pytest.raises(ValidationError) as exc_info:
            FileListResponse(files=files, total_count=5)
        assert "must match the number of files" in str(exc_info.value)
    
    def test_negative_total_count(self):
        """Test that negative total_count raises ValidationError"""
        with pytest.raises(ValidationError) as exc_info:
            FileListResponse(files=[], total_count=-1)
        assert "greater than or equal to 0" in str(exc_info.value).lower()


class TestValidationConstants:
    """Test validation constants for file upload (Requirements 1.4, 1.5)"""
    
    def test_max_file_size_constant(self):
        """Test MAX_FILE_SIZE_BYTES is set to 10MB"""
        assert MAX_FILE_SIZE_BYTES == 10 * 1024 * 1024
    
    def test_allowed_file_types_constant(self):
        """Test ALLOWED_FILE_TYPES contains PDF mime type"""
        assert 'application/pdf' in ALLOWED_FILE_TYPES
    
    def test_allowed_file_extensions_constant(self):
        """Test ALLOWED_FILE_EXTENSIONS contains .pdf"""
        assert '.pdf' in ALLOWED_FILE_EXTENSIONS
