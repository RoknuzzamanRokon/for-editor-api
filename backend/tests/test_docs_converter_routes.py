"""
Integration tests for docs_converter route endpoints
"""
import os
import pytest
from pathlib import Path
from fastapi.testclient import TestClient
from main import app
from services.file_manager import FileManagerService


client = TestClient(app)

# Test data directory
TEST_DATA_DIR = Path(__file__).parent / "test_data"


@pytest.fixture
def cleanup_converted_docs():
    """Fixture to clean up converted docs files after tests"""
    yield
    # Clean up any test files created during tests
    storage_dir = Path("static/pdfToDocs")
    if storage_dir.exists():
        for file in storage_dir.glob("test_*.docx"):
            try:
                file.unlink()
            except:
                pass


class TestUploadDocsEndpoint:
    """Tests for POST /upload-docs endpoint"""
    
    def test_upload_valid_pdf_for_docs(self, cleanup_converted_docs):
        """Test uploading a valid PDF for Word conversion"""
        # Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.7
        pdf_path = TEST_DATA_DIR / "simple_text.pdf"
        
        with open(pdf_path, "rb") as f:
            response = client.post(
                "/v1/conversions/pdf-to-word",
                files={"file": ("simple_text.pdf", f, "application/pdf")}
            )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert data["message"] == "PDF converted successfully"
        assert data["filename"] is not None
        assert data["filename"].endswith(".docx")
        assert data["download_url"] is not None
        assert data["download_url"].startswith("/v1/conversions/pdf-to-word/files/")
        
        # Verify file was created
        storage_dir = Path("static/pdfToDocs")
        output_file = storage_dir / data["filename"]
        assert output_file.exists()
        
        # Clean up
        output_file.unlink()
    
    def test_upload_pdf_with_images(self, cleanup_converted_docs):
        """Test uploading a PDF with images"""
        # Requirements: 2.1, 2.2, 2.4
        pdf_path = TEST_DATA_DIR / "with_images.pdf"
        
        with open(pdf_path, "rb") as f:
            response = client.post(
                "/v1/conversions/pdf-to-word",
                files={"file": ("with_images.pdf", f, "application/pdf")}
            )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert data["filename"] is not None
        assert data["filename"].endswith(".docx")
        
        # Clean up
        storage_dir = Path("static/pdfToDocs")
        output_file = storage_dir / data["filename"]
        if output_file.exists():
            output_file.unlink()
    
    def test_upload_multipage_pdf(self, cleanup_converted_docs):
        """Test uploading a multipage PDF"""
        # Requirements: 2.1, 2.2
        pdf_path = TEST_DATA_DIR / "multipage_doc.pdf"
        
        with open(pdf_path, "rb") as f:
            response = client.post(
                "/v1/conversions/pdf-to-word",
                files={"file": ("multipage_doc.pdf", f, "application/pdf")}
            )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert data["filename"] is not None
        
        # Clean up
        storage_dir = Path("static/pdfToDocs")
        output_file = storage_dir / data["filename"]
        if output_file.exists():
            output_file.unlink()
    
    def test_upload_formatted_pdf(self, cleanup_converted_docs):
        """Test uploading a PDF with formatting"""
        # Requirements: 2.1, 2.2, 2.3
        pdf_path = TEST_DATA_DIR / "formatted_doc.pdf"
        
        with open(pdf_path, "rb") as f:
            response = client.post(
                "/v1/conversions/pdf-to-word",
                files={"file": ("formatted_doc.pdf", f, "application/pdf")}
            )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert data["filename"] is not None
        
        # Clean up
        storage_dir = Path("static/pdfToDocs")
        output_file = storage_dir / data["filename"]
        if output_file.exists():
            output_file.unlink()
    
    def test_upload_empty_pdf(self, cleanup_converted_docs):
        """Test uploading a PDF with no extractable content"""
        # Requirements: 2.5
        pdf_path = TEST_DATA_DIR / "empty_doc.pdf"
        
        with open(pdf_path, "rb") as f:
            response = client.post(
                "/v1/conversions/pdf-to-word",
                files={"file": ("empty_doc.pdf", f, "application/pdf")}
            )
        
        # Should still succeed but create a docx with a message
        assert response.status_code == 200
        data = response.json()
        
        # The service should handle empty PDFs gracefully
        assert data["filename"] is not None or data["success"] is False
        
        # Clean up if file was created
        if data["filename"]:
            storage_dir = Path("static/pdfToDocs")
            output_file = storage_dir / data["filename"]
            if output_file.exists():
                output_file.unlink()
    
    def test_upload_invalid_file_type(self):
        """Test uploading a non-PDF file"""
        # Requirements: 1.3
        # Create a fake text file
        fake_content = b"This is not a PDF file"
        
        response = client.post(
            "/v1/conversions/pdf-to-word",
            files={"file": ("test.txt", fake_content, "text/plain")}
        )
        
        assert response.status_code == 400
        assert "Only PDF files are accepted" in response.json()["detail"]
    
    def test_upload_file_with_pdf_extension_but_wrong_content(self):
        """Test uploading a file with .pdf extension but wrong magic number"""
        # Requirements: 1.1, 1.2
        fake_content = b"This is not a PDF file"
        
        response = client.post(
            "/v1/conversions/pdf-to-word",
            files={"file": ("fake.pdf", fake_content, "application/pdf")}
        )
        
        assert response.status_code == 400
        assert "Only PDF files are accepted" in response.json()["detail"]
    
    def test_upload_empty_file(self):
        """Test uploading an empty file"""
        # Requirements: 1.5
        response = client.post(
            "/v1/conversions/pdf-to-word",
            files={"file": ("empty.pdf", b"", "application/pdf")}
        )
        
        assert response.status_code == 400
        assert "File is empty" in response.json()["detail"]
    
    def test_upload_oversized_file(self):
        """Test uploading a file larger than 10MB"""
        # Requirements: 1.4
        # Create a fake PDF header with large content
        large_content = b"%PDF-1.4\n" + b"x" * (11 * 1024 * 1024)  # 11MB
        
        response = client.post(
            "/v1/conversions/pdf-to-word",
            files={"file": ("large.pdf", large_content, "application/pdf")}
        )
        
        assert response.status_code == 400
        assert "File size exceeds 10MB limit" in response.json()["detail"]
    
    def test_upload_generates_unique_filename(self, cleanup_converted_docs):
        """Test that each upload generates a unique filename"""
        # Requirements: 2.7
        pdf_path = TEST_DATA_DIR / "simple_text.pdf"
        
        filenames = []
        for _ in range(3):
            with open(pdf_path, "rb") as f:
                response = client.post(
                    "/v1/conversions/pdf-to-word",
                    files={"file": ("simple_text.pdf", f, "application/pdf")}
                )
            
            assert response.status_code == 200
            data = response.json()
            filenames.append(data["filename"])
        
        # All filenames should be unique
        assert len(filenames) == len(set(filenames))
        
        # Clean up
        storage_dir = Path("static/pdfToDocs")
        for filename in filenames:
            output_file = storage_dir / filename
            if output_file.exists():
                output_file.unlink()
    
    def test_upload_without_file(self):
        """Test upload endpoint without providing a file"""
        # Requirements: 1.1
        response = client.post("/v1/conversions/pdf-to-word")
        
        assert response.status_code == 422  # Unprocessable Entity


