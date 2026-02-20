# PDF Converter API - Complete Endpoints Summary

**Base URL:** `https://app.graphicscycle.com`

## Available APIs

### 1. Web Interface (UI)
- **Endpoint:** `GET https://app.graphicscycle.com/`
- **Description:** Serves the web interface for file conversion
- **Returns:** HTML page with upload forms and file lists

---

## PDF to Excel APIs

### 1.1 Convert PDF to Excel
- **Endpoint:** `POST https://app.graphicscycle.com/v1/conversions/pdf-to-excel`
- **Description:** Upload and convert PDF to Excel format
- **Request:** 
  - Content-Type: `multipart/form-data`
  - Body: `file` (PDF file, max 50MB)
- **Response:**
  ```json
  {
    "success": true,
    "message": "PDF converted successfully",
    "filename": "invoice_20260208_123456_abc123.xlsx",
    "download_url": "/v1/conversions/pdf-to-excel/files/invoice_20260208_123456_abc123.xlsx"
  }
  ```

### 1.2 List Excel Files
- **Endpoint:** `GET https://app.graphicscycle.com/v1/conversions/pdf-to-excel/files`
- **Description:** Get list of all converted Excel files
- **Response:**
  ```json
  {
    "files": [
      {
        "filename": "invoice_20260208_123456_abc123.xlsx",
        "original_name": "invoice",
        "conversion_date": "2026-02-08T12:34:56.789Z",
        "file_size": 15360,
        "status": "success"
      }
    ],
    "total_count": 1
  }
  ```

### 1.3 Download Excel File
- **Endpoint:** `GET https://app.graphicscycle.com/v1/conversions/pdf-to-excel/files/{filename}`
- **Description:** Download a converted Excel file
- **Parameters:** `filename` - Name of the file to download
- **Returns:** Excel file (binary)

---

## PDF to Word APIs

### 2.1 Convert PDF to Word
- **Endpoint:** `POST https://app.graphicscycle.com/v1/conversions/pdf-to-word`
- **Description:** Upload and convert PDF to Word format
- **Request:** 
  - Content-Type: `multipart/form-data`
  - Body: `file` (PDF file, max 50MB)
- **Response:**
  ```json
  {
    "success": true,
    "message": "PDF converted successfully",
    "filename": "report_20260208_123456_xyz789.docx",
    "download_url": "/v1/conversions/pdf-to-word/files/report_20260208_123456_xyz789.docx"
  }
  ```

### 2.2 List Word Files
- **Endpoint:** `GET https://app.graphicscycle.com/v1/conversions/pdf-to-word/files`
- **Description:** Get list of all converted Word documents
- **Response:**
  ```json
  {
    "files": [
      {
        "filename": "report_20260208_123456_xyz789.docx",
        "original_name": "report",
        "conversion_date": "2026-02-08T12:34:56.789Z",
        "file_size": 25600,
        "status": "success"
      }
    ],
    "total_count": 1
  }
  ```

### 2.3 Download Word File
- **Endpoint:** `GET https://app.graphicscycle.com/v1/conversions/pdf-to-word/files/{filename}`
- **Description:** Download a converted Word document
- **Parameters:** `filename` - Name of the file to download
- **Returns:** Word document (binary)

---

## Remove Background APIs

### 3.1 Remove Background from Image
- **Endpoint:** `POST https://app.graphicscycle.com/v1/conversions/remove-background`
- **Description:** Upload an image and return a PNG with a transparent background
- **Request:**
  - Content-Type: `multipart/form-data`
  - Body: `file` (PNG, JPG, JPEG, or WEBP, max 50MB)
- **Response:**
  ```json
  {
    "success": true,
    "message": "Background removed successfully",
    "filename": "portrait_20260208_123456_abc123.png",
    "download_url": "/v1/conversions/remove-background/files/portrait_20260208_123456_abc123.png"
  }
  ```

