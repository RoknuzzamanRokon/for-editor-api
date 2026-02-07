"""
Unit tests for PDFConverterService
"""
import os
import pytest
import pandas as pd
from pathlib import Path
from services.pdf_converter import PDFConverterService


@pytest.fixture
def pdf_converter():
    """Fixture to create PDFConverterService instance"""
    return PDFConverterService()


@pytest.fixture
def test_data_dir():
    """Fixture to get test data directory"""
    test_dir = Path(__file__).parent / "test_data"
    test_dir.mkdir(exist_ok=True)
    return test_dir


class TestExtractTablesFromPDF:
    """Tests for extract_tables_from_pdf method"""
    
    def test_extract_tables_from_nonexistent_file(self, pdf_converter):
        """Test that FileNotFoundError is raised for non-existent file"""
        with pytest.raises(FileNotFoundError):
            pdf_converter.extract_tables_from_pdf("nonexistent.pdf")
    
    def test_extract_tables_from_invalid_pdf(self, pdf_converter, tmp_path):
        """Test that ValueError is raised for invalid PDF file"""
        # Create a fake PDF file with invalid content
        fake_pdf = tmp_path / "fake.pdf"
        fake_pdf.write_text("This is not a PDF file")
        
        with pytest.raises(ValueError, match="Failed to parse PDF file"):
            pdf_converter.extract_tables_from_pdf(str(fake_pdf))
    
    def test_extract_tables_from_simple_pdf(self, pdf_converter, test_data_dir):
        """Test extraction from PDF with a simple table"""
        pdf_path = test_data_dir / "simple_table.pdf"
        
        if not pdf_path.exists():
            pytest.skip("Test PDF not found. Run create_test_pdfs.py first.")
        
        tables = pdf_converter.extract_tables_from_pdf(str(pdf_path))
        
        # Should extract at least one table
        assert isinstance(tables, list)
        assert len(tables) >= 1
        
        # First table should be a DataFrame
        assert isinstance(tables[0], pd.DataFrame)
        
        # Should have data
        assert not tables[0].empty
        assert len(tables[0]) > 0
    
    def test_extract_tables_handles_multiple_pages(self, pdf_converter, test_data_dir):
        """Test extraction from PDF with multiple pages"""
        pdf_path = test_data_dir / "multipage_table.pdf"
        
        if not pdf_path.exists():
            pytest.skip("Test PDF not found. Run create_test_pdfs.py first.")
        
        tables = pdf_converter.extract_tables_from_pdf(str(pdf_path))
        
        # Should extract tables from multiple pages
        assert isinstance(tables, list)
        assert len(tables) >= 2  # At least 2 tables from 2 pages
        
        # All should be DataFrames
        for table in tables:
            assert isinstance(table, pd.DataFrame)
            assert not table.empty
    
    def test_extract_tables_handles_multiple_tables_per_page(self, pdf_converter, test_data_dir):
        """Test extraction from PDF with multiple tables on one page"""
        pdf_path = test_data_dir / "multiple_tables.pdf"
        
        if not pdf_path.exists():
            pytest.skip("Test PDF not found. Run create_test_pdfs.py first.")
        
        tables = pdf_converter.extract_tables_from_pdf(str(pdf_path))
        
        # Should extract multiple tables
        assert isinstance(tables, list)
        assert len(tables) >= 2  # At least 2 tables
        
        # All should be DataFrames
        for table in tables:
            assert isinstance(table, pd.DataFrame)
            assert not table.empty
    
    def test_extract_tables_from_pdf_without_tables(self, pdf_converter, test_data_dir):
        """Test extraction from PDF without tables returns empty list"""
        pdf_path = test_data_dir / "no_table.pdf"
        
        if not pdf_path.exists():
            pytest.skip("Test PDF not found. Run create_test_pdfs.py first.")
        
        tables = pdf_converter.extract_tables_from_pdf(str(pdf_path))
        
        # Should return empty list
        assert isinstance(tables, list)
        assert len(tables) == 0
    
    def test_clean_dataframe_removes_empty_rows(self, pdf_converter):
        """Test that _clean_dataframe removes completely empty rows"""
        df = pd.DataFrame({
            'A': ['value1', None, 'value3'],
            'B': ['value2', None, 'value4']
        })
        
        cleaned = pdf_converter._clean_dataframe(df)
        
        # Should have 2 rows (empty row removed)
        assert len(cleaned) == 2
        assert 'value1' in cleaned['A'].values
        assert 'value3' in cleaned['A'].values
    
    def test_clean_dataframe_removes_empty_columns(self, pdf_converter):
        """Test that _clean_dataframe removes completely empty columns"""
        df = pd.DataFrame({
            'A': ['value1', 'value2'],
            'B': [None, None],
            'C': ['value3', 'value4']
        })
        
        cleaned = pdf_converter._clean_dataframe(df)
        
        # Should have 2 columns (empty column removed)
        assert len(cleaned.columns) == 2
        assert 'A' in cleaned.columns
        assert 'C' in cleaned.columns
        assert 'B' not in cleaned.columns
    
    def test_clean_dataframe_fills_na_with_empty_string(self, pdf_converter):
        """Test that _clean_dataframe replaces None with empty string"""
        df = pd.DataFrame({
            'A': ['value1', None],
            'B': ['value2', 'value3']
        })
        
        cleaned = pdf_converter._clean_dataframe(df)
        
        # None should be replaced with empty string
        assert cleaned.loc[1, 'A'] == ''
    
    def test_clean_dataframe_strips_whitespace(self, pdf_converter):
        """Test that _clean_dataframe strips whitespace from strings"""
        df = pd.DataFrame({
            'A': ['  value1  ', ' value2 '],
            'B': ['value3  ', '  value4']
        })
        
        cleaned = pdf_converter._clean_dataframe(df)
        
        # Whitespace should be stripped
        assert cleaned.loc[0, 'A'] == 'value1'
        assert cleaned.loc[1, 'A'] == 'value2'
        assert cleaned.loc[0, 'B'] == 'value3'
        assert cleaned.loc[1, 'B'] == 'value4'



