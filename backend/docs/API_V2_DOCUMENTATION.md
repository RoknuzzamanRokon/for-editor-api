# PDF Converter API v2 Documentation

## Overview

API v2 is the authenticated version of the PDF Converter API with role-based access control (RBAC). All endpoints (except authentication) require a valid JWT access token.

**Base URL:** `/api/v2`

**Authentication:** Bearer Token (JWT)

**Version:** 2.0

---

## Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [File Conversion Endpoints](#file-conversion-endpoints)
4. [Common Response Models](#common-response-models)
5. [Error Handling](#error-handling)
6. [Role-Based Access Control](#role-based-access-control)
7. [Rate Limiting & Security](#rate-limiting--security)

---

## Authentication

### POST /api/v2/auth/login

Login with email and password to receive access and refresh tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errors:**
- `400 Bad Request` - Invalid email format or password too short
- `401 Unauthorized` - Invalid credentials
- `403 Forbidden` - Account is disabled

---

### POST /api/v2/auth/refresh

Refresh an expired access token using a valid refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errors:**
- `401 Unauthorized` - Invalid or expired refresh token
- `403 Forbidden` - Token has been revoked

---

### GET /api/v2/auth/me

Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "john_doe",
  "role": "general_user",
  "is_active": true,
  "created_at": "2026-02-23T10:30:00"
}
```

**Errors:**
- `401 Unauthorized` - Missing or invalid token

---

## User Management

### POST /api/v2/users

Create a new user account.

**Required Role:** `super_user` or `admin_user`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "secure_password",
  "username": "new_user",
  "role": "general_user"
}
```

**Field Descriptions:**
- `email` (required) - User's email address (must be unique)
- `password` (required) - User's password (minimum 6 characters)
- `username` (optional) - Username (must be unique if provided)
- `role` (optional) - User role, defaults to `general_user` if not specified

**Response (200 OK):**
```json
{
  "id": 5,
  "email": "newuser@example.com",
  "username": "new_user",
  "role": "general_user",
  "is_active": true,
  "created_at": "2026-02-23T11:00:00"
}
```

**Role Creation Rules:**
- `admin_user` can create: `general_user`, `demo_user`
- `super_user` can create: `super_user`, `admin_user`, `general_user`, `demo_user`

**Examples:**

**Create a general user:**
```bash
curl -X POST "http://localhost:8000/api/v2/users" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "username": "regularuser",
    "role": "general_user"
  }'
```

**Create a demo user:**
```bash
curl -X POST "http://localhost:8000/api/v2/users" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "demo123456",
    "username": "demouser",
    "role": "demo_user"
  }'
```

**Create an admin user (super_user only):**
```bash
curl -X POST "http://localhost:8000/api/v2/users" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123456",
    "username": "adminuser",
    "role": "admin_user"
  }'
```

**Python Example:**
```python
import requests

url = "http://localhost:8000/api/v2/users"
headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}
payload = {
    "email": "newuser@example.com",
    "password": "secure_password",
    "username": "new_user",
    "role": "general_user"
}

response = requests.post(url, headers=headers, json=payload)
if response.status_code == 200:
    user = response.json()
    print(f"User created: {user['email']} (ID: {user['id']})")
else:
    print(f"Error: {response.json()['detail']}")
```

**Errors:**
- `400 Bad Request` - Invalid email, password too short, or user already exists
  ```json
  {"detail": "Email already registered"}
  ```
  ```json
  {"detail": "Username already taken"}
  ```
- `401 Unauthorized` - Missing or invalid token
  ```json
  {"detail": "Invalid token"}
  ```
- `403 Forbidden` - Insufficient permissions
  ```json
  {"detail": "Admin cannot create super_user"}
  ```
- `422 Unprocessable Entity` - Validation error
  ```json
  {
    "detail": [
      {
        "loc": ["body", "password"],
        "msg": "ensure this value has at least 6 characters",
        "type": "value_error.any_str.min_length"
      }
    ]
  }
  ```

---

### GET /api/v2/users

List all users in the system.

**Required Role:** `super_user` or `admin_user`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "email": "admin@example.com",
    "username": "admin",
    "role": "super_user",
    "is_active": true,
    "created_at": "2026-01-01T00:00:00"
  },
  {
    "id": 2,
    "email": "user@example.com",
    "username": "user",
    "role": "general_user",
    "is_active": true,
    "created_at": "2026-02-15T10:30:00"
  }
]
```

---

### PATCH /api/v2/users/{user_id}/role

Update a user's role.

**Required Role:** `super_user` only

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "role": "admin_user"
}
```

**Response (200 OK):**
```json
{
  "id": 5,
  "email": "user@example.com",
  "username": "user",
  "role": "admin_user",
  "is_active": true,
  "created_at": "2026-02-15T10:30:00"
}
```

**Errors:**
- `403 Forbidden` - Only super_user can change roles
- `404 Not Found` - User not found

---

### PATCH /api/v2/users/{user_id}/disable

Disable a user account.

**Required Role:** `super_user` or `admin_user`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 5,
  "is_active": false
}
```

**Errors:**
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - User not found

---

## File Conversion Endpoints

All conversion endpoints require authentication and follow the same pattern:
1. Upload file for conversion
2. List converted files
3. Download converted file

**Required Roles:** All authenticated users (`super_user`, `admin_user`, `general_user`, `demo_user`)

**Note:** `demo_user` role has read-only access (cannot upload/convert files)

---

### 1. PDF to Word Conversion

#### POST /api/v2/conversions/pdf-to-word

Convert PDF file to Word document (.docx).

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request:**
```
file: <PDF file> (max 50MB)
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "PDF converted successfully",
  "filename": "document_20260223_120000_abc123.docx",
  "download_url": "/api/v2/conversions/pdf-to-word/files/document_20260223_120000_abc123.docx"
}
```

**Errors:**
- `400 Bad Request` - Invalid file type or size exceeds limit
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Demo users cannot upload files
- `500 Internal Server Error` - Conversion failed

---

#### GET /api/v2/conversions/pdf-to-word/files

List all converted Word documents.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "files": [
    {
      "filename": "document_20260223_120000_abc123.docx",
      "original_name": "document.pdf",
      "conversion_date": "2026-02-23T12:00:00",
      "file_size": 245760,
      "status": "success"
    }
  ],
  "total_count": 1
}
```