### 3.2 List Processed PNG Files
- **Endpoint:** `GET https://app.graphicscycle.com/v1/conversions/remove-background/files`
- **Description:** Get list of all PNG files with removed backgrounds
- **Response:**
  ```json
  {
    "files": [
      {
        "filename": "portrait_20260208_123456_abc123.png",
        "original_name": "portrait",
        "conversion_date": "2026-02-08T12:34:56.789Z",
        "file_size": 204800,
        "status": "success"
      }
    ],
    "total_count": 1
  }
  ```

### 3.3 Download Processed PNG File
- **Endpoint:** `GET https://app.graphicscycle.com/v1/conversions/remove-background/files/{filename}`
- **Description:** Download a PNG with transparent background
- **Parameters:** `filename` - Name of the file to download
- **Returns:** PNG image (binary)

---

## Summary Table

| # | Method | Endpoint | Purpose |
|---|--------|----------|---------|
| 1 | GET | `https://app.graphicscycle.com/` | Web UI |
| 2 | POST | `https://app.graphicscycle.com/v1/conversions/pdf-to-excel` | Convert PDF → Excel |
| 3 | GET | `https://app.graphicscycle.com/v1/conversions/pdf-to-excel/files` | List Excel files |
| 4 | GET | `https://app.graphicscycle.com/v1/conversions/pdf-to-excel/files/{filename}` | Download Excel |
| 5 | POST | `https://app.graphicscycle.com/v1/conversions/pdf-to-word` | Convert PDF → Word |
| 6 | GET | `https://app.graphicscycle.com/v1/conversions/pdf-to-word/files` | List Word files |
| 7 | GET | `https://app.graphicscycle.com/v1/conversions/pdf-to-word/files/{filename}` | Download Word |
| 8 | POST | `https://app.graphicscycle.com/v1/conversions/remove-background` | Remove image background |
| 9 | GET | `https://app.graphicscycle.com/v1/conversions/remove-background/files` | List processed PNG files |
| 10 | GET | `https://app.graphicscycle.com/v1/conversions/remove-background/files/{filename}` | Download processed PNG |

**Total: 10 Endpoints**

---

## Example Usage

### Example 1: Convert PDF to Excel using cURL

```bash
curl -X POST https://app.graphicscycle.com/v1/conversions/pdf-to-excel \
  -F "file=@invoice.pdf" \
  -H "Accept: application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "PDF converted successfully",
  "filename": "invoice_20260208_123456_abc123.xlsx",
  "download_url": "/v1/conversions/pdf-to-excel/files/invoice_20260208_123456_abc123.xlsx"
}
```

### Example 2: List All Excel Files

```bash
curl https://app.graphicscycle.com/v1/conversions/pdf-to-excel/files
```

**Response:**
```json
{
  "files": [
    {
      "filename": "invoice_20260208_123456_abc123.xlsx",
      "original_name": "invoice",
      "conversion_date": "2026-02-08T12:34:56.789Z",
      "file_size": 15360,
      "status": "success"
    }
  ],
  "total_count": 1
}
```

### Example 3: Download Excel File

```bash
curl https://app.graphicscycle.com/v1/conversions/pdf-to-excel/files/invoice_20260208_123456_abc123.xlsx \
  -o invoice.xlsx
```

### Example 4: Convert PDF to Word using Python

```python
import requests

url = "https://app.graphicscycle.com/v1/conversions/pdf-to-word"

with open("report.pdf", "rb") as f:
    files = {"file": f}
    response = requests.post(url, files=files)
    
data = response.json()
if data["success"]:
    print(f"Converted: {data['filename']}")
    print(f"Download URL: https://app.graphicscycle.com{data['download_url']}")
```

### Example 5: Complete Workflow in JavaScript