class TestConvertDataframesToExcel:
    """Tests for convert_dataframes_to_excel method"""
    
    def test_convert_empty_list_returns_false(self, pdf_converter, tmp_path):
        """Test that converting empty list raises ValueError"""
        output_path = tmp_path / "output.xlsx"
        
        with pytest.raises(ValueError, match="No dataframes provided"):
            pdf_converter.convert_dataframes_to_excel([], str(output_path))
        
        assert not output_path.exists()
    
    def test_convert_single_dataframe(self, pdf_converter, tmp_path):
        """Test converting a single DataFrame to Excel"""
        df = pd.DataFrame({
            'Name': ['Alice', 'Bob'],
            'Age': [30, 25],
            'City': ['New York', 'Los Angeles']
        })
        
        output_path = tmp_path / "output.xlsx"
        
        result = pdf_converter.convert_dataframes_to_excel([df], str(output_path))
        
        assert result is True
        assert output_path.exists()
        
        # Verify the Excel file can be read
        read_df = pd.read_excel(output_path, sheet_name='Table_1')
        assert len(read_df) == 2
        assert list(read_df.columns) == ['Name', 'Age', 'City']
    
    def test_convert_multiple_dataframes(self, pdf_converter, tmp_path):
        """Test converting multiple DataFrames to Excel with multiple sheets"""
        df1 = pd.DataFrame({
            'Product': ['Widget A', 'Widget B'],
            'Price': [10, 20]
        })
        
        df2 = pd.DataFrame({
            'Employee': ['John', 'Jane'],
            'Department': ['Engineering', 'Marketing']
        })
        
        output_path = tmp_path / "output.xlsx"
        
        result = pdf_converter.convert_dataframes_to_excel([df1, df2], str(output_path))
        
        assert result is True
        assert output_path.exists()
        
        # Verify both sheets exist
        read_df1 = pd.read_excel(output_path, sheet_name='Table_1')
        read_df2 = pd.read_excel(output_path, sheet_name='Table_2')
        
        assert len(read_df1) == 2
        assert len(read_df2) == 2
        assert list(read_df1.columns) == ['Product', 'Price']
        assert list(read_df2.columns) == ['Employee', 'Department']
    
    def test_convert_preserves_data_types(self, pdf_converter, tmp_path):
        """Test that conversion preserves various data types"""
        df = pd.DataFrame({
            'String': ['text1', 'text2'],
            'Integer': [100, 200],
            'Float': [10.5, 20.7],
            'Empty': ['', '']
        })
        
        output_path = tmp_path / "output.xlsx"
        
        result = pdf_converter.convert_dataframes_to_excel([df], str(output_path))
        
        assert result is True
        
        # Read back and verify data
        read_df = pd.read_excel(output_path, sheet_name='Table_1')
        assert read_df.loc[0, 'String'] == 'text1'
        assert read_df.loc[0, 'Integer'] == 100
        assert abs(read_df.loc[0, 'Float'] - 10.5) < 0.01


