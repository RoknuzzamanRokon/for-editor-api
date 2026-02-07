"""
Unit tests for FileManagerService
"""
import os
import pytest
from pathlib import Path
from datetime import datetime
from io import BytesIO
from fastapi import UploadFile

from services.file_manager import FileManagerService
from models.schemas import MAX_FILE_SIZE_BYTES


@pytest.fixture
def file_manager():
    """Create FileManagerService instance with test directory"""
    test_dir = "backend/tests/test_storage"
    service = FileManagerService(storage_dir=test_dir)
    yield service
    # Cleanup test directory
    if Path(test_dir).exists():
        for file in Path(test_dir).glob("*"):
            file.unlink()
        Path(test_dir).rmdir()


@pytest.fixture
def valid_pdf_content():
    """Create valid PDF content with magic number"""
    return b'%PDF-1.4\n%\xE2\xE3\xCF\xD3\nSome PDF content here'


@pytest.fixture
def invalid_file_content():
    """Create invalid file content (not a PDF)"""
    return b'This is not a PDF file'


class TestFileValidation:
    """Tests for file validation functionality"""
    
    def test_validate_pdf_file_type_valid(self, file_manager, valid_pdf_content):
        """Test validation of valid PDF file type"""
        result = file_manager.validate_pdf_file_type(valid_pdf_content)
        assert result is True
    
    def test_validate_pdf_file_type_invalid(self, file_manager, invalid_file_content):
        """Test validation rejects non-PDF files"""
        result = file_manager.validate_pdf_file_type(invalid_file_content)
        assert result is False
    
    def test_validate_pdf_file_type_empty(self, file_manager):
        """Test validation rejects empty content"""
        result = file_manager.validate_pdf_file_type(b'')
        assert result is False
    
    def test_validate_file_size_valid(self, file_manager):
        """Test validation of valid file size"""
        valid_size = 5 * 1024 * 1024  # 5MB
        result = file_manager.validate_file_size(valid_size)
        assert result is True
    
    def test_validate_file_size_at_limit(self, file_manager):
        """Test validation at exactly 10MB limit"""
        result = file_manager.validate_file_size(MAX_FILE_SIZE_BYTES)
        assert result is True
    
    def test_validate_file_size_exceeds_limit(self, file_manager):
        """Test validation rejects files over 10MB"""
        oversized = MAX_FILE_SIZE_BYTES + 1
        result = file_manager.validate_file_size(oversized)
        assert result is False
    
    def test_validate_file_size_zero(self, file_manager):
        """Test validation rejects zero-size files"""
        result = file_manager.validate_file_size(0)
        assert result is False
    
    def test_validate_file_size_negative(self, file_manager):
        """Test validation rejects negative file sizes"""
        result = file_manager.validate_file_size(-100)
        assert result is False
    
    @pytest.mark.anyio
    async def test_validate_pdf_file_valid(self, file_manager, valid_pdf_content):
        """Test full validation of valid PDF file"""
        file = UploadFile(
            filename="test.pdf",
            file=BytesIO(valid_pdf_content)
        )
        
        is_valid, error_msg = await file_manager.validate_pdf_file(file)
        
        assert is_valid is True
        assert error_msg is None
    
    @pytest.mark.anyio
    async def test_validate_pdf_file_invalid_extension(self, file_manager, valid_pdf_content):
        """Test validation rejects non-PDF extension"""
        file = UploadFile(
            filename="test.txt",
            file=BytesIO(valid_pdf_content)
        )
        
        is_valid, error_msg = await file_manager.validate_pdf_file(file)
        
        assert is_valid is False
        assert error_msg == "Only PDF files are accepted"
    
    @pytest.mark.anyio
    async def test_validate_pdf_file_invalid_magic_number(self, file_manager, invalid_file_content):
        """Test validation rejects files without PDF magic number"""
        file = UploadFile(
            filename="test.pdf",
            file=BytesIO(invalid_file_content)
        )
        
        is_valid, error_msg = await file_manager.validate_pdf_file(file)
        
        assert is_valid is False
        assert error_msg == "Only PDF files are accepted"
    
    @pytest.mark.anyio
    async def test_validate_pdf_file_empty(self, file_manager):
        """Test validation rejects empty files"""
        file = UploadFile(
            filename="test.pdf",
            file=BytesIO(b'')
        )
        
        is_valid, error_msg = await file_manager.validate_pdf_file(file)
        
        assert is_valid is False
        assert error_msg == "File is empty"
    
    @pytest.mark.anyio
    async def test_validate_pdf_file_oversized(self, file_manager):
        """Test validation rejects files over 10MB"""
        # Create oversized PDF content
        oversized_content = b'%PDF-1.4\n' + b'x' * (MAX_FILE_SIZE_BYTES + 1)
        
        file = UploadFile(
            filename="test.pdf",
            file=BytesIO(oversized_content)
        )
        
        is_valid, error_msg = await file_manager.validate_pdf_file(file)
        
        assert is_valid is False
        assert error_msg == "File size exceeds 10MB limit"
    
    @pytest.mark.anyio
    async def test_validate_pdf_file_no_filename(self, file_manager, valid_pdf_content):
        """Test validation rejects files without filename"""
        file = UploadFile(
            filename=None,
            file=BytesIO(valid_pdf_content)
        )
        
        is_valid, error_msg = await file_manager.validate_pdf_file(file)
        
        assert is_valid is False
        assert error_msg == "Only PDF files are accepted"