---

#### GET /api/v2/conversions/pdf-to-word/files/{filename}

Download a converted Word document.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
- Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Content-Disposition: `attachment; filename="document.docx"`
- Binary file content

**Errors:**
- `404 Not Found` - File not found

---

### 2. PDF to Excel Conversion

#### POST /api/v2/conversions/pdf-to-excel

Convert PDF file to Excel spreadsheet (.xlsx).

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request:**
```
file: <PDF file> (max 50MB)
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "PDF converted successfully",
  "filename": "spreadsheet_20260223_120000_def456.xlsx",
  "download_url": "/api/v2/conversions/pdf-to-excel/files/spreadsheet_20260223_120000_def456.xlsx"
}
```

---

#### GET /api/v2/conversions/pdf-to-excel/files

List all converted Excel files.

**Response:** Same structure as PDF to Word listing.

---

#### GET /api/v2/conversions/pdf-to-excel/files/{filename}

Download a converted Excel file.

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Binary file content

---

### 3. DOCX to PDF Conversion

#### POST /api/v2/conversions/docx-to-pdf

Convert Word document to PDF.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request:**
```
file: <DOCX file> (max 50MB)
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "DOCX converted successfully",
  "filename": "document_20260223_120000_ghi789.pdf",
  "download_url": "/api/v2/conversions/docx-to-pdf/files/document_20260223_120000_ghi789.pdf"
}
```

---

#### GET /api/v2/conversions/docx-to-pdf/files

List all converted PDF files.

---

#### GET /api/v2/conversions/docx-to-pdf/files/{filename}

Download a converted PDF file.

**Response:**
- Content-Type: `application/pdf`
- Binary file content

---

### 4. Excel to PDF Conversion

#### POST /api/v2/conversions/excel-to-pdf

Convert Excel spreadsheet to PDF.

**Supported formats:** `.xlsx`, `.xls`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request:**
```
file: <Excel file> (max 50MB)
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Excel converted successfully",
  "filename": "spreadsheet_20260223_120000_jkl012.pdf",
  "download_url": "/api/v2/conversions/excel-to-pdf/files/spreadsheet_20260223_120000_jkl012.pdf"
}
```

---

#### GET /api/v2/conversions/excel-to-pdf/files

List all converted PDF files.

---

#### GET /api/v2/conversions/excel-to-pdf/files/{filename}

Download a converted PDF file.

---

### 5. Image to PDF Conversion

#### POST /api/v2/conversions/image-to-pdf

Convert image to PDF.

**Supported formats:** `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.tiff`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request:**
```
file: <Image file> (max 50MB)
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Image converted successfully",
  "filename": "image_20260223_120000_mno345.pdf",
  "download_url": "/api/v2/conversions/image-to-pdf/files/image_20260223_120000_mno345.pdf"
}
```

---

#### GET /api/v2/conversions/image-to-pdf/files

List all converted PDF files.

---

#### GET /api/v2/conversions/image-to-pdf/files/{filename}

Download a converted PDF file.

---

### 6. Remove Pages from PDF

#### POST /api/v2/conversions/remove-pages-from-pdf

Remove specific pages or blank pages from a PDF.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request:**
```
file: <PDF file> (max 50MB)
pages: "1,3,5-7" (optional - comma-separated page numbers or ranges)
remove_blank: true (optional - remove blank pages)
```

