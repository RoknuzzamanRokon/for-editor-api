# ConvertPro API - Complete Usage Guide

## Overview

ConvertPro API is a comprehensive file conversion platform with authentication, role-based access control, points-based billing, and granular permissions. Convert PDFs, documents, images, and more with a secure, production-ready REST API.

**Base URL:** `http://localhost:8000` (or your deployed URL)

**Current Version:** v3 (with v2 and v1 still available)

---

## Quick Start

### 1. Register a Demo Account

```bash
curl -X POST "http://localhost:8000/api/v2/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "password123",
    "selected_actions": ["pdf_to_docs", "pdf_to_excel", "docx_to_pdf"]
  }'
```

### 2. Login

```bash
curl -X POST "http://localhost:8000/api/v2/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 3. Check Your Balance (v3)

```bash
curl -X GET "http://localhost:8000/api/v3/points/balance" \
  -H "Authorization: Bearer <access_token>"
```

### 4. Convert a File (v3)

```bash
curl -X POST "http://localhost:8000/api/v3/conversions/pdf-to-word" \
  -H "Authorization: Bearer <access_token>" \
  -H "Idempotency-Key: $(uuidgen)" \
  -F "file=@document.pdf"
```

**Response:**
```json
{
  "success": true,
  "message": "PDF converted successfully",
  "filename": "document_20260425_120000_abc123.docx",
  "download_url": "/api/v3/conversions/pdf-to-word/files/document_20260425_120000_abc123.docx"
}
```

### 5. Download the Result

```bash
curl -X GET "http://localhost:8000/api/v3/conversions/pdf-to-word/files/document_20260425_120000_abc123.docx" \
  -H "Authorization: Bearer <access_token>" \
  -o "converted.docx"
```

---

## API Versions

### v3 - Points & Permissions (Recommended)

**Features:**
- Points-based billing (3 points per conversion)
- Granular per-action permissions
- Idempotency support
- Automatic refunds on failure
- Complete audit trail

**Base Path:** `/api/v3`

**Use when:** You need billing control, permission management, or production-grade reliability

### v2 - Authentication & RBAC

**Features:**
- JWT authentication
- Role-based access control
- User management
- All conversion endpoints

**Base Path:** `/api/v2`

**Use when:** You need authentication but not billing/permissions

### v1 - Public API (Legacy)

**Features:**
- No authentication
- Basic conversions only
- Public access

**Base Path:** `/api/v1`

**Use when:** Testing or internal tools without auth requirements

---

## Available Conversions

| Conversion | v1 | v2 | v3 | Cost (v3) |
|------------|----|----|----|----|
| PDF → Word | ✅ | ✅ | ✅ | 3 points |
| PDF → Excel | ✅ | ✅ | ✅ | 3 points |
| DOCX → PDF | ❌ | ✅ | ✅ | 3 points |
| Excel → PDF | ❌ | ✅ | ✅ | 3 points |
| Image → PDF | ❌ | ✅ | ✅ | 3 points |
| Remove PDF Pages | ❌ | ✅ | ✅ | 3 points |
| Remove Background | ❌ | ✅ | ❌ | N/A |

---

## User Roles

| Role | Points | Permissions | Can Create Users |
|------|--------|-------------|------------------|
| **demo_user** | 0 | Read-only | No |
| **general_user** | 30 | Full conversions | No |
| **admin_user** | 100 | Full conversions + User management | Yes (general/demo) |
| **super_user** | Unlimited | Everything | Yes (all roles) |

---

## Authentication

### Register (Demo Self-Registration)

```bash
POST /api/v2/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "selected_actions": ["pdf_to_docs", "pdf_to_excel", "docx_to_pdf"]
}
```

**Rules:**
- One demo account per email
- Select up to 3 APIs
- 8-day trial period
- 33 points allocated

### Login

```bash
POST /api/v2/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Returns:**
- `access_token` - Use for API requests (expires in 30 minutes)
- `refresh_token` - Use to get new access token (expires in 7 days)

### Refresh Token

```bash
POST /api/v2/auth/refresh
Content-Type: application/json

{
  "refresh_token": "<refresh_token>"
}
```

### Get Current User

```bash
GET /api/v2/auth/me
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 5,
  "email": "user@example.com",
  "username": "user",
  "role": "demo_user",
  "is_active": true,
  "demo_expires_at": "2026-05-02T12:00:00",
  "points": {
    "balance": 27,
    "total_topup": 33,
    "total_spent": 6,
    "total_refunded": 0
  },
  "active_api_count": 3,
  "active_apis": [
    {
      "action": "pdf_to_docs",
      "label": "PDF to Word",
      "allowed": true,
      "points": 3
    }
  ]
}
```

---

## Points System (v3)

### Check Balance

```bash
GET /api/v3/points/balance
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "balance": 27
}
```

### View Transaction History