class TestFilenameGeneration:
    """Tests for unique filename generation"""
    
    def test_generate_unique_filename_basic(self, file_manager):
        """Test generation of unique filename"""
        original = "invoice.pdf"
        result = file_manager.generate_unique_filename(original)
        
        assert result.startswith("invoice_")
        assert result.endswith(".xlsx")
        assert len(result.split('_')) >= 3  # name_timestamp_uuid
    
    def test_generate_unique_filename_with_spaces(self, file_manager):
        """Test filename generation with spaces"""
        original = "my document.pdf"
        result = file_manager.generate_unique_filename(original)
        
        assert result.startswith("my_document_")
        assert " " not in result
        assert result.endswith(".xlsx")
    
    def test_generate_unique_filename_special_chars(self, file_manager):
        """Test filename generation removes special characters"""
        original = "file@#$%name!.pdf"
        result = file_manager.generate_unique_filename(original)
        
        assert "@" not in result
        assert "#" not in result
        assert "!" not in result
        assert result.endswith(".xlsx")
    
    def test_generate_unique_filename_empty_name(self, file_manager):
        """Test filename generation with empty name"""
        original = ".pdf"
        result = file_manager.generate_unique_filename(original)
        
        assert result.startswith("converted_")
        assert result.endswith(".xlsx")
    
    def test_generate_unique_filename_uniqueness(self, file_manager):
        """Test that generated filenames are unique"""
        original = "test.pdf"
        result1 = file_manager.generate_unique_filename(original)
        result2 = file_manager.generate_unique_filename(original)
        
        assert result1 != result2


class TestFileSaving:
    """Tests for file saving and retrieval"""
    
    @pytest.mark.anyio
    async def test_save_uploaded_file(self, file_manager, valid_pdf_content):
        """Test saving uploaded file"""
        file = UploadFile(
            filename="test.pdf",
            file=BytesIO(valid_pdf_content)
        )
        
        filename = "test_file.xlsx"
        result_path = await file_manager.save_uploaded_file(file, filename)
        
        assert Path(result_path).exists()
        assert Path(result_path).name == filename
        
        # Verify content
        with open(result_path, 'rb') as f:
            content = f.read()
        assert content == valid_pdf_content
    
    def test_get_file_path_exists(self, file_manager):
        """Test retrieving path for existing file"""
        # Create a test file
        test_file = file_manager.storage_dir / "test.xlsx"
        test_file.write_text("test content")
        
        result = file_manager.get_file_path("test.xlsx")
        
        assert result is not None
        assert Path(result).exists()
        assert Path(result).name == "test.xlsx"
    
    def test_get_file_path_not_exists(self, file_manager):
        """Test retrieving path for non-existent file"""
        result = file_manager.get_file_path("nonexistent.xlsx")
        
        assert result is None
    
    def test_get_file_path_path_traversal(self, file_manager):
        """Test that path traversal is prevented"""
        result = file_manager.get_file_path("../../../etc/passwd")
        
        assert result is None
    
    def test_get_file_path_with_slash(self, file_manager):
        """Test that filenames with slashes are rejected"""
        result = file_manager.get_file_path("subdir/file.xlsx")
        
        assert result is None