class TestDocsFileListingEndpoint:
    """Tests for GET /docs-files endpoint"""
    
    def test_list_docs_files_empty(self):
        """Test listing files when no files exist"""
        # Requirements: 4.1, 4.4
        # Clean up all files first
        storage_dir = Path("static/pdfToDocs")
        if storage_dir.exists():
            for file in storage_dir.glob("*.docx"):
                try:
                    file.unlink()
                except:
                    pass
        
        response = client.get("/v1/conversions/pdf-to-word/files")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "files" in data
        assert "total_count" in data
        assert data["total_count"] == 0
        assert len(data["files"]) == 0
    
    def test_list_docs_files_with_converted_files(self, cleanup_converted_docs):
        """Test listing files when converted docs exist"""
        # Requirements: 4.1, 4.2, 4.4
        # First upload a file to create a converted file
        pdf_path = TEST_DATA_DIR / "simple_text.pdf"
        
        with open(pdf_path, "rb") as f:
            upload_response = client.post(
                "/v1/conversions/pdf-to-word",
                files={"file": ("simple_text.pdf", f, "application/pdf")}
            )
        
        assert upload_response.status_code == 200
        uploaded_filename = upload_response.json()["filename"]
        
        # Now list files
        response = client.get("/v1/conversions/pdf-to-word/files")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["total_count"] > 0
        assert len(data["files"]) == data["total_count"]
        
        # Check that our uploaded file is in the list
        filenames = [f["filename"] for f in data["files"]]
        assert uploaded_filename in filenames
        
        # Check file metadata structure
        for file_info in data["files"]:
            assert "filename" in file_info
            assert "original_name" in file_info
            assert "conversion_date" in file_info
            assert "file_size" in file_info
            assert "status" in file_info
            assert file_info["status"] == "success"
            assert file_info["file_size"] > 0
        
        # Clean up
        storage_dir = Path("static/pdfToDocs")
        output_file = storage_dir / uploaded_filename
        if output_file.exists():
            output_file.unlink()
    
    def test_list_docs_files_sorted_by_date(self, cleanup_converted_docs):
        """Test that files are sorted by conversion date (newest first)"""
        # Requirements: 4.1, 4.3
        import time
        
        pdf_path = TEST_DATA_DIR / "simple_text.pdf"
        
        # Upload multiple files with small delays
        filenames = []
        for i in range(3):
            with open(pdf_path, "rb") as f:
                response = client.post(
                    "/v1/conversions/pdf-to-word",
                    files={"file": (f"test_{i}.pdf", f, "application/pdf")}
                )
            
            if response.status_code == 200:
                filenames.append(response.json()["filename"])
            time.sleep(0.1)  # Small delay to ensure different timestamps
        
        # List files
        response = client.get("/v1/conversions/pdf-to-word/files")
        assert response.status_code == 200
        data = response.json()
        
        # Check that files are sorted by date (newest first)
        if len(data["files"]) > 1:
            dates = [f["conversion_date"] for f in data["files"]]
            # Dates should be in descending order
            assert dates == sorted(dates, reverse=True)
        
        # Clean up
        storage_dir = Path("static/pdfToDocs")
        for filename in filenames:
            output_file = storage_dir / filename
            if output_file.exists():
                output_file.unlink()


