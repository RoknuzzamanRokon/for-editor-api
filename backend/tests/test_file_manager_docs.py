"""
Unit tests for FileManagerService extensions for PDF to Docs conversion
Tests the extension parameter functionality for .docx files
"""
import pytest
from pathlib import Path
from datetime import datetime
import time

from services.file_manager import FileManagerService


@pytest.fixture
def docs_file_manager():
    """Create FileManagerService instance configured for docs conversion"""
    test_dir = "backend/tests/test_storage_docs"
    service = FileManagerService(storage_dir=test_dir)
    yield service
    # Cleanup test directory
    if Path(test_dir).exists():
        for file in Path(test_dir).glob("*"):
            file.unlink()
        Path(test_dir).rmdir()


class TestGenerateUniqueFilenameWithDocxExtension:
    """Tests for generating unique filenames with .docx extension
    Requirements: 2.7"""
    
    def test_generate_filename_with_docx_extension(self, docs_file_manager):
        """Test generation of unique filename with .docx extension"""
        original = "document.pdf"
        result = docs_file_manager.generate_unique_filename(original, output_extension=".docx")
        
        assert result.startswith("document_")
        assert result.endswith(".docx")
        assert len(result.split('_')) >= 3  # name_timestamp_uuid
    
    def test_generate_filename_docx_format(self, docs_file_manager):
        """Test that .docx filename follows correct format"""
        original = "report.pdf"
        result = docs_file_manager.generate_unique_filename(original, output_extension=".docx")
        
        # Should be: name_YYYYMMDD_HHMMSS_uuid.docx
        parts = result.rsplit('.', 1)
        assert parts[1] == "docx"
        
        name_parts = parts[0].split('_')
        assert len(name_parts) >= 3
        assert name_parts[0] == "report"
    
    def test_generate_filename_docx_with_spaces(self, docs_file_manager):
        """Test .docx filename generation with spaces in original name"""
        original = "my document.pdf"
        result = docs_file_manager.generate_unique_filename(original, output_extension=".docx")
        
        assert result.startswith("my_document_")
        assert " " not in result
        assert result.endswith(".docx")
    
    def test_generate_filename_docx_with_special_chars(self, docs_file_manager):
        """Test .docx filename generation removes special characters"""
        original = "file@#$%name!.pdf"
        result = docs_file_manager.generate_unique_filename(original, output_extension=".docx")
        
        assert "@" not in result
        assert "#" not in result
        assert "!" not in result
        assert result.endswith(".docx")
    
    def test_generate_filename_docx_uniqueness(self, docs_file_manager):
        """Test that generated .docx filenames are unique"""
        original = "test.pdf"
        result1 = docs_file_manager.generate_unique_filename(original, output_extension=".docx")
        result2 = docs_file_manager.generate_unique_filename(original, output_extension=".docx")
        
        assert result1 != result2
        assert result1.endswith(".docx")
        assert result2.endswith(".docx")
    
    def test_generate_filename_docx_without_leading_dot(self, docs_file_manager):
        """Test that extension without leading dot is handled correctly"""
        original = "document.pdf"
        result = docs_file_manager.generate_unique_filename(original, output_extension="docx")
        
        assert result.endswith(".docx")
        assert ".." not in result  # Ensure no double dots
    
    def test_generate_filename_docx_empty_name(self, docs_file_manager):
        """Test .docx filename generation with empty name"""
        original = ".pdf"
        result = docs_file_manager.generate_unique_filename(original, output_extension=".docx")
        
        assert result.startswith("converted_")
        assert result.endswith(".docx")


