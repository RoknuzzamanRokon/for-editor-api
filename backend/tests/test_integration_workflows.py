"""
Integration tests for complete end-to-end workflows
Tests the full user journey from upload to download
"""
import os
import pytest
import pandas as pd
from pathlib import Path
from fastapi.testclient import TestClient
from main import app


client = TestClient(app)

# Test data directory
TEST_DATA_DIR = Path(__file__).parent / "test_data"


@pytest.fixture
def cleanup_test_files():
    """Fixture to clean up test files before and after tests"""
    storage_dir = Path("backend/static/pdfToExcel")
    
    # Clean up before test
    if storage_dir.exists():
        for file in storage_dir.glob("*.xlsx"):
            try:
                file.unlink()
            except:
                pass
    
    yield
    
    # Clean up after test
    if storage_dir.exists():
        for file in storage_dir.glob("*.xlsx"):
            try:
                file.unlink()
            except:
                pass


class TestEndToEndUploadAndConversion:
    """
    Test end-to-end upload and conversion flow
    Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.5
    """
    
    def test_complete_upload_conversion_workflow(self, cleanup_test_files):
        """Test the complete workflow: upload PDF -> convert -> verify Excel file"""
        # Step 1: Upload a PDF with tables
        pdf_path = TEST_DATA_DIR / "simple_table.pdf"
        
        with open(pdf_path, "rb") as f:
            upload_response = client.post(
                "/upload",
                files={"file": ("simple_table.pdf", f, "application/pdf")}
            )
        
        # Verify upload was successful
        assert upload_response.status_code == 200
        upload_data = upload_response.json()
        
        assert upload_data["success"] is True
        assert upload_data["message"] == "PDF converted successfully"
        assert upload_data["filename"] is not None
        assert upload_data["filename"].endswith(".xlsx")
        assert upload_data["download_url"] is not None
        
        # Step 2: Verify Excel file was created in correct location
        storage_dir = Path("backend/static/pdfToExcel")
        excel_file_path = storage_dir / upload_data["filename"]
        
        assert excel_file_path.exists(), "Excel file should be created in storage directory"
        assert excel_file_path.is_file(), "Excel file should be a file, not a directory"
        assert excel_file_path.stat().st_size > 0, "Excel file should not be empty"
        
        # Step 3: Verify Excel content matches PDF tables
        # Read the Excel file and verify it has the expected structure
        excel_data = pd.read_excel(excel_file_path, sheet_name='Table_1')
        
        assert not excel_data.empty, "Excel file should contain data"
        assert len(excel_data) > 0, "Excel file should have at least one row"
        assert len(excel_data.columns) > 0, "Excel file should have at least one column"

    def test_upload_multipage_pdf_preserves_all_tables(self, cleanup_test_files):
        """Test that multipage PDF conversion preserves all tables from all pages"""
        # Requirements: 2.1, 2.2, 2.3
        pdf_path = TEST_DATA_DIR / "multipage_table.pdf"
        
        with open(pdf_path, "rb") as f:
            upload_response = client.post(
                "/upload",
                files={"file": ("multipage_table.pdf", f, "application/pdf")}
            )
        
        assert upload_response.status_code == 200
        upload_data = upload_response.json()
        assert upload_data["success"] is True
        
        # Verify Excel file exists
        storage_dir = Path("backend/static/pdfToExcel")
        excel_file_path = storage_dir / upload_data["filename"]
        assert excel_file_path.exists()
        
        # Verify multiple sheets/tables were extracted
        excel_file = pd.ExcelFile(excel_file_path)
        assert len(excel_file.sheet_names) >= 1, "Should have at least one sheet"
        
        # Verify each sheet has data
        for sheet_name in excel_file.sheet_names:
            df = pd.read_excel(excel_file_path, sheet_name=sheet_name)
            assert not df.empty, f"Sheet {sheet_name} should contain data"
    
    def test_upload_multiple_tables_pdf_creates_multiple_sheets(self, cleanup_test_files):
        """Test that PDF with multiple tables creates multiple sheets in Excel"""
        # Requirements: 2.1, 2.2
        pdf_path = TEST_DATA_DIR / "multiple_tables.pdf"
        
        with open(pdf_path, "rb") as f:
            upload_response = client.post(
                "/upload",
                files={"file": ("multiple_tables.pdf", f, "application/pdf")}
            )
        
        assert upload_response.status_code == 200
        upload_data = upload_response.json()
        assert upload_data["success"] is True
        
        # Verify Excel file has multiple sheets
        storage_dir = Path("backend/static/pdfToExcel")
        excel_file_path = storage_dir / upload_data["filename"]
        
        excel_file = pd.ExcelFile(excel_file_path)
        assert len(excel_file.sheet_names) >= 2, "Should have at least 2 sheets for multiple tables"

    def test_unique_filename_generation_for_same_pdf(self, cleanup_test_files):
        """Test that uploading the same PDF multiple times generates unique filenames"""
        # Requirements: 2.5
        pdf_path = TEST_DATA_DIR / "simple_table.pdf"
        
        filenames = []
        
        # Upload the same PDF 3 times
        for i in range(3):
            with open(pdf_path, "rb") as f:
                upload_response = client.post(
                    "/upload",
                    files={"file": ("simple_table.pdf", f, "application/pdf")}
                )
            
            assert upload_response.status_code == 200
            upload_data = upload_response.json()
            assert upload_data["success"] is True
            
            filenames.append(upload_data["filename"])
        
        # Verify all filenames are unique
        assert len(filenames) == len(set(filenames)), "All filenames should be unique"
        
        # Verify all files exist
        storage_dir = Path("backend/static/pdfToExcel")
        for filename in filenames:
            excel_file_path = storage_dir / filename
            assert excel_file_path.exists(), f"File {filename} should exist"