```javascript
// Upload and convert PDF to Excel
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('https://app.graphicscycle.com/v1/conversions/pdf-to-excel', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Conversion successful!');
    // Download the file
    window.location.href = `https://app.graphicscycle.com${data.download_url}`;
  }
});
```

---

## What This System Provides

### ✅ Conversion APIs
1. **PDF to Excel** - Extracts tables from PDFs and converts to Excel
2. **PDF to Word** - Converts PDF documents to editable Word files

### ✅ File Management APIs
1. **List Files** - View all converted files with metadata
2. **Download Files** - Download converted files

### ✅ Web Interface
1. **Upload Form** - Easy file upload interface
2. **File List** - View and download converted files
3. **Real-time Status** - See conversion progress

---

## What This System Does NOT Provide

### ❌ Not Included:
1. **User Authentication** - No login/signup system
2. **User Management** - No user accounts or profiles
3. **File Deletion API** - No endpoint to delete files
4. **File Editing** - No in-browser editing
5. **Batch Conversion** - No multiple file upload at once
6. **Scheduled Conversions** - No cron/scheduled jobs
7. **Webhooks** - No callback notifications
8. **Analytics API** - No usage statistics endpoint
9. **Search API** - No file search functionality
10. **Sharing API** - No file sharing links

---

## If You Need Additional Features

### To Add File Deletion:

```python
# In backend/route/excel_converter.py
@router.delete("/files/{filename}")
async def delete_excel_file(filename: str):
    """Delete a converted Excel file"""
    try:
        file_path = file_manager.get_file_path(filename)
        if file_path and os.path.exists(file_path):
            os.unlink(file_path)
            return {"success": True, "message": "File deleted"}
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### To Add User Authentication:

```python
# Install dependencies
pipenv install python-jose[cryptography] passlib[bcrypt] python-multipart

# Add authentication middleware
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
```

### To Add Batch Upload:

```python
@router.post("/batch")
async def batch_convert(files: List[UploadFile] = File(...)):
    """Convert multiple PDFs at once"""
    results = []
    for file in files:
        # Process each file
        pass
    return {"results": results}
```

---

## Current System Capabilities

### ✅ What Works Now:

1. **File Upload & Conversion**
   - Upload PDF files (up to 50MB)
   - Convert to Excel or Word
   - Automatic file naming with timestamps

2. **File Storage**
   - Files saved to `static/pdfToExcel/`
   - Files saved to `static/pdfToDocs/`
   - Persistent storage on disk

3. **File Retrieval**
   - List all converted files
   - Download any converted file
   - View file metadata (size, date, name)

4. **Web Interface**
   - Upload forms for both formats
   - File list with download buttons
   - Real-time conversion feedback
   - Error handling and validation

5. **API Features**
   - RESTful API design
   - Versioned endpoints (v1)
   - JSON responses
   - Proper HTTP status codes
   - Error messages

---

## Use Cases

### ✅ Supported Use Cases:

1. **Individual File Conversion**
   - User uploads a PDF
   - System converts it
   - User downloads the result

2. **File Library**
   - View all previously converted files
   - Download any file at any time
   - Files persist until manually deleted

3. **API Integration**
   - Other applications can call the API
   - Programmatic file conversion
   - Automated workflows

### ❌ Not Supported Use Cases:

1. **Multi-user System**
   - No user separation
   - All files visible to everyone
   - No private conversions

2. **File Management**
   - Cannot delete files via API
   - Cannot rename files
   - Cannot organize into folders

3. **Advanced Features**
   - No OCR for scanned PDFs
   - No password-protected PDFs
   - No PDF merging/splitting
   - No format conversion (e.g., Excel to PDF)

---

## Summary

**Your current system provides:**
- ✅ 2 Conversion APIs (Excel & Word)
- ✅ 2 List APIs (Excel & Word files)
- ✅ 2 Download APIs (Excel & Word files)
- ✅ 1 Web Interface (UI)

**Total: 7 Endpoints**

This is a **complete, functional PDF conversion system** with:
- File upload and conversion
- File storage and retrieval
- Web interface for easy use
- RESTful API for integration

**It's perfect for:**
- Personal use
- Small teams
- Internal tools
- API integration
- Proof of concept

**Consider adding if needed:**
- User authentication
- File deletion
- Batch processing
- Advanced PDF features