class TestListOnlyDocxFiles:
    """Tests for listing only .docx files
    Requirements: 4.2, 5.2"""
    
    def test_list_only_docx_files(self, docs_file_manager):
        """Test listing files filters to only .docx files"""
        # Create test files with different extensions
        docx_file = docs_file_manager.storage_dir / "doc_20260207_123456_abc123.docx"
        docx_file.write_text("docx content")
        
        xlsx_file = docs_file_manager.storage_dir / "sheet_20260207_123456_abc123.xlsx"
        xlsx_file.write_text("xlsx content")
        
        txt_file = docs_file_manager.storage_dir / "text.txt"
        txt_file.write_text("txt content")
        
        result = docs_file_manager.list_converted_files(file_extension=".docx")
        
        assert len(result) == 1
        assert result[0].filename == "doc_20260207_123456_abc123.docx"
        assert result[0].filename.endswith(".docx")
    
    def test_list_multiple_docx_files(self, docs_file_manager):
        """Test listing multiple .docx files"""
        # Create multiple docx files
        for i in range(3):
            docx_file = docs_file_manager.storage_dir / f"doc{i}_20260207_12345{i}_abc12{i}.docx"
            docx_file.write_text(f"docx content {i}")
        
        # Create xlsx file that should be ignored
        xlsx_file = docs_file_manager.storage_dir / "sheet.xlsx"
        xlsx_file.write_text("xlsx content")
        
        result = docs_file_manager.list_converted_files(file_extension=".docx")
        
        assert len(result) == 3
        for file_meta in result:
            assert file_meta.filename.endswith(".docx")
    
    def test_list_docx_files_empty_directory(self, docs_file_manager):
        """Test listing .docx files in empty directory"""
        result = docs_file_manager.list_converted_files(file_extension=".docx")
        
        assert isinstance(result, list)
        assert len(result) == 0
    
    def test_list_docx_files_no_docx_present(self, docs_file_manager):
        """Test listing .docx files when only other file types exist"""
        # Create only non-docx files
        xlsx_file = docs_file_manager.storage_dir / "sheet.xlsx"
        xlsx_file.write_text("xlsx content")
        
        txt_file = docs_file_manager.storage_dir / "text.txt"
        txt_file.write_text("txt content")
        
        result = docs_file_manager.list_converted_files(file_extension=".docx")
        
        assert len(result) == 0
    
    def test_list_docx_files_sorted_by_date(self, docs_file_manager):
        """Test that .docx files are sorted by date (newest first)"""
        # Create files with different timestamps
        file1 = docs_file_manager.storage_dir / "old_doc.docx"
        file1.write_text("old")
        
        time.sleep(0.1)
        
        file2 = docs_file_manager.storage_dir / "new_doc.docx"
        file2.write_text("new")
        
        result = docs_file_manager.list_converted_files(file_extension=".docx")
        
        assert len(result) == 2
        # Newest file should be first
        assert result[0].filename == "new_doc.docx"
        assert result[1].filename == "old_doc.docx"
    
    def test_list_docx_files_without_leading_dot(self, docs_file_manager):
        """Test listing .docx files with extension without leading dot"""
        docx_file = docs_file_manager.storage_dir / "doc.docx"
        docx_file.write_text("docx content")
        
        result = docs_file_manager.list_converted_files(file_extension="docx")
        
        assert len(result) == 1
        assert result[0].filename == "doc.docx"
    
    def test_list_docx_files_metadata(self, docs_file_manager):
        """Test that .docx file metadata is correctly populated"""
        docx_file = docs_file_manager.storage_dir / "report_20260207_123456_abc123.docx"
        docx_file.write_text("docx content")
        
        result = docs_file_manager.list_converted_files(file_extension=".docx")
        
        assert len(result) == 1
        metadata = result[0]
        assert metadata.filename == "report_20260207_123456_abc123.docx"
        assert metadata.original_name == "report"
        assert metadata.status == "success"
        assert metadata.file_size > 0
        assert isinstance(metadata.conversion_date, datetime)


class TestExtractOriginalNameFromDocxFilename:
    """Tests for extracting original name from .docx filenames
    Requirements: 2.7, 5.2"""
    
    def test_extract_original_name_from_docx(self, docs_file_manager):
        """Test extracting original name from .docx filename"""
        filename = "report_20260207_123456_abc123.docx"
        result = docs_file_manager._extract_original_name(filename)
        
        assert result == "report"
    
    def test_extract_original_name_from_docx_with_underscores(self, docs_file_manager):
        """Test extracting original name with underscores from .docx"""
        filename = "my_long_document_name_20260207_123456_abc123.docx"
        result = docs_file_manager._extract_original_name(filename)
        
        assert result == "my_long_document_name"
    
    def test_extract_original_name_from_docx_simple(self, docs_file_manager):
        """Test extracting original name from simple .docx filename"""
        filename = "invoice_20260207_143022_a1b2c3d4.docx"
        result = docs_file_manager._extract_original_name(filename)
        
        assert result == "invoice"
    
    def test_extract_original_name_from_docx_short(self, docs_file_manager):
        """Test extracting original name from short .docx filename"""
        filename = "file.docx"
        result = docs_file_manager._extract_original_name(filename)
        
        assert result == "file"
    
    def test_extract_original_name_from_docx_no_timestamp(self, docs_file_manager):
        """Test extracting original name from .docx without timestamp pattern"""
        filename = "simple_name.docx"
        result = docs_file_manager._extract_original_name(filename)
        
        assert result == "simple_name"


