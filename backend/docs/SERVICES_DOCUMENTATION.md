# Backend Services Documentation

This document provides comprehensive documentation for all backend services in the PDF Converter API.

## Table of Contents

1. [Authentication Services](#authentication-services)
2. [User Management Services](#user-management-services)
3. [File Management Services](#file-management-services)
4. [PDF Conversion Services](#pdf-conversion-services)
5. [Document Conversion Services](#document-conversion-services)
6. [Image Processing Services](#image-processing-services)

---

## Authentication Services

### Module: `services/auth.py`

Handles user authentication, token generation, and token refresh operations.

#### Functions

##### `authenticate_user(db: Session, email: str, password: str) -> User`

Authenticates a user with email and password credentials.

**Parameters:**
- `db` (Session): Database session
- `email` (str): User's email address
- `password` (str): Plain text password

**Returns:**
- `User`: Authenticated user object

**Raises:**
- `HTTPException(401)`: Invalid credentials
- `HTTPException(403)`: User account is inactive

**Example:**
```python
from services.auth import authenticate_user

user = authenticate_user(db, "user@example.com", "password123")
```

---

##### `create_token_pair(db: Session, user: User) -> tuple[str, str]`

Creates an access token and refresh token pair for authenticated user.

**Parameters:**
- `db` (Session): Database session
- `user` (User): Authenticated user object

**Returns:**
- `tuple[str, str]`: (access_token, refresh_token)

**Raises:**
- `HTTPException(500)`: Failed to generate valid refresh token

**Token Details:**
- Access Token: Short-lived (default: 30 minutes)
- Refresh Token: Long-lived (default: 7 days), stored in database

**Example:**
```python
from services.auth import create_token_pair

access_token, refresh_token = create_token_pair(db, user)
```

---

##### `refresh_access_token(db: Session, refresh_token: str) -> str`

Generates a new access token using a valid refresh token.

**Parameters:**
- `db` (Session): Database session
- `refresh_token` (str): Valid refresh token

**Returns:**
- `str`: New access token

**Raises:**
- `HTTPException(401)`: Invalid, revoked, or expired refresh token

**Example:**
```python
from services.auth import refresh_access_token

new_access_token = refresh_access_token(db, refresh_token)
```

---

## User Management Services

### Module: `services/users.py`

Manages user CRUD operations, role management, and default admin setup.

#### Functions

##### `get_user_by_email(db: Session, email: str) -> User | None`

Retrieves a user by email address.

**Parameters:**
- `db` (Session): Database session
- `email` (str): User's email address

**Returns:**
- `User | None`: User object if found, None otherwise

---

##### `get_user_by_id(db: Session, user_id: int) -> User | None`

Retrieves a user by ID.

**Parameters:**
- `db` (Session): Database session
- `user_id` (int): User's ID

**Returns:**
- `User | None`: User object if found, None otherwise

---

##### `list_users(db: Session) -> list[User]`

Lists all users in the system.

**Parameters:**
- `db` (Session): Database session

**Returns:**
- `list[User]`: List of all users ordered by ID

---

##### `create_user(db: Session, user_in: UserCreate, created_by_role: RoleEnum | None = None) -> User`

Creates a new user with role-based access control.

**Parameters:**
- `db` (Session): Database session
- `user_in` (UserCreate): User creation data
- `created_by_role` (RoleEnum | None): Role of the user creating this account

**Returns:**
- `User`: Newly created user object

**Raises:**
- `HTTPException(403)`: Admin users cannot create super_user accounts
- `HTTPException(400)`: Email already registered or username taken

**Role Hierarchy:**
- `super_user`: Full system access
- `admin_user`: Can manage general users
- `general_user`: Standard user access

**Example:**
```python
from services.users import create_user
from models.auth import UserCreate
from db.models import RoleEnum

user_data = UserCreate(
    email="newuser@example.com",
    username="newuser",
    password="SecurePass123!",
    role=RoleEnum.general_user
)

user = create_user(db, user_data, created_by_role=RoleEnum.admin_user)
```

---

##### `update_user_role(db: Session, user_id: int, new_role: RoleEnum) -> User`

Updates a user's role.

**Parameters:**
- `db` (Session): Database session
- `user_id` (int): User's ID
- `new_role` (RoleEnum): New role to assign

**Returns:**
- `User`: Updated user object

**Raises:**
- `HTTPException(404)`: User not found

---

##### `disable_user(db: Session, user_id: int) -> User`

Disables a user account.

**Parameters:**
- `db` (Session): Database session
- `user_id` (int): User's ID

**Returns:**
- `User`: Updated user object with `is_active=False`

**Raises:**
- `HTTPException(404)`: User not found

---

##### `ensure_default_super_user(db: Session) -> None`

Creates default super user if database is empty.

**Default Credentials:**
- Email: `admin@local`
- Password: `Admin@12345`

**Security Warning:** Change default credentials immediately in production!

---

## File Management Services

### Module: `services/file_manager.py`

Handles file upload validation, storage, and metadata management.

#### Class: `FileManagerService`

##### Constructor

```python
FileManagerService(storage_dir: str = "static/pdfToExcel")
```

**Parameters:**
- `storage_dir` (str): Directory for storing converted files

---

##### `validate_pdf_file(file: UploadFile) -> tuple[bool, Optional[str]]`

Validates uploaded PDF files using magic number verification.

**Parameters:**
- `file` (UploadFile): Uploaded file object

**Returns:**
- `tuple[bool, Optional[str]]`: (is_valid, error_message)

**Validation Checks:**
1. File extension is `.pdf`
2. File is not empty
3. File starts with PDF magic number (`%PDF-`)
4. File size ≤ 50MB

**Example:**
```python
service = FileManagerService()
is_valid, error = await service.validate_pdf_file(uploaded_file)
if not is_valid:
    raise HTTPException(400, detail=error)
```

---

##### `validate_docx_file(file: UploadFile) -> tuple[bool, Optional[str]]`

Validates uploaded DOCX files.

**Validation Checks:**
1. File extension is `.docx`
2. File is not empty
3. File starts with ZIP magic number (`PK\x03\x04`)
4. File size ≤ 50MB

---

##### `validate_excel_file(file: UploadFile) -> tuple[bool, Optional[str]]`

Validates uploaded Excel files (.xlsx, .xls).

**Validation Checks:**
1. File extension is `.xlsx` or `.xls`
2. File is not empty
3. File has correct magic number (ZIP for .xlsx, OLE for .xls)
4. File size ≤ 50MB

---

##### `validate_image_file(file: UploadFile) -> tuple[bool, Optional[str]]`

Validates uploaded image files.

**Supported Formats:**
- PNG
- JPG/JPEG
- WEBP

**Validation Checks:**
1. File extension matches supported formats
2. File is not empty
3. File has correct magic number
4. File size ≤ 50MB

---

##### `generate_unique_filename(original_filename: str, output_extension: str = ".xlsx") -> str`

Generates unique filename with timestamp and UUID.

**Parameters:**
- `original_filename` (str): Original uploaded filename
- `output_extension` (str): Desired output extension

**Returns:**
- `str`: Unique filename in format: `{name}_{timestamp}_{uuid}{extension}`

**Example:**
```python
filename = service.generate_unique_filename("invoice.pdf", ".xlsx")
# Returns: "invoice_20260223_143052_a1b2c3d4.xlsx"
```

---

##### `save_uploaded_file(file: UploadFile, filename: str) -> str`

Saves uploaded file to storage directory.

**Parameters:**
- `file` (UploadFile): File to save
- `filename` (str): Filename to use

**Returns:**
- `str`: Full path to saved file

---

##### `get_file_path(filename: str) -> Optional[str]`

Gets full path for a file with security checks.

**Security Features:**
- Prevents path traversal attacks
- Validates file exists

**Parameters:**
- `filename` (str): Filename to locate

**Returns:**
- `Optional[str]`: Full path if file exists, None otherwise

---

##### `list_converted_files(file_extension: str = ".xlsx") -> List[FileMetadata]`

Lists all converted files with metadata.

**Parameters:**
- `file_extension` (str): Filter by extension

**Returns:**
- `List[FileMetadata]`: List of file metadata objects

**FileMetadata Fields:**
- `filename`: Generated filename
- `original_name`: Original uploaded filename
- `conversion_date`: When file was converted
- `file_size`: Size in bytes
- `status`: Conversion status

---

## PDF Conversion Services

### Module: `services/pdf_to_excel_converter.py`

Converts PDF files to Excel format by extracting tables.

#### Class: `PDFToExcelConverterService`

##### Constructor

```python
PDFToExcelConverterService(timeout: int = 60)
```

**Parameters:**
- `timeout` (int): Maximum conversion time in seconds (default: 60)

---

##### `convert_pdf_to_excel(pdf_path: str, output_path: str) -> Tuple[bool, Optional[str]]`

Main conversion method that extracts tables from PDF and creates Excel file.

**Parameters:**
- `pdf_path` (str): Path to input PDF file
- `output_path` (str): Path for output Excel file

**Returns:**
- `Tuple[bool, Optional[str]]`: (success, error_message)

**Features:**
- Multi-page PDF support
- Multiple tables per page
- Automatic table detection
- Timeout protection
- Formatted Excel output with headers

**Error Handling:**
- File not found
- Corrupted PDF files
- No tables found
- Conversion timeout
- Permission errors

**Example:**
```python
converter = PDFToExcelConverterService(timeout=120)
success, error = converter.convert_pdf_to_excel("input.pdf", "output.xlsx")
if not success:
    print(f"Conversion failed: {error}")
```

---

##### `extract_tables_from_pdf(pdf_path: str) -> List[pd.DataFrame]`

Extracts all tables from PDF as pandas DataFrames.

**Parameters:**
- `pdf_path` (str): Path to PDF file

**Returns:**
- `List[pd.DataFrame]`: List of extracted tables

**Raises:**
- `FileNotFoundError`: PDF file doesn't exist
- `ValueError`: PDF is corrupted or invalid
- `ConversionTimeoutError`: Extraction timeout

---

##### `convert_dataframes_to_excel(dataframes: List[pd.DataFrame], output_path: str) -> bool`

Converts DataFrames to formatted Excel file.

**Parameters:**
- `dataframes` (List[pd.DataFrame]): Tables to convert
- `output_path` (str): Output Excel path

**Returns:**
- `bool`: True if successful

**Excel Formatting:**
- Each table on separate sheet
- Formatted headers (blue background, white text, bold)
- Auto-adjusted column widths
- Center-aligned cells

---

### Module: `services/pdf_to_docs_converter.py`

Converts PDF files to Word document format.

#### Class: `PDFToDocsConverterService`

##### Constructor

```python
PDFToDocsConverterService(timeout: int = 60)
```

**Parameters:**
- `timeout` (int): Maximum conversion time in seconds

---

##### `convert_pdf_to_docx(pdf_path: str, output_path: str) -> Tuple[bool, Optional[str]]`

Converts PDF to DOCX format preserving content and formatting.

**Parameters:**
- `pdf_path` (str): Path to input PDF
- `output_path` (str): Path for output DOCX

**Returns:**
- `Tuple[bool, Optional[str]]`: (success, error_message)

**Preserved Elements:**
- Text content
- Basic formatting (fonts, colors, alignment)
- Embedded images
- Page structure

**Special Cases:**
- Empty PDFs: Creates DOCX with informational message
- Corrupted PDFs: Returns descriptive error

**Example:**
```python
converter = PDFToDocsConverterService()
success, error = converter.convert_pdf_to_docx("document.pdf", "document.docx")
```

---

### Module: `services/pdf_page_remover.py`

Removes selected or blank pages from PDF files.

#### Class: `PDFPageRemoverService`

##### `remove_pages(input_path: str, output_path: str, pages_spec: Optional[str] = None, remove_blank: bool = False) -> Tuple[bool, Optional[str]]`

Removes specified pages and/or blank pages from PDF.

**Parameters:**
- `input_path` (str): Input PDF path
- `output_path` (str): Output PDF path
- `pages_spec` (Optional[str]): Pages to remove (e.g., "1,3-5,7")
- `remove_blank` (bool): Whether to remove blank pages

**Returns:**
- `Tuple[bool, Optional[str]]`: (success, error_message)

**Pages Specification Format:**
- Single pages: `"1,3,5"`
- Ranges: `"1-5"`
- Combined: `"1,3-5,7,10-12"`

**Blank Page Detection:**
- No extractable text
- No images or XObjects

**Example:**
```python
service = PDFPageRemoverService()
success, error = service.remove_pages(
    "input.pdf",
    "output.pdf",
    pages_spec="1,3-5",
    remove_blank=True
)
```

---

## Document Conversion Services

### Module: `services/docx_to_pdf_converter.py`

Converts Word documents to PDF format using LibreOffice.

#### Class: `DOCXToPDFConverterService`

##### Constructor

```python
DOCXToPDFConverterService(timeout: int = 60)
```

---

##### `convert_docx_to_pdf(docx_path: str, output_path: str) -> Tuple[bool, Optional[str]]`

Converts DOCX to PDF using LibreOffice headless mode.

**Parameters:**
- `docx_path` (str): Input DOCX path
- `output_path` (str): Output PDF path

**Returns:**
- `Tuple[bool, Optional[str]]`: (success, error_message)

**Requirements:**
- LibreOffice must be installed (`soffice` or `libreoffice` command)

**Features:**
- Preserves formatting
- Handles complex documents
- Timeout protection
- Cross-device safe file operations

**Example:**
```python
converter = DOCXToPDFConverterService()
success, error = converter.convert_docx_to_pdf("document.docx", "document.pdf")
```

---

### Module: `services/excel_to_pdf_converter.py`

Converts Excel spreadsheets to PDF format using LibreOffice.

#### Class: `ExcelToPDFConverterService`

##### Constructor

```python
ExcelToPDFConverterService(timeout: int = 60)
```

---

##### `convert_excel_to_pdf(excel_path: str, output_path: str) -> Tuple[bool, Optional[str]]`

Converts Excel file (.xlsx, .xls) to PDF.

**Parameters:**
- `excel_path` (str): Input Excel path
- `output_path` (str): Output PDF path

**Returns:**
- `Tuple[bool, Optional[str]]`: (success, error_message)

**Requirements:**
- LibreOffice must be installed

**Supported Formats:**
- .xlsx (Excel 2007+)
- .xls (Excel 97-2003)

---

## Image Processing Services

### Module: `services/image_to_pdf_converter.py`

Converts image files to PDF format.

#### Class: `ImageToPDFConverterService`

##### `convert_image_to_pdf(image_path: str, output_path: str) -> Tuple[bool, Optional[str]]`

Converts image to PDF using Pillow.

**Parameters:**
- `image_path` (str): Input image path
- `output_path` (str): Output PDF path

**Returns:**
- `Tuple[bool, Optional[str]]`: (success, error_message)

**Supported Formats:**
- PNG
- JPG/JPEG
- WEBP

**Features:**
- Automatic transparency handling (converts to white background)
- RGB color space conversion
- 100 DPI resolution

**Example:**
```python
converter = ImageToPDFConverterService()
success, error = converter.convert_image_to_pdf("photo.png", "photo.pdf")
```

---

### Module: `services/background_remover.py`

Removes backgrounds from images using AI.

#### Class: `BackgroundRemoverService`

##### `remove_background(input_path: str, output_path: str) -> Tuple[bool, Optional[str]]`

Removes background from image using rembg library.

**Parameters:**
- `input_path` (str): Input image path
- `output_path` (str): Output PNG path

**Returns:**
- `Tuple[bool, Optional[str]]`: (success, error_message)

**Requirements:**
- `rembg` library must be installed

**Output Format:**
- Always PNG with transparency

**Example:**
```python
service = BackgroundRemoverService()
success, error = service.remove_background("photo.jpg", "photo_nobg.png")
```

---

## Common Patterns

### Error Handling

All services follow a consistent error handling pattern:

```python
success, error_message = service.method(...)
if not success:
    raise HTTPException(status_code=400, detail=error_message)
```

### Timeout Protection

Services that may take long time include timeout mechanisms:

```python
service = ConverterService(timeout=120)  # 2 minutes
```

### File Validation

Always validate files before processing:

```python
is_valid, error = await file_manager.validate_pdf_file(file)
if not is_valid:
    raise HTTPException(400, detail=error)
```

### Unique Filename Generation

Generate unique filenames to prevent collisions:

```python
unique_name = file_manager.generate_unique_filename(
    original_filename="document.pdf",
    output_extension=".xlsx"
)
```

---

## Security Considerations

1. **File Validation**: All uploads validated using magic numbers, not just extensions
2. **Path Traversal Prevention**: Filenames sanitized to prevent directory traversal
3. **File Size Limits**: Maximum 50MB per file
4. **Timeout Protection**: Prevents resource exhaustion from large files
5. **Role-Based Access**: User operations respect role hierarchy
6. **Password Hashing**: Uses bcrypt for secure password storage

---

## Performance Tips

1. **Adjust Timeouts**: Increase timeout for large files
2. **Storage Management**: Regularly clean up old converted files
3. **Database Indexing**: Ensure email and username fields are indexed
4. **Async Operations**: Use async file operations where possible
5. **Resource Cleanup**: Services properly close file handles and temporary files

---

## Dependencies

### Core Dependencies
- `fastapi`: Web framework
- `sqlalchemy`: Database ORM
- `bcrypt`: Password hashing
- `python-jose`: JWT token handling

### Conversion Dependencies
- `pdfplumber`: PDF table extraction
- `pdf2docx`: PDF to Word conversion
- `pypdf`: PDF manipulation
- `openpyxl`: Excel file creation
- `pandas`: Data manipulation
- `Pillow`: Image processing
- `rembg`: Background removal

### System Dependencies
- LibreOffice: Required for DOCX/Excel to PDF conversion

---

## Installation

```bash
cd backend
pipenv install
```

For background removal feature:
```bash
pipenv install rembg[cpu]
```

For LibreOffice (Ubuntu/Debian):
```bash
sudo apt-get install libreoffice
```

---

## Testing

Each service has corresponding test files in `backend/tests/`:

```bash
# Run all tests
pipenv run pytest

# Run specific service tests
pipenv run pytest tests/test_pdf_converter.py
pipenv run pytest tests/test_auth.py
```

---

## Support

For issues or questions:
1. Check API documentation: `API_DOCUMENTATION.md`
2. Review endpoint examples: `API_ENDPOINTS_SUMMARY.md`
3. Test with Postman collection: `PDF_Converter_API.postman_collection.json`