class TestDocsDownloadEndpoint:
    """Tests for GET /download-docs/{filename} endpoint"""
    
    def test_download_existing_docs_file(self, cleanup_converted_docs):
        """Test downloading an existing converted Word document"""
        # Requirements: 3.1, 3.2, 3.3
        # First upload a file
        pdf_path = TEST_DATA_DIR / "simple_text.pdf"
        
        with open(pdf_path, "rb") as f:
            upload_response = client.post(
                "/v1/conversions/pdf-to-word",
                files={"file": ("simple_text.pdf", f, "application/pdf")}
            )
        
        assert upload_response.status_code == 200
        filename = upload_response.json()["filename"]
        
        # Now download the file
        response = client.get(f"/v1/conversions/pdf-to-word/files/{filename}")
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        assert "content-disposition" in response.headers
        assert "attachment" in response.headers["content-disposition"]
        assert ".docx" in response.headers["content-disposition"]
        
        # Verify content is not empty
        assert len(response.content) > 0
        
        # Clean up
        storage_dir = Path("static/pdfToDocs")
        output_file = storage_dir / filename
        if output_file.exists():
            output_file.unlink()
    
    def test_download_nonexistent_file(self):
        """Test downloading a file that doesn't exist"""
        # Requirements: 3.3
        response = client.get("/v1/conversions/pdf-to-word/files/nonexistent_file.docx")
        
        assert response.status_code == 404
        assert "File not found" in response.json()["detail"]
    
    def test_download_with_path_traversal_attempt(self):
        """Test that path traversal attempts are blocked"""
        # Requirements: 3.4
        # Try to access a file outside the storage directory
        response = client.get("/v1/conversions/pdf-to-word/files/../../../etc/passwd")
        
        assert response.status_code == 404
        # FastAPI returns "Not Found" for 404 errors
        assert response.json()["detail"] in ["File not found", "Not Found"]
    
    def test_download_with_invalid_filename(self):
        """Test downloading with invalid filename characters"""
        # Requirements: 3.4
        response = client.get("/v1/conversions/pdf-to-word/files/../../secret.docx")
        
        assert response.status_code == 404
        # FastAPI returns "Not Found" for 404 errors
        assert response.json()["detail"] in ["File not found", "Not Found"]
    
    def test_download_preserves_original_name(self, cleanup_converted_docs):
        """Test that download uses original filename"""
        # Requirements: 3.5
        pdf_path = TEST_DATA_DIR / "simple_text.pdf"
        
        with open(pdf_path, "rb") as f:
            upload_response = client.post(
                "/v1/conversions/pdf-to-word",
                files={"file": ("my_document.pdf", f, "application/pdf")}
            )
        
        assert upload_response.status_code == 200
        filename = upload_response.json()["filename"]
        
        # Download the file
        response = client.get(f"/v1/conversions/pdf-to-word/files/{filename}")
        
        assert response.status_code == 200
        
        # Check that the content-disposition header contains the original name
        content_disposition = response.headers["content-disposition"]
        assert "my_document" in content_disposition
        assert ".docx" in content_disposition
        
        # Clean up
        storage_dir = Path("static/pdfToDocs")
        output_file = storage_dir / filename
        if output_file.exists():
            output_file.unlink()
    
    def test_download_url_from_upload_response(self, cleanup_converted_docs):
        """Test that the download URL from upload response works"""
        # Requirements: 3.1, 3.2
        pdf_path = TEST_DATA_DIR / "simple_text.pdf"
        
        with open(pdf_path, "rb") as f:
            upload_response = client.post(
                "/v1/conversions/pdf-to-word",
                files={"file": ("test.pdf", f, "application/pdf")}
            )
        
        assert upload_response.status_code == 200
        data = upload_response.json()
        download_url = data["download_url"]
        
        # Use the download URL
        response = client.get(download_url)
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        
        # Clean up
        storage_dir = Path("static/pdfToDocs")
        output_file = storage_dir / data["filename"]
        if output_file.exists():
            output_file.unlink()
    
    def test_download_multiple_files_independently(self, cleanup_converted_docs):
        """Test downloading multiple files independently"""
        # Requirements: 3.1, 3.2
        pdf_path = TEST_DATA_DIR / "simple_text.pdf"
        
        # Upload multiple files
        filenames = []
        for i in range(2):
            with open(pdf_path, "rb") as f:
                response = client.post(
                    "/v1/conversions/pdf-to-word",
                    files={"file": (f"doc_{i}.pdf", f, "application/pdf")}
                )
            
            assert response.status_code == 200
            filenames.append(response.json()["filename"])
        
        # Download each file
        for filename in filenames:
            response = client.get(f"/v1/conversions/pdf-to-word/files/{filename}")
            assert response.status_code == 200
            assert len(response.content) > 0
        
        # Clean up
        storage_dir = Path("static/pdfToDocs")
        for filename in filenames:
            output_file = storage_dir / filename
            if output_file.exists():
                output_file.unlink()