**Examples:**
- Remove pages 1, 3, and 5-7: `pages=1,3,5-7`
- Remove only blank pages: `remove_blank=true`
- Remove pages 2-4 and blank pages: `pages=2-4&remove_blank=true`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "PDF updated successfully",
  "filename": "document_20260223_120000_pqr678.pdf",
  "download_url": "/api/v2/conversions/remove-pages-from-pdf/files/document_20260223_120000_pqr678.pdf"
}
```

---

#### GET /api/v2/conversions/remove-pages-from-pdf/files

List all processed PDF files.

---

#### GET /api/v2/conversions/remove-pages-from-pdf/files/{filename}

Download a processed PDF file.

---

### 7. Remove Background from Image

#### POST /api/v2/conversions/remove-background

Remove background from an image.

**Supported formats:** `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`

**Output format:** `.png` (with transparency)

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request:**
```
file: <Image file> (max 50MB)
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Background removed successfully",
  "filename": "image_20260223_120000_stu901.png",
  "download_url": "/api/v2/conversions/remove-background/files/image_20260223_120000_stu901.png"
}
```

---

#### GET /api/v2/conversions/remove-background/files

List all processed PNG files.

---

#### GET /api/v2/conversions/remove-background/files/{filename}

Download a processed PNG file.

**Response:**
- Content-Type: `image/png`
- Binary file content

---

## Common Response Models

### ConversionResponse

```json
{
  "success": boolean,
  "message": string,
  "filename": string | null,
  "download_url": string | null
}
```

### FileMetadata

```json
{
  "filename": string,
  "original_name": string,
  "conversion_date": datetime,
  "file_size": integer,
  "status": "success" | "failed" | "processing"
}
```

### FileListResponse

```json
{
  "files": [FileMetadata],
  "total_count": integer
}
```

### UserOut

```json
{
  "id": integer,
  "email": string,
  "username": string | null,
  "role": "super_user" | "admin_user" | "general_user" | "demo_user",
  "is_active": boolean,
  "created_at": datetime
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "detail": "Error message description"
}
```

### HTTP Status Codes

- `200 OK` - Request successful
- `400 Bad Request` - Invalid request data or file validation failed
- `401 Unauthorized` - Missing, invalid, or expired token
- `403 Forbidden` - Insufficient permissions or account disabled
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server-side error

### Common Error Messages

**Authentication Errors:**
- `"Invalid credentials"` - Wrong email or password
- `"Invalid token"` - Token is malformed or expired
- `"Token has been revoked"` - Refresh token was revoked

**Authorization Errors:**
- `"Insufficient permissions"` - User role doesn't have access
- `"Demo users cannot perform write operations"` - Demo user tried to upload

**File Validation Errors:**
- `"File size exceeds maximum limit of 50MB"`
- `"Invalid file type. Expected: application/pdf"`
- `"File is empty or corrupted"`

**Conversion Errors:**
- `"Conversion failed"` - Generic conversion error
- `"No tables found in PDF"` - PDF to Excel with no tables
- `"Invalid page specification"` - Bad page range format

---

## Role-Based Access Control

### User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `super_user` | System administrator | Full access to all endpoints, can manage all users |
| `admin_user` | Organization administrator | Can create/manage general and demo users, full conversion access |
| `general_user` | Regular user | Full conversion access, cannot manage users |
| `demo_user` | Read-only demo account | Can list and download files, cannot upload/convert |

### Permission Matrix

| Endpoint | super_user | admin_user | general_user | demo_user |
|----------|------------|------------|--------------|-----------|
| POST /auth/login | ✅ | ✅ | ✅ | ✅ |
| POST /auth/refresh | ✅ | ✅ | ✅ | ✅ |
| GET /auth/me | ✅ | ✅ | ✅ | ✅ |
| POST /users | ✅ | ✅ (limited) | ❌ | ❌ |
| GET /users | ✅ | ✅ | ❌ | ❌ |
| PATCH /users/{id}/role | ✅ | ❌ | ❌ | ❌ |
| PATCH /users/{id}/disable | ✅ | ✅ | ❌ | ❌ |
| POST /conversions/* | ✅ | ✅ | ✅ | ❌ |
| GET /conversions/*/files | ✅ | ✅ | ✅ | ✅ |
| GET /conversions/*/files/{filename} | ✅ | ✅ | ✅ | ✅ |

---

## Rate Limiting & Security

### File Upload Limits

- **Maximum file size:** 50MB
- **Allowed file types:** PDF, DOCX, XLSX, XLS, JPG, JPEG, PNG, GIF, BMP, TIFF
- **File validation:** Content-type and extension validation
- **Path traversal protection:** Filename sanitization

### Token Expiration

- **Access token:** 30 minutes (configurable)
- **Refresh token:** 7 days (configurable)

### Security Features

- **Password hashing:** bcrypt with salt
- **JWT signing:** HS256 algorithm
- **Token revocation:** Refresh tokens can be revoked
- **CORS:** Configurable cross-origin resource sharing
- **Input validation:** Pydantic models with strict validation
- **SQL injection protection:** SQLAlchemy ORM with parameterized queries

---

## Example Usage

### Complete Workflow Example

```bash
# 1. Login
curl -X POST "http://localhost:8000/api/v2/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure_password"
  }'