class TestEndToEndDownloadFlow:
    """
    Test end-to-end download flow
    Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3
    """
    
    def test_complete_upload_list_download_workflow(self, cleanup_test_files):
        """Test the complete workflow: upload -> list files -> download"""
        # Step 1: Upload a PDF and convert it
        pdf_path = TEST_DATA_DIR / "simple_table.pdf"
        
        with open(pdf_path, "rb") as f:
            upload_response = client.post(
                "/upload",
                files={"file": ("test_invoice.pdf", f, "application/pdf")}
            )
        
        assert upload_response.status_code == 200
        upload_data = upload_response.json()
        assert upload_data["success"] is True
        
        uploaded_filename = upload_data["filename"]
        download_url = upload_data["download_url"]

        # Step 2: Verify file appears in file list
        list_response = client.get("/files")
        
        assert list_response.status_code == 200
        list_data = list_response.json()
        
        assert "files" in list_data
        assert "total_count" in list_data
        assert list_data["total_count"] > 0
        
        # Find our uploaded file in the list
        file_found = False
        file_metadata = None
        
        for file_info in list_data["files"]:
            if file_info["filename"] == uploaded_filename:
                file_found = True
                file_metadata = file_info
                break
        
        assert file_found, f"Uploaded file {uploaded_filename} should appear in file list"
        
        # Verify file metadata
        assert file_metadata["filename"] == uploaded_filename
        assert file_metadata["original_name"] is not None
        assert "test_invoice" in file_metadata["original_name"]
        assert file_metadata["conversion_date"] is not None
        assert file_metadata["file_size"] > 0
        assert file_metadata["status"] == "success"
        
        # Step 3: Download the file using the download URL
        download_response = client.get(download_url)
        
        assert download_response.status_code == 200
        assert download_response.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        assert "content-disposition" in download_response.headers
        assert "attachment" in download_response.headers["content-disposition"]
        assert "test_invoice" in download_response.headers["content-disposition"]
        assert ".xlsx" in download_response.headers["content-disposition"]
        
        # Verify downloaded content is not empty
        assert len(download_response.content) > 0
        
        # Verify downloaded content is a valid Excel file
        import io
        excel_content = io.BytesIO(download_response.content)
        df = pd.read_excel(excel_content, sheet_name='Table_1')
        assert not df.empty, "Downloaded Excel file should contain data"

    def test_download_preserves_original_filename(self, cleanup_test_files):
        """Test that downloaded file preserves the original filename"""
        # Requirements: 3.3
        pdf_path = TEST_DATA_DIR / "simple_table.pdf"
        
        # Upload with a specific filename
        with open(pdf_path, "rb") as f:
            upload_response = client.post(
                "/upload",
                files={"file": ("my_report_2026.pdf", f, "application/pdf")}
            )
        
        assert upload_response.status_code == 200
        upload_data = upload_response.json()
        
        # Download the file
        download_response = client.get(upload_data["download_url"])
        
        assert download_response.status_code == 200
        
        # Verify the content-disposition header contains the original name
        content_disposition = download_response.headers["content-disposition"]
        assert "my_report_2026" in content_disposition
        assert ".xlsx" in content_disposition
    
    def test_multiple_files_in_list(self, cleanup_test_files):
        """Test that multiple uploaded files all appear in the file list"""
        # Requirements: 4.1, 4.2
        pdf_path = TEST_DATA_DIR / "simple_table.pdf"
        
        uploaded_filenames = []
        
        # Upload 3 different files
        for i in range(3):
            with open(pdf_path, "rb") as f:
                upload_response = client.post(
                    "/upload",
                    files={"file": (f"document_{i}.pdf", f, "application/pdf")}
                )
            
            assert upload_response.status_code == 200
            upload_data = upload_response.json()
            uploaded_filenames.append(upload_data["filename"])
        
        # List all files
        list_response = client.get("/files")
        assert list_response.status_code == 200
        list_data = list_response.json()
        
        assert list_data["total_count"] >= 3
        
        # Verify all uploaded files are in the list
        listed_filenames = [f["filename"] for f in list_data["files"]]
        
        for filename in uploaded_filenames:
            assert filename in listed_filenames, f"File {filename} should be in the list"

    def test_download_directly_by_filename(self, cleanup_test_files):
        """Test downloading a file directly using its filename"""
        # Requirements: 3.1, 3.2, 4.3
        pdf_path = TEST_DATA_DIR / "simple_table.pdf"
        
        # Upload a file
        with open(pdf_path, "rb") as f:
            upload_response = client.post(
                "/upload",
                files={"file": ("report.pdf", f, "application/pdf")}
            )
        
        assert upload_response.status_code == 200
        filename = upload_response.json()["filename"]
        
        # Download using the filename directly
        download_response = client.get(f"/download/{filename}")
        
        assert download_response.status_code == 200
        assert len(download_response.content) > 0
        
        # Verify it's a valid Excel file
        import io
        excel_content = io.BytesIO(download_response.content)
        df = pd.read_excel(excel_content, sheet_name='Table_1')
        assert not df.empty