class TestExtensionParameterWorksForBothXlsxAndDocx:
    """Tests to verify extension parameter works correctly for both .xlsx and .docx
    Requirements: 2.7, 4.2, 5.2"""
    
    def test_generate_filename_xlsx_vs_docx(self, docs_file_manager):
        """Test that both .xlsx and .docx extensions work correctly"""
        original = "file.pdf"
        
        xlsx_result = docs_file_manager.generate_unique_filename(original, output_extension=".xlsx")
        docx_result = docs_file_manager.generate_unique_filename(original, output_extension=".docx")
        
        assert xlsx_result.endswith(".xlsx")
        assert docx_result.endswith(".docx")
        assert xlsx_result.startswith("file_")
        assert docx_result.startswith("file_")
    
    def test_list_files_xlsx_vs_docx_separation(self, docs_file_manager):
        """Test that .xlsx and .docx files are listed separately"""
        # Create both types of files
        xlsx_file = docs_file_manager.storage_dir / "sheet_20260207_123456_abc123.xlsx"
        xlsx_file.write_text("xlsx content")
        
        docx_file = docs_file_manager.storage_dir / "doc_20260207_123456_abc123.docx"
        docx_file.write_text("docx content")
        
        # List xlsx files
        xlsx_results = docs_file_manager.list_converted_files(file_extension=".xlsx")
        assert len(xlsx_results) == 1
        assert xlsx_results[0].filename.endswith(".xlsx")
        
        # List docx files
        docx_results = docs_file_manager.list_converted_files(file_extension=".docx")
        assert len(docx_results) == 1
        assert docx_results[0].filename.endswith(".docx")
    
    def test_extract_original_name_works_for_both_extensions(self, docs_file_manager):
        """Test that original name extraction works for both .xlsx and .docx"""
        xlsx_filename = "spreadsheet_20260207_123456_abc123.xlsx"
        docx_filename = "document_20260207_123456_abc123.docx"
        
        xlsx_result = docs_file_manager._extract_original_name(xlsx_filename)
        docx_result = docs_file_manager._extract_original_name(docx_filename)
        
        assert xlsx_result == "spreadsheet"
        assert docx_result == "document"
    
    def test_default_extension_is_xlsx(self, docs_file_manager):
        """Test that default extension is .xlsx when not specified"""
        original = "file.pdf"
        result = docs_file_manager.generate_unique_filename(original)
        
        assert result.endswith(".xlsx")
    
    def test_explicit_xlsx_extension(self, docs_file_manager):
        """Test explicit .xlsx extension parameter"""
        original = "spreadsheet.pdf"
        result = docs_file_manager.generate_unique_filename(original, output_extension=".xlsx")
        
        assert result.startswith("spreadsheet_")
        assert result.endswith(".xlsx")
    
    def test_explicit_docx_extension(self, docs_file_manager):
        """Test explicit .docx extension parameter"""
        original = "document.pdf"
        result = docs_file_manager.generate_unique_filename(original, output_extension=".docx")
        
        assert result.startswith("document_")
        assert result.endswith(".docx")
    
    def test_list_default_extension_is_xlsx(self, docs_file_manager):
        """Test that default list extension filter is .xlsx"""
        # Create both types of files
        docx_file = docs_file_manager.storage_dir / "doc.docx"
        docx_file.write_text("docx content")
        
        xlsx_file = docs_file_manager.storage_dir / "sheet.xlsx"
        xlsx_file.write_text("xlsx content")
        
        # List without specifying extension (should default to .xlsx)
        result = docs_file_manager.list_converted_files()
        
        assert len(result) == 1
        assert result[0].filename == "sheet.xlsx"
    
    def test_mixed_extensions_in_directory(self, docs_file_manager):
        """Test handling directory with mixed file extensions"""
        # Create files with various extensions
        docs_file_manager.storage_dir.joinpath("doc1.docx").write_text("docx 1")
        docs_file_manager.storage_dir.joinpath("doc2.docx").write_text("docx 2")
        docs_file_manager.storage_dir.joinpath("sheet1.xlsx").write_text("xlsx 1")
        docs_file_manager.storage_dir.joinpath("sheet2.xlsx").write_text("xlsx 2")
        docs_file_manager.storage_dir.joinpath("text.txt").write_text("txt")
        
        # Verify correct filtering
        docx_results = docs_file_manager.list_converted_files(file_extension=".docx")
        xlsx_results = docs_file_manager.list_converted_files(file_extension=".xlsx")
        
        assert len(docx_results) == 2
        assert len(xlsx_results) == 2
        assert all(f.filename.endswith(".docx") for f in docx_results)
        assert all(f.filename.endswith(".xlsx") for f in xlsx_results)