class TestFileListin:
    """Tests for file listing functionality"""
    
    def test_list_converted_files_empty(self, file_manager):
        """Test listing files in empty directory"""
        result = file_manager.list_converted_files()
        
        assert isinstance(result, list)
        assert len(result) == 0
    
    def test_list_converted_files_single(self, file_manager):
        """Test listing single file"""
        # Create a test file
        test_file = file_manager.storage_dir / "test_20260207_123456_abc123.xlsx"
        test_file.write_text("test content")
        
        result = file_manager.list_converted_files()
        
        assert len(result) == 1
        assert result[0].filename == "test_20260207_123456_abc123.xlsx"
        assert result[0].original_name == "test"
        assert result[0].status == "success"
        assert result[0].file_size > 0
    
    def test_list_converted_files_multiple(self, file_manager):
        """Test listing multiple files"""
        # Create multiple test files
        for i in range(3):
            test_file = file_manager.storage_dir / f"file{i}_20260207_12345{i}_abc12{i}.xlsx"
            test_file.write_text(f"test content {i}")
        
        result = file_manager.list_converted_files()
        
        assert len(result) == 3
    
    def test_list_converted_files_ignores_non_xlsx(self, file_manager):
        """Test that non-xlsx files are ignored"""
        # Create xlsx and non-xlsx files
        xlsx_file = file_manager.storage_dir / "test.xlsx"
        xlsx_file.write_text("xlsx content")
        
        txt_file = file_manager.storage_dir / "test.txt"
        txt_file.write_text("txt content")
        
        result = file_manager.list_converted_files()
        
        assert len(result) == 1
        assert result[0].filename == "test.xlsx"
    
    def test_list_converted_files_sorted_by_date(self, file_manager):
        """Test that files are sorted by date (newest first)"""
        import time
        
        # Create files with different timestamps
        file1 = file_manager.storage_dir / "old_file.xlsx"
        file1.write_text("old")
        
        time.sleep(0.1)
        
        file2 = file_manager.storage_dir / "new_file.xlsx"
        file2.write_text("new")
        
        result = file_manager.list_converted_files()
        
        assert len(result) == 2
        # Newest file should be first
        assert result[0].filename == "new_file.xlsx"
        assert result[1].filename == "old_file.xlsx"
    
    def test_extract_original_name_standard(self, file_manager):
        """Test extracting original name from standard filename"""
        filename = "invoice_20260207_123456_abc123.xlsx"
        result = file_manager._extract_original_name(filename)
        
        assert result == "invoice"
    
    def test_extract_original_name_with_underscores(self, file_manager):
        """Test extracting original name with underscores"""
        filename = "my_document_name_20260207_123456_abc123.xlsx"
        result = file_manager._extract_original_name(filename)
        
        assert result == "my_document_name"
    
    def test_extract_original_name_short(self, file_manager):
        """Test extracting original name from short filename"""
        filename = "file.xlsx"
        result = file_manager._extract_original_name(filename)
        
        assert result == "file"