```bash
GET /api/v3/points/ledger?limit=10&offset=0
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "items": [
    {
      "id": 123,
      "action": "pdf_to_docs",
      "amount": -3,
      "status": "spent",
      "request_id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2026-04-25T12:00:00"
    },
    {
      "id": 122,
      "action": "topup",
      "amount": 30,
      "status": "topup",
      "created_at": "2026-04-25T10:00:00"
    }
  ],
  "limit": 10,
  "offset": 0
}
```

### Top-up Points (Admin/Super User Only)

```bash
POST /api/v3/points/topup
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "user_id": 5,
  "amount": 50,
  "note": "Monthly allocation"
}
```

---

## Permissions System (v3)

### List Available Actions

```bash
GET /api/v3/permissions/actions
Authorization: Bearer <access_token>
```

**Response:**
```json
[
  {"action": "pdf_to_docs", "label": "PDF to Word"},
  {"action": "pdf_to_excel", "label": "PDF to Excel"},
  {"action": "docx_to_pdf", "label": "DOCX to PDF"},
  {"action": "excel_to_pdf", "label": "Excel to PDF"},
  {"action": "image_to_pdf", "label": "Image to PDF"},
  {"action": "pdf_page_remove", "label": "Remove PDF Pages"}
]
```

### Get User Permissions

```bash
GET /api/v3/permissions/users/5/permissions
Authorization: Bearer <access_token>
```

### Set User Permissions (Admin/Super User Only)

```bash
PUT /api/v3/permissions/users/5/permissions
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "permissions": [
    {"action": "pdf_to_docs", "is_allowed": true},
    {"action": "pdf_to_excel", "is_allowed": true},
    {"action": "docx_to_pdf", "is_allowed": false}
  ]
}
```

---

## File Conversions

### PDF to Word

```bash
POST /api/v3/conversions/pdf-to-word
Authorization: Bearer <access_token>
Idempotency-Key: <uuid>
Content-Type: multipart/form-data

file=@document.pdf
```

### PDF to Excel

```bash
POST /api/v3/conversions/pdf-to-excel
Authorization: Bearer <access_token>
Idempotency-Key: <uuid>
Content-Type: multipart/form-data

file=@spreadsheet.pdf
```

### DOCX to PDF

```bash
POST /api/v3/conversions/docx-to-pdf
Authorization: Bearer <access_token>
Idempotency-Key: <uuid>
Content-Type: multipart/form-data

file=@document.docx
```

### Excel to PDF

```bash
POST /api/v3/conversions/excel-to-pdf
Authorization: Bearer <access_token>
Idempotency-Key: <uuid>
Content-Type: multipart/form-data

file=@spreadsheet.xlsx
```

### Image to PDF

```bash
POST /api/v3/conversions/image-to-pdf
Authorization: Bearer <access_token>
Idempotency-Key: <uuid>
Content-Type: multipart/form-data

file=@photo.jpg
```

**Supported formats:** JPG, JPEG, PNG, GIF, BMP, TIFF

### Remove PDF Pages

```bash
POST /api/v3/conversions/remove-pages-from-pdf
Authorization: Bearer <access_token>
Idempotency-Key: <uuid>
Content-Type: multipart/form-data

file=@document.pdf
pages=1,3,5-7
remove_blank=true
```

**Parameters:**
- `pages` - Comma-separated page numbers or ranges (e.g., "1,3,5-7")
- `remove_blank` - Remove blank pages (true/false)

---

## Idempotency

Use the `Idempotency-Key` header to prevent duplicate charges and ensure safe retries.

### Generate a Key

```bash
# Linux/Mac
IDEMPOTENCY_KEY=$(uuidgen)

# Python
import uuid
idempotency_key = str(uuid.uuid4())
```

### Use the Key

```bash
curl -X POST "http://localhost:8000/api/v3/conversions/pdf-to-word" \
  -H "Authorization: Bearer <access_token>" \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -F "file=@document.pdf"
```

### Replay Detection

If you retry with the same key, the response includes:

```
X-Idempotent-Replay: true
```

**No points are charged for replayed requests.**

---

## Error Handling

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions/points) |
| 404 | Not Found |
| 409 | Conflict (idempotency key already used) |
| 500 | Internal Server Error |

### Common Errors

**Insufficient Points:**
```json
{
  "detail": "Insufficient points. Balance: 0, Required: 3"
}
```

**Permission Denied:**
```json
{
  "detail": "Conversion not permitted: pdf_to_docs"
}
```

**Expired Demo:**
```json
{
  "detail": "Demo account expired"
}
```

**Duplicate Email:**
```json
{
  "detail": "This email already used a demo registration. Please sign in or contact super admin."
}
```

---

## Python SDK Example