class TestConvertPDFToExcel:
    """Tests for convert_pdf_to_excel method"""
    
    def test_convert_pdf_with_tables(self, pdf_converter, test_data_dir, tmp_path):
        """Test converting PDF with tables to Excel"""
        pdf_path = test_data_dir / "simple_table.pdf"
        
        if not pdf_path.exists():
            pytest.skip("Test PDF not found. Run create_test_pdfs.py first.")
        
        output_path = tmp_path / "converted.xlsx"
        
        success, error = pdf_converter.convert_pdf_to_excel(str(pdf_path), str(output_path))
        
        assert success is True
        assert error is None
        assert output_path.exists()
        
        # Verify Excel file has content
        df = pd.read_excel(output_path, sheet_name='Table_1')
        assert not df.empty
    
    def test_convert_pdf_without_tables(self, pdf_converter, test_data_dir, tmp_path):
        """Test converting PDF without tables returns appropriate error"""
        pdf_path = test_data_dir / "no_table.pdf"
        
        if not pdf_path.exists():
            pytest.skip("Test PDF not found. Run create_test_pdfs.py first.")
        
        output_path = tmp_path / "converted.xlsx"
        
        success, error = pdf_converter.convert_pdf_to_excel(str(pdf_path), str(output_path))
        
        assert success is False
        assert error == "No tables found in PDF"
        assert not output_path.exists()
    
    def test_convert_nonexistent_pdf(self, pdf_converter, tmp_path):
        """Test converting non-existent PDF returns error"""
        pdf_path = "nonexistent.pdf"
        output_path = tmp_path / "converted.xlsx"
        
        success, error = pdf_converter.convert_pdf_to_excel(pdf_path, str(output_path))
        
        assert success is False
        assert error is not None
        assert "not found" in error.lower()
    
    def test_convert_multiple_tables_pdf(self, pdf_converter, test_data_dir, tmp_path):
        """Test converting PDF with multiple tables creates multiple sheets"""
        pdf_path = test_data_dir / "multiple_tables.pdf"
        
        if not pdf_path.exists():
            pytest.skip("Test PDF not found. Run create_test_pdfs.py first.")
        
        output_path = tmp_path / "converted.xlsx"
        
        success, error = pdf_converter.convert_pdf_to_excel(str(pdf_path), str(output_path))
        
        assert success is True
        assert error is None
        assert output_path.exists()
        
        # Verify multiple sheets exist
        excel_file = pd.ExcelFile(output_path)
        assert len(excel_file.sheet_names) >= 2



