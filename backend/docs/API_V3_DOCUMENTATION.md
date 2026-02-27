# PDF Converter API v3 Documentation

## Overview

API v3 extends v2 with advanced features including:
- **Points-based billing system** - Pay-per-use model with point deduction
- **Granular permissions** - Per-action permission control for users
- **Idempotency support** - Prevent duplicate charges with Idempotency-Key header
- **Automatic refunds** - Failed conversions automatically refund points
- **Points ledger** - Complete audit trail of all point transactions

**Base URL:** `/api/v3`

**Authentication:** Bearer Token (JWT) - Required for all endpoints

**Version:** 3.0

---

## Table of Contents

1. [What's New in v3](#whats-new-in-v3)
2. [Points System](#points-system)
3. [Permissions System](#permissions-system)
4. [Idempotency](#idempotency)
5. [Authentication](#authentication)
6. [Points Management Endpoints](#points-management-endpoints)
7. [Permissions Management Endpoints](#permissions-management-endpoints)
8. [File Conversion Endpoints](#file-conversion-endpoints)
9. [Common Response Models](#common-response-models)
10. [Error Handling](#error-handling)
11. [Migration from v2 to v3](#migration-from-v2-to-v3)
12. [Examples](#examples)

---

## What's New in v3

### Key Features


| Feature | v2 | v3 |
|---------|----|----|
| Authentication | ✅ JWT | ✅ JWT |
| Role-based Access | ✅ RBAC | ✅ Enhanced RBAC |
| User Management | ✅ Full CRUD | ✅ Full CRUD |
| Points System | ❌ | ✅ Pay-per-use |
| Granular Permissions | ❌ | ✅ Per-action control |
| Idempotency | ❌ | ✅ Duplicate prevention |
| Auto Refunds | ❌ | ✅ Failed conversions |
| Points Ledger | ❌ | ✅ Full audit trail |
| Points Top-up | ❌ | ✅ Admin/Super user |

### Points System

- **Cost:** 3 points per conversion request
- **Default Allocations:**
  - `demo_user`: 0 points (read-only)
  - `general_user`: 30 points (10 conversions)
  - `admin_user`: 100 points (33 conversions)
  - `super_user`: Unlimited (no charges)

### Permissions System

- Admins can grant/revoke specific conversion actions per user
- Actions: `pdf_to_docs`, `pdf_to_excel`, `docx_to_pdf`, `excel_to_pdf`, `image_to_pdf`, `pdf_page_remove`
- Super users bypass all permission checks

### Idempotency

- Use `Idempotency-Key` header to prevent duplicate charges
- Same key returns cached result without re-charging points
- Response includes `X-Idempotent-Replay: true` header for replayed requests

---

## Points System

### How Points Work

1. **Charging:** Each conversion request costs 3 points
2. **Deduction:** Points are deducted before conversion starts
3. **Refund:** Failed conversions automatically refund points
4. **Balance:** Users can check their balance anytime
5. **Top-up:** Admins/Super users can add points to any user

### Point Costs

| Action | Cost |
|--------|------|
| PDF to Word | 3 points |
| PDF to Excel | 3 points |
| DOCX to PDF | 3 points |
| Excel to PDF | 3 points |
| Image to PDF | 3 points |
| Remove PDF Pages | 3 points |

### Default Point Allocations


When a new user is created, they receive points based on their role:

```python
DEFAULT_ROLE_POINTS = {
    "demo_user": 0,        # Read-only access
    "general_user": 30,    # 10 conversions
    "admin_user": 100,     # 33 conversions
    "super_user": 0        # Unlimited (no charges)
}
```

### Points Ledger

Every point transaction is recorded in the ledger with:
- **Action:** What conversion was performed
- **Amount:** Points charged/refunded/topped-up
- **Status:** `spent`, `refunded`, or `topup`
- **Request ID:** Unique identifier for idempotency
- **Metadata:** Additional context (file info, result, etc.)
- **Timestamp:** When the transaction occurred

---

## Permissions System

### Permission Model

Each user can have specific permissions for each conversion action:

```json
{
  "user_id": 5,
  "permissions": [
    {
      "action": "pdf_to_docs",
      "is_allowed": true,
      "created_at": "2026-02-25T10:00:00",
      "updated_at": "2026-02-25T10:00:00"
    },
    {
      "action": "pdf_to_excel",
      "is_allowed": false,
      "created_at": "2026-02-25T10:00:00",
      "updated_at": "2026-02-25T10:00:00"
    }
  ]
}
```

### Permission Enforcement

1. **Super users:** Bypass all permission checks
2. **Demo users:** Always denied (read-only)
3. **Other users:** Must have explicit permission with `is_allowed: true`
4. **Missing permission:** Treated as denied

### Available Actions


| Action | Label | Description |
|--------|-------|-------------|
| `pdf_to_docs` | PDF to Word | Convert PDF to DOCX |
| `pdf_to_excel` | PDF to Excel | Convert PDF to XLSX |
| `docx_to_pdf` | DOCX to PDF | Convert Word to PDF |
| `excel_to_pdf` | Excel to PDF | Convert Excel to PDF |
| `image_to_pdf` | Image to PDF | Convert images to PDF |
| `pdf_page_remove` | Remove Pages from PDF | Remove pages from PDF |

---

## Idempotency

### How It Works

1. Client generates a unique `Idempotency-Key` (UUID recommended)
2. Include key in request header: `Idempotency-Key: <uuid>`
3. First request: Points charged, conversion performed
4. Duplicate request: Cached result returned, no charge
5. Response includes `X-Idempotent-Replay: true` for replayed requests

### Example

```bash
# First request - charges 3 points
curl -X POST "http://localhost:8000/api/v3/conversions/pdf-to-word" \
  -H "Authorization: Bearer <token>" \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -F "file=@document.pdf"

# Duplicate request - returns cached result, no charge
curl -X POST "http://localhost:8000/api/v3/conversions/pdf-to-word" \
  -ceptions.Timeout:
        print(f"⏱️  Timeout on attempt {attempt + 1}")
        if attempt < max_retries - 1:
            time.sleep(2 ** attempt)  # Exponential backoff
            continue
        else:
            print("❌ Max retries exceeded")
```

---

## Support & Contact

For issues, questions, or feature requests, please contact the development team or refer to the main project documentation.

**API Version:** 3.0  
**Last Updated:** February 25, 2026

etries):
    try:
        response = requests.post(
            f"{BASE_URL}/api/v3/conversions/pdf-to-word",
            headers=headers,
            files={"file": open("document.pdf", "rb")},
            timeout=30
        )
        
        if "X-Idempotent-Replay" in response.headers:
            print("⚠️  Replayed cached result (no charge)")
        
        result = response.json()
        if result["success"]:
            print(f"✅ Success: {result['filename']}")
            break
    except requests.exrror["detail"]:
        print("❌ Not enough points!")
        print("Please contact admin for top-up")
    elif "not permitted" in error["detail"]:
        print("❌ No permission for this action")
        print("Please contact admin to grant permission")
```

### Using Idempotency for Retries

```python
import requests
import uuid
import time

idempotency_key = str(uuid.uuid4())
headers = {
    "Authorization": f"Bearer {token}",
    "Idempotency-Key": idempotency_key
}

max_retries = 3
for attempt in range(max_r
    f"{BASE_URL}/api/v3/points/topup",
    headers=headers,
    json={
        "user_id": user_id,
        "amount": 50,
        "note": "Monthly allocation"
    }
)

print(f"✅ User {user_id} configured")
```

### Handling Insufficient Points

```python
import requests

response = requests.post(
    f"{BASE_URL}/api/v3/conversions/pdf-to-word",
    headers=headers,
    files={"file": open("document.pdf", "rb")}
)

if response.status_code == 403:
    error = response.json()
    if "Insufficient points" in e00"
ADMIN_TOKEN = "<admin_token>"
headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}

user_id = 5

# Grant specific permissions
requests.put(
    f"{BASE_URL}/api/v3/permissions/users/{user_id}/permissions",
    headers=headers,
    json={
        "permissions": [
            {"action": "pdf_to_docs", "is_allowed": True},
            {"action": "pdf_to_excel", "is_allowed": True},
            {"action": "docx_to_pdf", "is_allowed": False},  # Deny this one
        ]
    }
)

# Top-up 50 points
requests.post(ers=headers
    ).json()
    print(f"Recent transactions: {len(ledger['items'])}")
    
    # 7. Download file
    download_response = requests.get(
        f"{BASE_URL}{result['download_url']}",
        headers=headers
    )
    with open("converted.docx", "wb") as f:
        f.write(download_response.content)
    print("✅ File downloaded")
else:
    print(f"❌ Conversion failed: {result['message']}")
```

### Admin: Grant Permissions and Top-up Points

```python
import requests

BASE_URL = "http://localhost:80files={"file": f}
    )

result = response.json()
if result["success"]:
    print(f"✅ Conversion successful: {result['filename']}")
    print(f"Download URL: {result['download_url']}")
    
    # 5. Check updated balance
    balance = requests.get(
        f"{BASE_URL}/api/v3/points/balance",
        headers=headers
    ).json()
    print(f"New balance: {balance['balance']} points (charged 3)")
    
    # 6. View ledger
    ledger = requests.get(
        f"{BASE_URL}/api/v3/points/ledger?limit=5",
        headson()
print(f"Current balance: {balance['balance']} points")

# 3. Check permissions
permissions = requests.get(
    f"{BASE_URL}/api/v3/permissions/users/5/permissions",
    headers=headers
).json()
print(f"Permissions: {permissions}")

# 4. Convert PDF to Word with idempotency
idempotency_key = str(uuid.uuid4())
headers["Idempotency-Key"] = idempotency_key

with open("document.pdf", "rb") as f:
    response = requests.post(
        f"{BASE_URL}/api/v3/conversions/pdf-to-word",
        headers=headers,
          
        print(f"✅ Migrated user: {user['email']}")
```

---

## Examples

### Complete v3 Workflow

```python
import requests
import uuid

BASE_URL = "http://localhost:8000"

# 1. Login
response = requests.post(
    f"{BASE_URL}/api/v2/auth/login",
    json={"email": "user@example.com", "password": "password"}
)
token = response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 2. Check balance
balance = requests.get(
    f"{BASE_URL}/api/v3/points/balance",
    headers=headers
).j,
                    {"action": "image_to_pdf", "is_allowed": True},
                    {"action": "pdf_page_remove", "is_allowed": True},
                ]
            }
        )
        
        # Top-up points
        requests.post(
            f"{BASE_URL}/api/v3/points/topup",
            headers={"Authorization": f"Bearer {ADMIN_TOKEN}"},
            json={
                "user_id": user["id"],
                "amount": 100,
                "note": "Migration from v2"
            }
        )
              # Grant all permissions
        requests.put(
            f"{BASE_URL}/api/v3/permissions/users/{user['id']}/permissions",
            headers={"Authorization": f"Bearer {ADMIN_TOKEN}"},
            json={
                "permissions": [
                    {"action": "pdf_to_docs", "is_allowed": True},
                    {"action": "pdf_to_excel", "is_allowed": True},
                    {"action": "docx_to_pdf", "is_allowed": True},
                    {"action": "excel_to_pdf", "is_allowed": True}, 409 for idempotency conflicts)

### Backward Compatibility

- v2 endpoints remain available
- Authentication tokens work for both v2 and v3
- User accounts are shared between versions

### Example Migration Script

```python
import requests

BASE_URL = "http://localhost:8000"
ADMIN_TOKEN = "<admin_token>"

# Get all users
users = requests.get(
    f"{BASE_URL}/api/v2/users",
    headers={"Authorization": f"Bearer {ADMIN_TOKEN}"}
).json()

for user in users:
    if user["role"] in ["general_user", "admin_user"]:
ing Changes

1. **Points required:** Users need points to perform conversions
2. **Permissions required:** Users need explicit permissions for each action
3. **Base URL changed:** `/api/v2` → `/api/v3`

### Migration Steps

1. **Update base URL** in client applications
2. **Grant permissions** to existing users for all actions they need
3. **Top-up points** for existing users
4. **Add idempotency keys** to prevent duplicate charges (recommended)
5. **Handle new error codes** (403 for insufficient points/permissionsncy Conflict (409 Conflict):**
```json
{
  "detail": "Idempotency-Key already used and result unavailable"
}
```

### Error Response with Refund

When a conversion fails, points are automatically refunded:

```json
{
  "success": false,
  "message": "Conversion failed: Invalid PDF structure",
  "filename": null,
  "download_url": null
}
```

The ledger will show:
1. Initial charge: `-3 points` (status: `spent`)
2. Automatic refund: `+3 points` (status: `refunded`)

---

## Migration from v2 to v3

### Break,
  "is_allowed": boolean,
  "created_at": datetime,
  "updated_at": datetime
}
```

### ConversionResponse

```json
{
  "success": boolean,
  "message": string,
  "filename": string | null,
  "download_url": string | null
}
```

---

## Error Handling

### New Error Types in v3

**Insufficient Points (403 Forbidden):**
```json
{
  "detail": "Insufficient points. Balance: 0, Required: 3"
}
```

**Permission Denied (403 Forbidden):**
```json
{
  "detail": "Conversion not permitted: pdf_to_docs"
}
```

**Idempotee}

Download a converted file.

**No points charged**

**Response (200 OK):**
- Binary file content with appropriate Content-Type

---

## Common Response Models

### PointsBalanceResponse

```json
{
  "balance": integer
}
```

### PointsLedgerEntry

```json
{
  "id": integer,
  "user_id": integer,
  "action": string,
  "amount": integer,
  "status": "spent" | "refunded" | "topup",
  "request_id": string,
  "meta_json": object,
  "created_at": datetime
}
```

### PermissionEntry

```json
{
  "action": stringiles for a specific conversion type.

**No points charged**

**Types:** `pdf-to-word`, `pdf-to-excel`, `docx-to-pdf`, `excel-to-pdf`, `image-to-pdf`, `remove-pages-from-pdf`

**Response (200 OK):**
```json
{
  "files": [
    {
      "filename": "document_20260225_120000_abc123.docx",
      "original_name": "document.pdf",
      "conversion_date": "2026-02-25T12:00:00",
      "file_size": 245760,
      "status": "success"
    }
  ],
  "total_count": 1
}
```

---

### GET /api/v3/conversions/{type}/files/{filenam 
**Cost:** 3 points  
**Permission Required:** Yes

**Supported formats:** `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.tiff`

**Request:**
```
file: <Image file> (max 50MB)
```

---

### POST /api/v3/conversions/remove-pages-from-pdf

Remove pages from PDF.

**Action:** `pdf_page_remove`  
**Cost:** 3 points  
**Permission Required:** Yes

**Request:**
```
file: <PDF file> (max 50MB)
pages: "1,3,5-7" (optional)
remove_blank: true (optional)
```

---

### GET /api/v3/conversions/{type}/files

List converted f/api/v3/conversions/docx-to-pdf

Convert Word document to PDF.

**Action:** `docx_to_pdf`  
**Cost:** 3 points  
**Permission Required:** Yes

**Request:**
```
file: <DOCX file> (max 50MB)
```

---

### POST /api/v3/conversions/excel-to-pdf

Convert Excel spreadsheet to PDF.

**Action:** `excel_to_pdf`  
**Cost:** 3 points  
**Permission Required:** Yes

**Request:**
```
file: <XLSX or XLS file> (max 50MB)
```

---

### POST /api/v3/conversions/image-to-pdf

Convert image to PDF.

**Action:** `image_to_pdf` en)" \
  -F "file=@document.pdf"
```

**Errors:**
- `400 Bad Request` - Invalid file
- `403 Forbidden` - No permission or insufficient points
- `409 Conflict` - Idempotency key already used but result unavailable
- `500 Internal Server Error` - Conversion failed (points refunded)

---

### POST /api/v3/conversions/pdf-to-excel

Convert PDF to Excel spreadsheet.

**Action:** `pdf_to_excel`  
**Cost:** 3 points  
**Permission Required:** Yes

Same pattern as PDF to Word. See above for details.

---

### POST uid> (optional)
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
  "filename": "document_20260225_120000_abc123.docx",
  "download_url": "/api/v3/conversions/pdf-to-word/files/document_20260225_120000_abc123.docx"
}
```

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v3/conversions/pdf-to-word" \
  -H "Authorization: Bearer <token>" \
  -H "Idempotency-Key: $(uuidgmatically
5. **Result caching:** Idempotent requests return cached results

### Common Headers

```
Authorization: Bearer <access_token>
Idempotency-Key: <uuid> (optional but recommended)
```

### Common Response Headers

```
X-Idempotent-Replay: true (only for replayed requests)
```

---

### POST /api/v3/conversions/pdf-to-word

Convert PDF to Word document.

**Action:** `pdf_to_docs`  
**Cost:** 3 points  
**Permission Required:** Yes

**Headers:**
```
Authorization: Bearer <access_token>
Idempotency-Key: <u`

**Errors:**
- `400 Bad Request` - Invalid action name
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - User not found

---

## File Conversion Endpoints

All conversion endpoints follow the same pattern as v2, with these additions:

### Changes from v2

1. **Points charged:** 3 points deducted before conversion
2. **Permission check:** User must have permission for the action
3. **Idempotency support:** Use `Idempotency-Key` header
4. **Auto refund:** Failed conversions refund points auto

**Request Body:**
```json
{
  "is_allowed": true
}
```

**Response (200 OK):**
```json
{
  "user_id": 5,
  "permissions": [
    {
      "action": "pdf_to_docs",
      "is_allowed": true,
      "created_at": "2026-02-25T10:00:00",
      "updated_at": "2026-02-25T12:30:00"
    }
  ]
}
```

**Example:**
```bash
curl -X PATCH "http://localhost:8000/api/v3/permissions/users/5/permissions/pdf_to_docs" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"is_allowed": true}'
`` true},
      {"action": "pdf_to_excel", "is_allowed": false}
    ]
  }'
```

---

### PATCH /api/v3/permissions/users/{user_id}/permissions/{action}

Update a single permission for a user.

**Required Role:** `super_user` or `admin_user`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| user_id | integer | Target user ID |
| action | string | Action name (e.g., `pdf_to_docs`) |se,
      "created_at": "2026-02-25T10:00:00",
      "updated_at": "2026-02-25T12:00:00"
    },
    {
      "action": "docx_to_pdf",
      "is_allowed": true,
      "created_at": "2026-02-25T12:00:00",
      "updated_at": "2026-02-25T12:00:00"
    }
  ]
}
```

**Example:**
```bash
curl -X PUT "http://localhost:8000/api/v3/permissions/users/5/permissions" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": [
      {"action": "pdf_to_docs", "is_allowed":issions": [
    {
      "action": "pdf_to_docs",
      "is_allowed": true
    },
    {
      "action": "pdf_to_excel",
      "is_allowed": false
    },
    {
      "action": "docx_to_pdf",
      "is_allowed": true
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "user_id": 5,
  "permissions": [
    {
      "action": "pdf_to_docs",
      "is_allowed": true,
      "created_at": "2026-02-25T10:00:00",
      "updated_at": "2026-02-25T12:00:00"
    },
    {
      "action": "pdf_to_excel",
      "is_allowed": falhttp://localhost:8000/api/v3/permissions/users/5/permissions" \
  -H "Authorization: Bearer <token>"
```

**Errors:**
- `403 Forbidden` - Insufficient permissions or trying to modify super_user
- `404 Not Found` - User not found

---

### PUT /api/v3/permissions/users/{user_id}/permissions

Set multiple permissions for a user (upsert).

**Required Role:** `super_user` or `admin_user`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "permDescription |
|-----------|------|-------------|
| user_id | integer | Target user ID |

**Response (200 OK):**
```json
{
  "user_id": 5,
  "permissions": [
    {
      "action": "pdf_to_docs",
      "is_allowed": true,
      "created_at": "2026-02-25T10:00:00",
      "updated_at": "2026-02-25T10:00:00"
    },
    {
      "action": "pdf_to_excel",
      "is_allowed": true,
      "created_at": "2026-02-25T10:00:00",
      "updated_at": "2026-02-25T10:00:00"
    }
  ]
}
```

**Example:**
```bash
curl -X GET "o_pdf",
    "label": "DOCX to PDF"
  },
  {
    "action": "excel_to_pdf",
    "label": "Excel to PDF"
  },
  {
    "action": "image_to_pdf",
    "label": "Image to PDF"
  },
  {
    "action": "pdf_page_remove",
    "label": "Remove Pages from PDF"
  }
]
```

---

### GET /api/v3/permissions/users/{user_id}/permissions

Get all permissions for a specific user.

**Required Role:** `super_user` or `admin_user`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Parameter | Type | oint cost rules.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "flat_cost_per_request": 3
}
```

---

## Permissions Management Endpoints

### GET /api/v3/permissions/actions

List all available conversion actions.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
[
  {
    "action": "pdf_to_docs",
    "label": "PDF to Word"
  },
  {
    "action": "pdf_to_excel",
    "label": "PDF to Excel"
  },
  {
    "action": "docx_tason for top-up

**Response (200 OK):**
```json
{
  "user_id": 5,
  "balance": 77
}
```

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v3/points/topup" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 5,
    "amount": 50,
    "note": "Monthly allocation"
  }'
```

**Errors:**
- `400 Bad Request` - Amount must be positive
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - User not found

---

### GET /api/v3/points/rules

Get pimit=10&offset=0" \
  -H "Authorization: Bearer <token>"
```

---

### POST /api/v3/points/topup

Add points to a user's account.

**Required Role:** `super_user` or `admin_user`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "user_id": 5,
  "amount": 50,
  "note": "Monthly allocation"
}
```

**Field Descriptions:**
- `user_id` (required) - Target user ID
- `amount` (required) - Points to add (must be positive)
- `note` (optional) - Rement_20260225_120000_abc123.docx"
        }
      },
      "created_at": "2026-02-25T12:00:00"
    },
    {
      "id": 122,
      "user_id": 5,
      "action": "topup",
      "amount": 30,
      "status": "topup",
      "request_id": "topup-7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "meta_json": {
        "note": "Initial allocation"
      },
      "created_at": "2026-02-25T10:00:00"
    }
  ],
  "limit": 50,
  "offset": 0
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v3/points/ledger?l | integer | 0 | Pagination offset |

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": 123,
      "user_id": 5,
      "action": "pdf_to_docs",
      "amount": -3,
      "status": "spent",
      "request_id": "550e8400-e29b-41d4-a716-446655440000",
      "meta_json": {
        "path": "/api/v3/conversions/pdf-to-word",
        "filename": "document.pdf",
        "content_type": "application/pdf",
        "size": 245760,
        "result": {
          "success": true,
          "filename": "docu<access_token>
```

**Response (200 OK):**
```json
{
  "balance": 27
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v3/points/balance" \
  -H "Authorization: Bearer <token>"
```

---

### GET /api/v3/points/ledger

Get current user's points transaction history.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | integer | 50 | Number of records (1-200) |
| offsetNTATION.md#authentication) for details.

**Quick Reference:**

```bash
# Login
curl -X POST "http://localhost:8000/api/v2/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Use token in v3 requests
curl -X GET "http://localhost:8000/api/v3/points/balance" \
  -H "Authorization: Bearer <access_token>"
```

---

## Points Management Endpoints

### GET /api/v3/points/balance

Get current user's point balance.

**Headers:**
```
Authorization: Bearer H "Authorization: Bearer <token>" \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -F "file=@document.pdf"
# Response includes: X-Idempotent-Replay: true
```

### Best Practices

- Generate a new UUID for each unique conversion request
- Store the key with the request for retry scenarios
- Reuse the same key only for retries of the same request
- Keys are scoped per user and action

---

## Authentication

API v3 uses the same authentication as v2. See [v2 Authentication docs](./API_V2_DOCUME