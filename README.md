# PDF Converter API

A FastAPI-based web service for converting PDF files to Excel (XLSX) and Word (DOCX) formats.

## Features

- 🔄 **PDF to Excel Conversion** - Extract tables from PDFs and convert to Excel spreadsheets
- 📝 **PDF to Word Conversion** - Convert PDF documents to editable Word files
- 🌐 **Web Interface** - User-friendly web UI with drag-and-drop support
- 📊 **File Management** - List, download, and manage converted files
- 🔒 **Security** - File validation, path traversal prevention, and sanitization
- ⚡ **Fast Processing** - Efficient conversion with timeout protection
- 📱 **Responsive Design** - Mobile-friendly interface

## Quick Start

### Prerequisites

- Python 3.8+
- pipenv (or pip)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd editor
```

2. Install dependencies:
```bash
cd backend
pipenv install
```

3. Run the server:
```bash
pipenv run uvicorn main:app --host 0.0.0.0 --port 8000
```

4. Open your browser and navigate to:
```
http://localhost:8000
```

## API Documentation

### Quick Reference

See [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) for a quick overview of all endpoints.

### Full Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for comprehensive API documentation including:
- Detailed endpoint descriptions
- Request/response formats
- Error handling
- Code examples in multiple languages
- Complete workflow examples

## API Endpoints

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

## Usage Examples

### Using cURL

**Convert PDF to Excel:**
```bash
curl -X POST http://localhost:8000/v1/conversions/pdf-to-excel \
  -F "file=@document.pdf"
```

**Convert PDF to Word:**
```bash
curl -X POST http://localhost:8000/v1/conversions/pdf-to-word \
  -F "file=@document.pdf"
```

### Using Python

```python
import requests

# Convert PDF to Excel
with open("document.pdf", "rb") as f:
    response = requests.post(
        "http://localhost:8000/v1/conversions/pdf-to-excel",
        files={"file": f}
    )
    data = response.json()
    
    if data["success"]:
        print(f"Converted: {data['filename']}")
        print(f"Download: {data['download_url']}")
```

### Using JavaScript

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:8000/v1/conversions/pdf-to-excel', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Conversion successful!');
    window.location.href = data.download_url;
  }
});
```

## Project Structure

```
editor/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── route/                  # API route handlers
│   │   ├── home.py            # Home page route
│   │   ├── converter.py       # Excel converter routes
│   │   └── docs_converter.py  # Word converter routes
│   ├── services/              # Business logic services
│   │   ├── file_manager.py    # File management service
│   │   ├── pdf_converter.py   # PDF to Excel converter
│   │   └── pdf_to_docs_converter.py  # PDF to Word converter
│   ├── models/                # Data models
│   │   └── schemas.py         # Pydantic schemas
│   ├── templates/             # HTML templates
│   │   └── index.html         # Web interface
│   ├── static/                # Static files and converted files
│   │   ├── pdfToExcel/       # Excel conversion storage
│   │   └── pdfToDocs/        # Word conversion storage
│   └── tests/                 # Test suite
│       ├── test_converter_routes.py
│       ├── test_docs_converter_routes.py
│       ├── test_file_manager.py
│       ├── test_file_manager_docs.py
│       ├── test_pdf_converter.py
│       └── test_pdf_to_docs_converter.py
├── API_DOCUMENTATION.md       # Full API documentation
├── API_QUICK_REFERENCE.md     # Quick reference guide
└── README.md                  # This file
```

## Testing

Run the test suite:

```bash
cd backend
pipenv run pytest
```

Run specific test files:

```bash
# Test Excel converter
pipenv run pytest tests/test_pdf_converter.py -v

# Test Word converter
pipenv run pytest tests/test_pdf_to_docs_converter.py -v

# Test API routes
pipenv run pytest tests/test_converter_routes.py -v
pipenv run pytest tests/test_docs_converter_routes.py -v
```

## File Constraints

- **Maximum file size:** 50 MB
- **Allowed file types:** PDF only
- **Conversion timeout:** 300 seconds (5 minutes)
- **File validation:** Extension, MIME type, and magic number checks

## Security Features

1. **File Type Validation** - Validates both extension and MIME type
2. **Magic Number Verification** - Checks PDF header (`%PDF`)
3. **Path Traversal Prevention** - Sanitizes filenames
4. **Unique Filenames** - Timestamp + random hash to prevent collisions
5. **Temporary File Cleanup** - Automatic cleanup of temporary files
6. **Size Limits** - Enforces maximum file size

## Technology Stack

- **Framework:** FastAPI
- **PDF Processing:** PyMuPDF (fitz), pdf2docx
- **Excel Generation:** pandas, openpyxl
- **Word Generation:** python-docx
- **File Management:** pathlib, tempfile
- **Testing:** pytest
- **Frontend:** Vanilla JavaScript, HTML5, CSS3

## Development

### Running in Development Mode

```bash
cd backend
pipenv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Optional configuration
MAX_FILE_SIZE_MB=10
CONVERSION_TIMEOUT_SECONDS=300
STORAGE_DIR=static
```

## Troubleshooting

### Common Issues

**Issue:** "Module not found" errors
```bash
# Solution: Install dependencies
pipenv install
```

**Issue:** "Permission denied" when saving files
```bash
# Solution: Check directory permissions
chmod 755 backend/static
```

**Issue:** Conversion timeout
```bash
# Solution: Increase timeout in .env file
CONVERSION_TIMEOUT_SECONDS=600
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check the [API Documentation](./API_DOCUMENTATION.md)
- Review the [Quick Reference](./API_QUICK_REFERENCE.md)

## Changelog

### Version 1.0.0 (2026-02-08)
- Initial release
- PDF to Excel conversion
- PDF to Word conversion
- Web interface
- File management
- Comprehensive test suite
- API documentation

---

**Made with ❤️ using FastAPI**