```python
import requests
import uuid

class ConvertProAPI:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.token = None
    
    def login(self, email, password):
        """Login and store access token"""
        response = requests.post(
            f"{self.base_url}/api/v2/auth/login",
            json={"email": email, "password": password}
        )
        response.raise_for_status()
        self.token = response.json()["access_token"]
        return self.token
    
    def get_balance(self):
        """Get current points balance"""
        response = requests.get(
            f"{self.base_url}/api/v3/points/balance",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        response.raise_for_status()
        return response.json()["balance"]
    
    def convert_pdf_to_word(self, pdf_path):
        """Convert PDF to Word with idempotency"""
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Idempotency-Key": str(uuid.uuid4())
        }
        
        with open(pdf_path, "rb") as f:
            response = requests.post(
                f"{self.base_url}/api/v3/conversions/pdf-to-word",
                headers=headers,
                files={"file": f}
            )
        
        response.raise_for_status()
        return response.json()
    
    def download_file(self, download_url, output_path):
        """Download converted file"""
        response = requests.get(
            f"{self.base_url}{download_url}",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        response.raise_for_status()
        
        with open(output_path, "wb") as f:
            f.write(response.content)

# Usage
api = ConvertProAPI()

# Login
api.login("demo@example.com", "password123")
print(f"Balance: {api.get_balance()} points")

# Convert
result = api.convert_pdf_to_word("document.pdf")
if result["success"]:
    print(f"Converted: {result['filename']}")
    api.download_file(result["download_url"], "converted.docx")
    print(f"New balance: {api.get_balance()} points")
```

---

## JavaScript/Node.js Example

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class ConvertProAPI {
  constructor(baseURL = 'http://localhost:8000') {
    this.baseURL = baseURL;
    this.token = null;
  }

  async login(email, password) {
    const response = await axios.post(`${this.baseURL}/api/v2/auth/login`, {
      email,
      password
    });
    this.token = response.data.access_token;
    return this.token;
  }

  async getBalance() {
    const response = await axios.get(`${this.baseURL}/api/v3/points/balance`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return response.data.balance;
  }

  async convertPdfToWord(pdfPath) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(pdfPath));

    const response = await axios.post(
      `${this.baseURL}/api/v3/conversions/pdf-to-word`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${this.token}`,
          'Idempotency-Key': uuidv4()
        }
      }
    );
    return response.data;
  }

  async downloadFile(downloadUrl, outputPath) {
    const response = await axios.get(`${this.baseURL}${downloadUrl}`, {
      headers: { Authorization: `Bearer ${this.token}` },
      responseType: 'stream'
    });
    
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }
}

// Usage
(async () => {
  const api = new ConvertProAPI();
  
  await api.login('demo@example.com', 'password123');
  console.log(`Balance: ${await api.getBalance()} points`);
  
  const result = await api.convertPdfToWord('document.pdf');
  if (result.success) {
    console.log(`Converted: ${result.filename}`);
    await api.downloadFile(result.download_url, 'converted.docx');
    console.log(`New balance: ${await api.getBalance()} points`);
  }
})();
```

---

## Best Practices

### 1. Always Use Idempotency Keys (v3)

```python
import uuid

headers = {
    "Authorization": f"Bearer {token}",
    "Idempotency-Key": str(uuid.uuid4())
}
```

### 2. Handle Token Expiration

```python
def api_request(url, **kwargs):
    response = requests.get(url, **kwargs)
    
    if response.status_code == 401:
        # Refresh token
        new_token = refresh_access_token(refresh_token)
        kwargs['headers']['Authorization'] = f"Bearer {new_token}"
        response = requests.get(url, **kwargs)
    
    return response
```

### 3. Check Balance Before Conversion

```python
balance = get_balance(token)
if balance < 3:
    print("Insufficient points. Please contact admin for top-up.")
    return
```

### 4. Implement Retry Logic

```python
import time

max_retries = 3
for attempt in range(max_retries):
    try:
        result = convert_file(token, file_path)
        break
    except requests.exceptions.Timeout:
        if attempt < max_retries - 1:
            time.sleep(2 ** attempt)  # Exponential backoff
        else:
            raise
```

### 5. Store Tokens Securely

```python
# ❌ Bad
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ✅ Good
import keyring
keyring.set_password("convertpro", "access_token", token)
token = keyring.get_password("convertpro", "access_token")
```

---

## Rate Limits & Constraints

| Constraint | Value |
|------------|-------|
| Max file size | 50 MB |
| Access token expiry | 30 minutes |
| Refresh token expiry | 7 days |
| Demo trial period | 8 days |
| Max APIs per demo | 3 |
| Point cost per conversion | 3 |

---

## Support & Documentation

### Full Documentation

- **[API v3 Documentation](./backend/docs/API_V3_DOCUMENTATION.md)** - Complete v3 reference
- **[API v2 Documentation](./backend/docs/API_V2_DOCUMENTATION.md)** - Complete v2 reference
- **[API v1 Documentation](./API_DOCUMENTATION.md)** - Original public API

### Quick References

- **[v3 Quick Reference](./backend/docs/API_V3_QUICK_REFERENCE.md)** - Code examples
- **[v2 Quick Reference](./backend/docs/API_V2_QUICK_REFERENCE.md)** - Code examples
- **[Endpoints Summary](./API_ENDPOINTS_SUMMARY.md)** - All endpoints at a glance

### Contact

For issues, questions, or feature requests:
- Open an issue in the project repository
- Contact the development team
- Check the troubleshooting guide

---

**API Version:** 3.0  
**Last Updated:** April 25, 2026  
**License:** Proprietary