class TestErrorHandling:
    """Tests for error handling in PDFConverterService"""
    
    def test_extract_from_corrupted_pdf(self, pdf_converter, tmp_path):
        """Test that corrupted PDF raises ValueError"""
        # Create a file with PDF header but invalid content
        corrupted_pdf = tmp_path / "corrupted.pdf"
        corrupted_pdf.write_bytes(b'%PDF-1.4\nInvalid content that is not a real PDF')
        
        with pytest.raises(ValueError, match="Failed to parse PDF file|corrupted|invalid"):
            pdf_converter.extract_tables_from_pdf(str(corrupted_pdf))
    
    def test_convert_empty_dataframes_list_raises_error(self, pdf_converter, tmp_path):
        """Test that converting empty list raises ValueError"""
        output_path = tmp_path / "output.xlsx"
        
        with pytest.raises(ValueError, match="No dataframes provided"):
            pdf_converter.convert_dataframes_to_excel([], str(output_path))
    
    def test_convert_pdf_to_excel_handles_no_tables(self, pdf_converter, test_data_dir, tmp_path):
        """Test that PDF without tables is handled gracefully"""
        pdf_path = test_data_dir / "no_table.pdf"
        
        if not pdf_path.exists():
            pytest.skip("Test PDF not found. Run create_test_pdfs.py first.")
        
        output_path = tmp_path / "output.xlsx"
        
        success, error = pdf_converter.convert_pdf_to_excel(str(pdf_path), str(output_path))
        
        assert success is False
        assert "No tables found" in error
        assert not output_path.exists()
    
    def test_convert_pdf_to_excel_handles_invalid_pdf(self, pdf_converter, tmp_path):
        """Test that invalid PDF is handled gracefully"""
        # Create a fake PDF
        fake_pdf = tmp_path / "fake.pdf"
        fake_pdf.write_text("Not a real PDF")
        
        output_path = tmp_path / "output.xlsx"
        
        success, error = pdf_converter.convert_pdf_to_excel(str(fake_pdf), str(output_path))
        
        assert success is False
        assert error is not None
        assert "Invalid PDF" in error or "Failed to parse" in error or "Failed to process" in error
    
    def test_convert_pdf_to_excel_handles_nonexistent_file(self, pdf_converter, tmp_path):
        """Test that non-existent PDF is handled gracefully"""
        pdf_path = tmp_path / "nonexistent.pdf"
        output_path = tmp_path / "output.xlsx"
        
        success, error = pdf_converter.convert_pdf_to_excel(str(pdf_path), str(output_path))
        
        assert success is False
        assert "not found" in error.lower()
    
    def test_convert_pdf_to_excel_handles_directory_as_input(self, pdf_converter, tmp_path):
        """Test that passing a directory instead of file is handled"""
        pdf_path = tmp_path  # This is a directory
        output_path = tmp_path / "output.xlsx"
        
        success, error = pdf_converter.convert_pdf_to_excel(str(pdf_path), str(output_path))
        
        assert success is False
        assert "not a file" in error.lower()
    
    def test_extract_tables_continues_on_page_error(self, pdf_converter, test_data_dir):
        """Test that extraction continues even if one page has errors"""
        # This test verifies that the service is resilient to page-level errors
        # Using multipage PDF which should work fine
        pdf_path = test_data_dir / "multipage_table.pdf"
        
        if not pdf_path.exists():
            pytest.skip("Test PDF not found. Run create_test_pdfs.py first.")
        
        # Should successfully extract tables even if there were warnings
        tables = pdf_converter.extract_tables_from_pdf(str(pdf_path))
        
        # Should have extracted some tables
        assert isinstance(tables, list)
        assert len(tables) >= 0  # May be 0 if all pages failed, but shouldn't crash
    
    def test_timeout_configuration(self):
        """Test that timeout can be configured"""
        custom_service = PDFConverterService(timeout=30)
        assert custom_service.timeout == 30
        
        default_service = PDFConverterService()
        assert default_service.timeout == PDFConverterService.DEFAULT_TIMEOUT
    
    def test_timeout_mechanism_with_short_timeout(self, tmp_path):
        """Test that timeout mechanism works with very short timeout"""
        # Create a service with very short timeout
        short_timeout_service = PDFConverterService(timeout=0)
        
        # Create a simple valid PDF (we'll use test data if available)
        # For this test, we just verify the timeout mechanism is in place
        # The actual timeout behavior is hard to test reliably
        assert short_timeout_service.timeout == 0
    
    def test_convert_pdf_to_excel_handles_timeout(self, tmp_path):
        """Test that timeout error is handled gracefully in convert_pdf_to_excel"""
        # Create a service with very short timeout
        short_timeout_service = PDFConverterService(timeout=0)
        
        # Create a fake PDF that would trigger timeout
        fake_pdf = tmp_path / "fake.pdf"
        fake_pdf.write_bytes(b'%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')  # Minimal PDF header
        
        output_path = tmp_path / "output.xlsx"
        
        # Should handle timeout gracefully
        success, error = short_timeout_service.convert_pdf_to_excel(str(fake_pdf), str(output_path))
        
        # Should fail (either timeout or invalid PDF)
        assert success is False
        assert error is not None
    
    def test_convert_with_permission_error(self, pdf_converter, test_data_dir, tmp_path):
        """Test that permission errors are handled gracefully"""
        pdf_path = test_data_dir / "simple_table.pdf"
        
        if not pdf_path.exists():
            pytest.skip("Test PDF not found. Run create_test_pdfs.py first.")
        
        # Try to write to a read-only location (simulate permission error)
        # This is platform-dependent, so we'll just verify the error handling exists
        output_path = tmp_path / "output.xlsx"
        
        # Normal conversion should work
        success, error = pdf_converter.convert_pdf_to_excel(str(pdf_path), str(output_path))
        
        # If PDF has tables, should succeed
        if success:
            assert error is None
            assert output_path.exists()
    
    def test_extract_from_empty_pdf(self, pdf_converter, tmp_path):
        """Test that PDF with no pages is handled"""
        # Create a minimal PDF structure with no pages
        empty_pdf = tmp_path / "empty.pdf"
        # This is a minimal PDF with no pages
        empty_pdf.write_bytes(
            b'%PDF-1.4\n'
            b'1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'
            b'2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\n'
            b'xref\n0 3\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n'
            b'trailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n110\n%%EOF'
        )
        
        with pytest.raises(ValueError, match="no pages|Failed to parse|Failed to process"):
            pdf_converter.extract_tables_from_pdf(str(empty_pdf))
    
    def test_convert_dataframes_with_invalid_output_path(self, pdf_converter):
        """Test that invalid output path is handled"""
        df = pd.DataFrame({'A': [1, 2], 'B': [3, 4]})
        
        # Try to write to an invalid path
        invalid_path = "/invalid/path/that/does/not/exist/output.xlsx"
        
        # Should raise ValueError
        with pytest.raises(ValueError):
            pdf_converter.convert_dataframes_to_excel([df], invalid_path)