class TestStorageDirectoryCreation:
    """Tests for automatic storage directory creation"""
    
    def test_storage_directory_created_on_init(self):
        """Test that storage directory is created automatically when FileManagerService is initialized"""
        test_dir = "backend/tests/test_storage_init"
        
        # Ensure directory doesn't exist before test
        if Path(test_dir).exists():
            Path(test_dir).rmdir()
        
        assert not Path(test_dir).exists()
        
        # Initialize FileManagerService
        service = FileManagerService(storage_dir=test_dir)
        
        # Verify directory was created
        assert Path(test_dir).exists()
        assert Path(test_dir).is_dir()
        
        # Cleanup
        Path(test_dir).rmdir()
    
    def test_storage_directory_with_parent_directories(self):
        """Test that parent directories are created if they don't exist"""
        test_dir = "backend/tests/nested/parent/child/storage"
        
        # Ensure directory doesn't exist before test
        if Path(test_dir).exists():
            # Remove all nested directories
            import shutil
            shutil.rmtree("backend/tests/nested")
        
        assert not Path(test_dir).exists()
        assert not Path("backend/tests/nested").exists()
        
        # Initialize FileManagerService
        service = FileManagerService(storage_dir=test_dir)
        
        # Verify all parent directories were created
        assert Path(test_dir).exists()
        assert Path(test_dir).is_dir()
        assert Path("backend/tests/nested").exists()
        assert Path("backend/tests/nested/parent").exists()
        assert Path("backend/tests/nested/parent/child").exists()
        
        # Cleanup
        import shutil
        shutil.rmtree("backend/tests/nested")
    
    def test_storage_directory_already_exists(self):
        """Test that initialization works when directory already exists"""
        test_dir = "backend/tests/test_storage_existing"
        
        # Create directory before initialization
        Path(test_dir).mkdir(parents=True, exist_ok=True)
        assert Path(test_dir).exists()
        
        # Initialize FileManagerService - should not raise error
        service = FileManagerService(storage_dir=test_dir)
        
        # Verify directory still exists
        assert Path(test_dir).exists()
        assert Path(test_dir).is_dir()
        
        # Cleanup
        Path(test_dir).rmdir()
    
    def test_pdfToDocs_directory_creation(self):
        """Test that static/pdfToDocs directory is created for docs converter"""
        test_dir = "backend/tests/test_pdfToDocs"
        
        # Ensure directory doesn't exist before test
        if Path(test_dir).exists():
            Path(test_dir).rmdir()
        
        assert not Path(test_dir).exists()
        
        # Initialize FileManagerService with pdfToDocs directory
        service = FileManagerService(storage_dir=test_dir)
        
        # Verify directory was created
        assert Path(test_dir).exists()
        assert Path(test_dir).is_dir()
        
        # Cleanup
        Path(test_dir).rmdir()


