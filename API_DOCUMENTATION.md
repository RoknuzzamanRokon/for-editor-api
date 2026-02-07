# PDF Converter API Documentation

## Overview

The PDF Converter API provides RESTful endpoints for converting PDF files to Excel (XLSX) and Word (DOCX) formats. The API follows REST best practices with versioned endpoints and clear resource naming.

**Base URL:** `http://localhost:8000`

**API Version:** v1

**Maximum File Size:** 50 MB

---

## Table of Contents

1. [API Versioning](#api-versioning)
2. [Authentication](#authentication)
3. [PDF to Excel Endpoints](#pdf-to-excel-endpoints)
4. [PDF to Word Endpoints](#pdf-to-word-endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Rate Limits & Constraints](#rate-limits--constraints)
8. [Examples](#examples)

---

## API Versioning

The API uses URL-based versioning. All endpoints are prefixed with `/v1/` to indicate version 1 of the API.

**Current Version:** v1  
**Endpoint Pattern:** `/v1/conversions/{conversion-type}`

---

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

---

## PDF to Excel Endpoints

### 1. Convert PDF to Excel

Upload a PDF file and convert it to Excel format.

**Endpoint:** `POST /v1/conversions/pdf-to-excel`

**Content-Type:** `multipart/form-data`

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | File | Yes | PDF file to convert (max 50MB) |

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "PDF converted successfully",
  "filename": "invoice_20260208_123456_abc123.xlsx",
  "download_url": "/v1/conversions/pdf-to-excel/files/invoice_20260208_123456_abc123.xlsx"
}
```

**Error Responses:**

- **400 Bad Request** - Invalid file type or size
```json
{
  "detail": "Only PDF files are accepted"
}
```

- **500 Internal Server Error** - Conversion failed
```json
{
  "detail": "Internal server error: conversion timeout"
}
```

---

### 2. List Excel Files

Retrieve a list of all converted Excel files.

**Endpoint:** `GET /v1/conversions/pdf-to-excel/files`

**Success Response (200 OK):**

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

**Error Responses:**

- **500 Internal Server Error** - Failed to retrieve file list
```json
{
  "detail": "Failed to list files: storage directory not accessible"
}
```

---

### 3. Download Excel File

Download a converted Excel file.

**Endpoint:** `GET /v1/conversions/pdf-to-excel/files/{filename}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filename | string | Yes | Name of the file to download |

**Success Response (200 OK):**

- **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition:** `attachment; filename="invoice.xlsx"`
- Returns the Excel file as binary data

**Error Responses:**

- **404 Not Found** - File does not exist
```json
{
  "detail": "File not found"
}
```

- **500 Internal Server Error** - Failed to download file
```json
{
  "detail": "Failed to download file: permission denied"
}
```

---

## PDF to Word Endpoints

### 1. Convert PDF to Word

Upload a PDF file and convert it to Word (DOCX) format.

**Endpoint:** `POST /v1/conversions/pdf-to-word`

**Content-Type:** `multipart/form-data`

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | File | Yes | PDF file to convert (max 50MB) |

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "PDF converted successfully",
  "filename": "report_20260208_123456_xyz789.docx",
  "download_url": "/v1/conversions/pdf-to-word/files/report_20260208_123456_xyz789.docx"
}
```

**Error Responses:**

- **400 Bad Request** - Invalid file type or size
```json
{
  "detail": "File size exceeds 50MB limit"
}
```

- **500 Internal Server Error** - Conversion failed
```json
{
  "detail": "Internal server error: PDF parsing error"
}
```

---

### 2. List Word Files

Retrieve a list of all converted Word documents.

**Endpoint:** `GET /v1/conversions/pdf-to-word/files`

**Success Response (200 OK):**

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

**Error Responses:**

- **500 Internal Server Error** - Failed to retrieve file list
```json
{
  "detail": "Failed to list files: storage directory not accessible"
}
```

---

### 3. Download Word File

Download a converted Word document.

**Endpoint:** `GET /v1/conversions/pdf-to-word/files/{filename}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filename | string | Yes | Name of the file to download |

**Success Response (200 OK):**

- **Content-Type:** `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Content-Disposition:** `attachment; filename="report.docx"`
- Returns the Word document as binary data

**Error Responses:**

- **404 Not Found** - File does not exist
```json
{
  "detail": "File not found"
}
```

- **500 Internal Server Error** - Failed to download file
```json
{
  "detail": "Failed to download file: file corrupted"
}
```

---

## Data Models

### FileMetadata

Represents metadata for a converted file.

```json
{
  "filename": "string",           // Unique filename with timestamp
  "original_name": "string",      // Original uploaded filename
  "conversion_date": "datetime",  // ISO 8601 format
  "file_size": "integer",         // Size in bytes (> 0)
  "status": "string"              // "success", "failed", or "processing"
}
```

**Field Validations:**
- `filename`: Cannot be empty, no path traversal characters (`..`, `/`, `\`)
- `original_name`: Cannot be empty, no path traversal characters
- `file_size`: Must be greater than 0
- `status`: Must be one of: `success`, `failed`, `processing`

---

### ConversionResponse

Response returned after file upload and conversion.

```json
{
  "success": "boolean",           // Conversion success status
  "message": "string",            // Status message or error description
  "filename": "string | null",    // Generated filename (null on failure)
  "download_url": "string | null" // Download URL (null on failure)
}
```

**Field Validations:**
- `message`: Cannot be empty
- `filename`: Only present when `success` is `true`
- `download_url`: Only present when `success` is `true`

---

### FileListResponse

Response containing a list of converted files.

```json
{
  "files": [FileMetadata],        // Array of file metadata objects
  "total_count": "integer"        // Total number of files (>= 0)
}
```

**Field Validations:**
- `total_count`: Must match the length of the `files` array
- `total_count`: Must be >= 0

---

## Error Handling

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success - Request completed successfully |
| 400 | Bad Request - Invalid input (file type, size, etc.) |
| 404 | Not Found - Requested resource does not exist |
| 500 | Internal Server Error - Server-side error during processing |

### Error Response Format

All error responses follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common Error Messages

**File Validation Errors (400):**
- `"Only PDF files are accepted"`
- `"File size exceeds 50MB limit"`
- `"File is empty"`
- `"No file provided"`
- `"Invalid file content"`

**Conversion Errors (500):**
- `"Internal server error: conversion timeout"`
- `"Internal server error: PDF parsing error"`
- `"Conversion failed"`

**Download Errors (404/500):**
- `"File not found"`
- `"Failed to download file: permission denied"`

---

## Rate Limits & Constraints

### File Upload Constraints

| Constraint | Value |
|------------|-------|
| Maximum file size | 50 MB (52,428,800 bytes) |
| Allowed file types | PDF only (`application/pdf`) |
| Allowed extensions | `.pdf` |
| Conversion timeout | 300 seconds (5 minutes) |

### Security Features

1. **File Type Validation**: Both extension and MIME type are checked
2. **Magic Number Verification**: PDF files are validated by checking the `%PDF` header
3. **Path Traversal Prevention**: Filenames are sanitized to prevent directory traversal attacks
4. **Unique Filenames**: Generated filenames include timestamps and random hashes to prevent collisions
5. **Temporary File Cleanup**: Uploaded PDFs are stored in temporary files and cleaned up after processing

---

## Examples

### Example 1: Upload and Convert PDF to Excel

**Using cURL:**

```bash
curl -X POST http://localhost:8000/upload \
  -F "file=@invoice.pdf" \
  -H "Accept: application/json"
```

**Using Python (requests):**

```python
import requests

url = "http://localhost:8000/v1/conversions/pdf-to-excel"
files = {"file": open("invoice.pdf", "rb")}

response = requests.post(url, files=files)
data = response.json()

if data["success"]:
    print(f"Conversion successful!")
    print(f"Download URL: {data['download_url']}")
else:
    print(f"Conversion failed: {data['message']}")
```

**Using JavaScript (fetch):**

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:8000/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Conversion successful!');
    console.log('Download URL:', data.download_url);
  } else {
    console.error('Conversion failed:', data.message);
  }
});
```

---

### Example 2: List All Converted Excel Files

**Using cURL:**

```bash
curl -X GET http://localhost:8000/v1/conversions/pdf-to-excel/files \
  -H "Accept: application/json"
```

**Using Python (requests):**

```python
import requests

url = "http://localhost:8000/v1/conversions/pdf-to-excel/files"
response = requests.get(url)
data = response.json()

print(f"Total files: {data['total_count']}")
for file in data['files']:
    print(f"- {file['original_name']}.xlsx ({file['file_size']} bytes)")
```

**Using JavaScript (fetch):**

```javascript
fetch('http://localhost:8000/v1/conversions/pdf-to-excel/files')
  .then(response => response.json())
  .then(data => {
    console.log(`Total files: ${data.total_count}`);
    data.files.forEach(file => {
      console.log(`- ${file.original_name}.xlsx (${file.file_size} bytes)`);
    });
  });
```

---

### Example 3: Download a Converted File

**Using cURL:**

```bash
curl -X GET http://localhost:8000/v1/conversions/pdf-to-excel/files/invoice_20260208_123456_abc123.xlsx \
  -o invoice.xlsx
```

**Using Python (requests):**

```python
import requests

filename = "invoice_20260208_123456_abc123.xlsx"
url = f"http://localhost:8000/v1/conversions/pdf-to-excel/files/{filename}"

response = requests.get(url)

if response.status_code == 200:
    with open("invoice.xlsx", "wb") as f:
        f.write(response.content)
    print("File downloaded successfully!")
else:
    print(f"Download failed: {response.json()['detail']}")
```

**Using JavaScript (fetch):**

```javascript
const filename = "invoice_20260208_123456_abc123.xlsx";
const url = `http://localhost:8000/v1/conversions/pdf-to-excel/files/${filename}`;

fetch(url)
  .then(response => response.blob())
  .then(blob => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'invoice.xlsx';
    link.click();
  });
```

---

### Example 4: Upload and Convert PDF to Word

**Using cURL:**

```bash
curl -X POST http://localhost:8000/v1/conversions/pdf-to-word \
  -F "file=@report.pdf" \
  -H "Accept: application/json"
```

**Using Python (requests):**

```python
import requests

url = "http://localhost:8000/v1/conversions/pdf-to-word"
files = {"file": open("report.pdf", "rb")}

response = requests.post(url, files=files)
data = response.json()

if data["success"]:
    print(f"Conversion successful!")
    print(f"Download URL: {data['download_url']}")
else:
    print(f"Conversion failed: {data['message']}")
```

---

### Example 5: Complete Workflow

**Python script demonstrating the complete workflow:**

```python
import requests
import time

BASE_URL = "http://localhost:8000"

# Step 1: Upload and convert PDF to Excel
print("Step 1: Uploading PDF for Excel conversion...")
with open("invoice.pdf", "rb") as f:
    response = requests.post(f"{BASE_URL}/upload", files={"file": f})
    conversion_data = response.json()

if not conversion_data["success"]:
    print(f"Conversion failed: {conversion_data['message']}")
    exit(1)

print(f"✓ Conversion successful: {conversion_data['filename']}")

# Step 2: List all converted files
print("\nStep 2: Listing all converted Excel files...")
response = requests.get(f"{BASE_URL}/files")
files_data = response.json()
print(f"✓ Found {files_data['total_count']} file(s)")

# Step 3: Download the converted file
print("\nStep 3: Downloading converted file...")
filename = conversion_data['filename']
response = requests.get(f"{BASE_URL}/download/{filename}")

if response.status_code == 200:
    with open("downloaded_invoice.xlsx", "wb") as f:
        f.write(response.content)
    print("✓ File downloaded successfully!")
else:
    print(f"✗ Download failed: {response.json()['detail']}")

print("\n✓ Workflow completed successfully!")
```

---

## Web Interface

The API also provides a web interface accessible at the root URL:

**URL:** `http://localhost:8000/`

The web interface provides:
- Tab-based navigation between Excel and Word converters
- Drag-and-drop file upload
- Real-time conversion status
- File list with download buttons
- Responsive design for mobile devices

---

## Support & Contact

For issues, questions, or feature requests, please contact the development team or open an issue in the project repository.

**API Version:** 1.0.0  
**Last Updated:** February 8, 2026
