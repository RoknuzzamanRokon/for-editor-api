# PDF Converter API - Quick Reference

## Base URL
```
http://localhost:8000
```

## API Version
```
v1
```

## Endpoints Summary

### PDF to Excel

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/conversions/pdf-to-excel` | Upload PDF and convert to Excel |
| GET | `/v1/conversions/pdf-to-excel/files` | List all converted Excel files |
| GET | `/v1/conversions/pdf-to-excel/files/{filename}` | Download Excel file |

### PDF to Word

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/conversions/pdf-to-word` | Upload PDF and convert to Word |
| GET | `/v1/conversions/pdf-to-word/files` | List all converted Word files |
| GET | `/v1/conversions/pdf-to-word/files/{filename}` | Download Word file |

### Web Interface

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Web UI for file conversion |

---

## Quick Examples

### Upload PDF for Excel Conversion
```bash
curl -X POST http://localhost:8000/v1/conversions/pdf-to-excel \
  -F "file=@document.pdf"
```

### Upload PDF for Word Conversion
```bash
curl -X POST http://localhost:8000/v1/conversions/pdf-to-word \
  -F "file=@document.pdf"
```

### List Excel Files
```bash
curl http://localhost:8000/v1/conversions/pdf-to-excel/files
```

### List Word Files
```bash
curl http://localhost:8000/v1/conversions/pdf-to-word/files
```

### Download Excel File
```bash
curl http://localhost:8000/v1/conversions/pdf-to-excel/files/file_20260208_123456_abc123.xlsx \
  -o output.xlsx
```

### Download Word File
```bash
curl http://localhost:8000/v1/conversions/pdf-to-word/files/file_20260208_123456_abc123.docx \
  -o output.docx
```

---

## Response Formats

### Conversion Response
```json
{
  "success": true,
  "message": "PDF converted successfully",
  "filename": "file_20260208_123456_abc123.xlsx",
  "download_url": "/download/file_20260208_123456_abc123.xlsx"
}
```

### File List Response
```json
{
  "files": [
    {
      "filename": "file_20260208_123456_abc123.xlsx",
      "original_name": "file",
      "conversion_date": "2026-02-08T12:34:56.789Z",
      "file_size": 15360,
      "status": "success"
    }
  ],
  "total_count": 1
}
```

### Error Response
```json
{
  "detail": "Error message"
}
```

---

## Constraints

- **Max file size:** 50 MB
- **Allowed types:** PDF only
- **Timeout:** 300 seconds
- **File validation:** Extension + MIME type + magic number

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (invalid file) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Common Errors

| Error | Cause |
|-------|-------|
| "Only PDF files are accepted" | Wrong file type |
| "File size exceeds 50MB limit" | File too large |
| "File is empty" | Empty file uploaded |
| "File not found" | Invalid filename in download |
| "Conversion failed" | PDF processing error |

---

## Python Quick Start

```python
import requests

# Upload and convert
with open("document.pdf", "rb") as f:
    response = requests.post(
        "http://localhost:8000/v1/conversions/pdf-to-excel",
        files={"file": f}
    )
    data = response.json()
    
if data["success"]:
    # Download converted file
    filename = data["filename"]
    file_response = requests.get(
        f"http://localhost:8000/v1/conversions/pdf-to-excel/files/{filename}"
    )
    
    with open("output.xlsx", "wb") as f:
        f.write(file_response.content)
```

---

## JavaScript Quick Start

```javascript
// Upload and convert
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:8000/v1/conversions/pdf-to-excel', {
  method: 'POST',
  body: formData
});

const data = await response.json();

if (data.success) {
  // Download converted file
  const downloadUrl = `http://localhost:8000${data.download_url}`;
  window.location.href = downloadUrl;
}
```

---

For detailed documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