class TestMultipleExtensionSupport:
    """Tests for multiple file extension support"""
    
    def test_generate_unique_filename_with_docx_extension(self, file_manager):
        """Test generation of unique filename with .docx extension"""
        original = "document.pdf"
        result = file_manager.generate_unique_filename(original, output_extension=".docx")
        
        assert result.startswith("document_")
        assert result.endswith(".docx")
        assert len(result.split('_')) >= 3  # name_timestamp_uuid
    
    def test_generate_unique_filename_with_xlsx_extension_explicit(self, file_manager):
        """Test generation of unique filename with explicit .xlsx extension"""
        original = "spreadsheet.pdf"
        result = file_manager.generate_unique_filename(original, output_extension=".xlsx")
        
        assert result.startswith("spreadsheet_")
        assert result.endswith(".xlsx")
    
    def test_generate_unique_filename_default_extension(self, file_manager):
        """Test that default extension is .xlsx when not specified"""
        original = "file.pdf"
        result = file_manager.generate_unique_filename(original)
        
        assert result.endswith(".xlsx")
    
    def test_generate_unique_filename_extension_without_dot(self, file_manager):
        """Test that extension without leading dot is handled correctly"""
        original = "document.pdf"
        result = file_manager.generate_unique_filename(original, output_extension="docx")
        
        assert result.endswith(".docx")
        assert ".." not in result  # Ensure no double dots
    
    def test_generate_unique_filename_custom_extension(self, file_manager):
        """Test generation with custom extension"""
        original = "file.pdf"
        result = file_manager.generate_unique_filename(original, output_extension=".txt")
        
        assert result.endswith(".txt")
    
    def test_list_converted_files_with_docx_extension(self, file_manager):
        """Test listing files with .docx extension"""
        # Create test files with different extensions
        docx_file = file_manager.storage_dir / "doc_20260207_123456_abc123.docx"
        docx_file.write_text("docx content")
        
        xlsx_file = file_manager.storage_dir / "sheet_20260207_123456_abc123.xlsx"
        xlsx_file.write_text("xlsx content")
        
        result = file_manager.list_converted_files(file_extension=".docx")
        
        assert len(result) == 1
        assert result[0].filename == "doc_20260207_123456_abc123.docx"
    
    def test_list_converted_files_with_xlsx_extension_explicit(self, file_manager):
        """Test listing files with explicit .xlsx extension"""
        # Create test files with different extensions
        docx_file = file_manager.storage_dir / "doc_20260207_123456_abc123.docx"
        docx_file.write_text("docx content")
        
        xlsx_file = file_manager.storage_dir / "sheet_20260207_123456_abc123.xlsx"
        xlsx_file.write_text("xlsx content")
        
        result = file_manager.list_converted_files(file_extension=".xlsx")
        
        assert len(result) == 1
        assert result[0].filename == "sheet_20260207_123456_abc123.xlsx"
    
    def test_list_converted_files_default_extension(self, file_manager):
        """Test that default extension filter is .xlsx"""
        # Create test files with different extensions
        docx_file = file_manager.storage_dir / "doc.docx"
        docx_file.write_text("docx content")
        
        xlsx_file = file_manager.storage_dir / "sheet.xlsx"
        xlsx_file.write_text("xlsx content")
        
        result = file_manager.list_converted_files()
        
        assert len(result) == 1
        assert result[0].filename == "sheet.xlsx"
    
    def test_list_converted_files_extension_without_dot(self, file_manager):
        """Test listing files with extension without leading dot"""
        docx_file = file_manager.storage_dir / "doc.docx"
        docx_file.write_text("docx content")
        
        result = file_manager.list_converted_files(file_extension="docx")
        
        assert len(result) == 1
        assert result[0].filename == "doc.docx"
    
    def test_list_converted_files_multiple_docx(self, file_manager):
        """Test listing multiple .docx files"""
        # Create multiple docx files
        for i in range(3):
            docx_file = file_manager.storage_dir / f"doc{i}_20260207_12345{i}_abc12{i}.docx"
            docx_file.write_text(f"docx content {i}")
        
        # Create xlsx file that should be ignored
        xlsx_file = file_manager.storage_dir / "sheet.xlsx"
        xlsx_file.write_text("xlsx content")
        
        result = file_manager.list_converted_files(file_extension=".docx")
        
        assert len(result) == 3
        for file_meta in result:
            assert file_meta.filename.endswith(".docx")
    
    def test_extract_original_name_from_docx(self, file_manager):
        """Test extracting original name from .docx filename"""
        filename = "report_20260207_123456_abc123.docx"
        result = file_manager._extract_original_name(filename)
        
        assert result == "report"
    
    def test_extract_original_name_from_xlsx(self, file_manager):
        """Test extracting original name from .xlsx filename"""
        filename = "spreadsheet_20260207_123456_abc123.xlsx"
        result = file_manager._extract_original_name(filename)
        
        assert result == "spreadsheet"
    
    def test_extract_original_name_with_underscores_docx(self, file_manager):
        """Test extracting original name with underscores from .docx"""
        filename = "my_long_document_name_20260207_123456_abc123.docx"
        result = file_manager._extract_original_name(filename)
        
        assert result == "my_long_document_name"
    
    def test_extract_original_name_generic_extension(self, file_manager):
        """Test extracting original name works with any extension"""
        filename = "file_20260207_123456_abc123.txt"
        result = file_manager._extract_original_name(filename)
        
        assert result == "file"