class TestErrorScenarios:
    """
    Test error scenarios in end-to-end workflows
    Requirements: 1.4, 1.5, 2.4, 3.4, 5.4
    """
    
    def test_upload_invalid_file_type_workflow(self, cleanup_test_files):
        """Test uploading a non-PDF file returns appropriate error"""
        # Requirements: 1.4, 5.4
        # Create a text file pretending to be a PDF
        fake_content = b"This is just a text file, not a PDF"
        
        upload_response = client.post(
            "/upload",
            files={"file": ("document.txt", fake_content, "text/plain")}
        )
        
        # Should return 400 Bad Request
        assert upload_response.status_code == 400
        error_data = upload_response.json()
        
        assert "detail" in error_data
        assert "Only PDF files are accepted" in error_data["detail"]
        
        # Verify no file was created
        storage_dir = Path("backend/static/pdfToExcel")
        if storage_dir.exists():
            excel_files = list(storage_dir.glob("*.xlsx"))
            # Should have no new files (or only pre-existing ones)
            assert len(excel_files) == 0

    def test_upload_oversized_file_workflow(self, cleanup_test_files):
        """Test uploading a file larger than 10MB returns appropriate error"""
        # Requirements: 1.5, 5.4
        # Create a fake PDF with more than 10MB of content
        large_content = b"%PDF-1.4\n" + b"x" * (11 * 1024 * 1024)  # 11MB
        
        upload_response = client.post(
            "/upload",
            files={"file": ("large_file.pdf", large_content, "application/pdf")}
        )
        
        # Should return 400 Bad Request
        assert upload_response.status_code == 400
        error_data = upload_response.json()
        
        assert "detail" in error_data
        assert "File size exceeds 10MB limit" in error_data["detail"]
        
        # Verify no file was created
        storage_dir = Path("backend/static/pdfToExcel")
        if storage_dir.exists():
            excel_files = list(storage_dir.glob("*.xlsx"))
            assert len(excel_files) == 0
    
    def test_upload_pdf_without_tables_workflow(self, cleanup_test_files):
        """Test uploading a PDF without tables returns appropriate response"""
        # Requirements: 2.4, 5.4
        pdf_path = TEST_DATA_DIR / "no_table.pdf"
        
        with open(pdf_path, "rb") as f:
            upload_response = client.post(
                "/upload",
                files={"file": ("no_table.pdf", f, "application/pdf")}
            )
        
        # Should return 200 but with success=false
        assert upload_response.status_code == 200
        response_data = upload_response.json()
        
        assert response_data["success"] is False
        assert "No tables found" in response_data["message"]
        assert response_data["filename"] is None
        assert response_data["download_url"] is None
        
        # Verify no Excel file was created
        storage_dir = Path("backend/static/pdfToExcel")
        if storage_dir.exists():
            excel_files = list(storage_dir.glob("*.xlsx"))
            assert len(excel_files) == 0
    
    def test_download_nonexistent_file_workflow(self, cleanup_test_files):
        """Test downloading a file that doesn't exist returns 404"""
        # Requirements: 3.4, 5.4
        download_response = client.get("/download/nonexistent_file_12345.xlsx")
        
        # Should return 404 Not Found
        assert download_response.status_code == 404
        error_data = download_response.json()
        
        assert "detail" in error_data
        assert "File not found" in error_data["detail"]

    def test_download_with_path_traversal_attempt_workflow(self, cleanup_test_files):
        """Test that path traversal attempts are blocked"""
        # Requirements: 3.4, 5.4
        # Try to access a file outside the storage directory
        malicious_paths = [
            "../../../etc/passwd",
            "../../secret.xlsx",
            "../config.ini",
            "..%2F..%2Fsecret.xlsx"
        ]
        
        for malicious_path in malicious_paths:
            download_response = client.get(f"/download/{malicious_path}")
            
            # Should return 404 (file not found) - security through obscurity
            assert download_response.status_code == 404
            error_data = download_response.json()
            assert "detail" in error_data
    
    def test_upload_empty_file_workflow(self, cleanup_test_files):
        """Test uploading an empty file returns appropriate error"""
        # Requirements: 1.4, 5.4
        empty_content = b""
        
        upload_response = client.post(
            "/upload",
            files={"file": ("empty.pdf", empty_content, "application/pdf")}
        )
        
        # Should return 400 Bad Request
        assert upload_response.status_code == 400
        error_data = upload_response.json()
        
        assert "detail" in error_data
        assert "File is empty" in error_data["detail"]
    
    def test_upload_fake_pdf_with_pdf_extension_workflow(self, cleanup_test_files):
        """Test uploading a non-PDF file with .pdf extension is rejected"""
        # Requirements: 1.4, 5.4
        # Create a fake file with .pdf extension but wrong content
        fake_content = b"This is not a PDF file, just text"
        
        upload_response = client.post(
            "/upload",
            files={"file": ("fake.pdf", fake_content, "application/pdf")}
        )
        
        # Should return 400 Bad Request
        assert upload_response.status_code == 400
        error_data = upload_response.json()
        
        assert "detail" in error_data
        assert "Only PDF files are accepted" in error_data["detail"]