# Response: { "access_token": "...", "refresh_token": "...", "token_type": "bearer" }

# 2. Upload and convert PDF to Word
curl -X POST "http://localhost:8000/api/v2/conversions/pdf-to-word" \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@document.pdf"

# Response: { "success": true, "filename": "...", "download_url": "..." }

# 3. List converted files
curl -X GET "http://localhost:8000/api/v2/conversions/pdf-to-word/files" \
  -H "Authorization: Bearer <access_token>"

# 4. Download converted file
curl -X GET "http://localhost:8000/api/v2/conversions/pdf-to-word/files/document_20260223_120000_abc123.docx" \
  -H "Authorization: Bearer <access_token>" \
  -o "converted_document.docx"

# 5. Refresh token when access token expires
curl -X POST "http://localhost:8000/api/v2/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "<refresh_token>"
  }'
```

### User Management Workflow

```bash
# 1. Login as super_user or admin_user
TOKEN=$(curl -s -X POST "http://localhost:8000/api/v2/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.access_token')

# 2. Create a new general user
curl -X POST "http://localhost:8000/api/v2/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "username": "newuser",
    "role": "general_user"
  }'

# 3. List all users
curl -X GET "http://localhost:8000/api/v2/users" \
  -H "Authorization: Bearer $TOKEN"

# 4. Update user role (super_user only)
curl -X PATCH "http://localhost:8000/api/v2/users/5/role" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin_user"
  }'

# 5. Disable a user
curl -X PATCH "http://localhost:8000/api/v2/users/5/disable" \
  -H "Authorization: Bearer $TOKEN"
```

### Python Complete Example

```python
import requests

BASE_URL = "http://localhost:8000/api/v2"

# 1. Login
def login(email: str, password: str) -> str:
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password}
    )
    response.raise_for_status()
    return response.json()["access_token"]

# 2. Create user
def create_user(token: str, email: str, password: str, role: str = "general_user"):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/users",
        headers=headers,
        json={
            "email": email,
            "password": password,
            "role": role
        }
    )
    response.raise_for_status()
    return response.json()

# 3. Convert PDF to Word
def convert_pdf_to_word(token: str, pdf_path: str):
    headers = {"Authorization": f"Bearer {token}"}
    files = {"file": open(pdf_path, "rb")}
    response = requests.post(
        f"{BASE_URL}/conversions/pdf-to-word",
        headers=headers,
        files=files
    )
    response.raise_for_status()
    return response.json()

# 4. Download converted file
def download_file(token: str, download_url: str, output_path: str):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}{download_url}",
        headers=headers
    )
    response.raise_for_status()
    with open(output_path, "wb") as f:
        f.write(response.content)

# Usage
try:
    # Login
    token = login("admin@example.com", "admin123")
    print("✅ Logged in successfully")
    
    # Create user
    user = create_user(token, "newuser@example.com", "password123", "general_user")
    print(f"✅ User created: {user['email']} (ID: {user['id']})")
    
    # Convert file
    result = convert_pdf_to_word(token, "document.pdf")
    if result["success"]:
        print(f"✅ Conversion successful: {result['filename']}")
        
        # Download converted file
        download_file(token, result["download_url"], "converted.docx")
        print("✅ File downloaded successfully")
    
except requests.exceptions.HTTPError as e:
    print(f"❌ Error: {e.response.json()['detail']}")
except Exception as e:
    print(f"❌ Error: {str(e)}")
```

---

## Migration from v1 to v2

### Key Differences

| Feature | v1 | v2 |
|---------|----|----|
| Authentication | None | Required (JWT) |
| Authorization | None | Role-based access control |
| User Management | None | Full user CRUD |
| Token Refresh | N/A | Supported |
| Demo Mode | None | Read-only demo_user role |
| Base Path | `/api/v1` | `/api/v2` |

### Migration Steps

1. **Create user accounts** for all API consumers
2. **Update client applications** to include authentication flow
3. **Store and refresh tokens** appropriately
4. **Update API endpoints** from `/api/v1/*` to `/api/v2/*`
5. **Handle 401/403 errors** for authentication/authorization failures

---

## Support & Contact

For issues, questions, or feature requests, please contact the development team or refer to the main project documentation.

**API Version:** 2.0  
**Last Updated:** February 23, 2026