class TestCompleteUserJourney:
    """
    Test complete user journeys simulating real-world usage
    """
    
    def test_typical_user_workflow(self, cleanup_test_files):
        """Test a typical user workflow: upload, check list, download, verify"""
        # This test simulates what a real user would do
        
        # User uploads a PDF
        pdf_path = TEST_DATA_DIR / "simple_table.pdf"
        
        with open(pdf_path, "rb") as f:
            upload_response = client.post(
                "/upload",
                files={"file": ("quarterly_report.pdf", f, "application/pdf")}
            )
        
        assert upload_response.status_code == 200
        upload_data = upload_response.json()
        assert upload_data["success"] is True
        
        # User checks the file list to see their file
        list_response = client.get("/files")
        assert list_response.status_code == 200
        list_data = list_response.json()
        assert list_data["total_count"] > 0
        
        # User finds their file in the list
        user_file = None
        for file_info in list_data["files"]:
            if "quarterly_report" in file_info["original_name"]:
                user_file = file_info
                break
        
        assert user_file is not None
        
        # User downloads the file
        download_response = client.get(f"/download/{user_file['filename']}")
        assert download_response.status_code == 200
        
        # User verifies the downloaded file is valid
        import io
        excel_content = io.BytesIO(download_response.content)
        df = pd.read_excel(excel_content, sheet_name='Table_1')
        assert not df.empty

    def test_multiple_users_workflow(self, cleanup_test_files):
        """Test multiple users uploading and downloading files concurrently"""
        # Simulate multiple users uploading different files
        pdf_path = TEST_DATA_DIR / "simple_table.pdf"
        
        user_files = []
        
        # Three users upload files
        for i in range(3):
            with open(pdf_path, "rb") as f:
                upload_response = client.post(
                    "/upload",
                    files={"file": (f"user_{i}_document.pdf", f, "application/pdf")}
                )
            
            assert upload_response.status_code == 200
            upload_data = upload_response.json()
            user_files.append({
                "user_id": i,
                "filename": upload_data["filename"],
                "download_url": upload_data["download_url"]
            })
        
        # All users can see all files in the list
        list_response = client.get("/files")
        assert list_response.status_code == 200
        list_data = list_response.json()
        assert list_data["total_count"] >= 3
        
        # Each user can download their own file
        for user_file in user_files:
            download_response = client.get(user_file["download_url"])
            assert download_response.status_code == 200
            assert len(download_response.content) > 0
    
    def test_error_recovery_workflow(self, cleanup_test_files):
        """Test that users can recover from errors and successfully upload"""
        # User first tries to upload an invalid file
        fake_content = b"Not a PDF"
        
        upload_response = client.post(
            "/upload",
            files={"file": ("document.txt", fake_content, "text/plain")}
        )
        
        assert upload_response.status_code == 400
        
        # User then uploads a valid PDF
        pdf_path = TEST_DATA_DIR / "simple_table.pdf"
        
        with open(pdf_path, "rb") as f:
            upload_response = client.post(
                "/upload",
                files={"file": ("valid_document.pdf", f, "application/pdf")}
            )
        
        assert upload_response.status_code == 200
        upload_data = upload_response.json()
        assert upload_data["success"] is True
        
        # User can download the successfully converted file
        download_response = client.get(upload_data["download_url"])
        assert download_response.status_code == 200
        assert len(download_response.content) > 0
