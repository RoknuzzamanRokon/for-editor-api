# PDF Converter API v3 - Summary

## Overview

API v3 introduces a **points-based billing system** and **granular permissions** on top of v2's authentication and role-based access control.

**Base URL:** `http://localhost:8000/api/v3`

---

## Key Features

### 🎯 Points System
- **Pay-per-use:** 3 points per conversion
- **Auto refunds:** Failed conversions refund points automatically
- **Audit trail:** Complete ledger of all transactions
- **Super users:** Unlimited conversions (no charges)

### 🔐 Granular Permissions
- **Per-action control:** Grant/revoke specific conversion permissions
- **Admin management:** Super users and admins can manage permissions
- **Flexible access:** Fine-tune what each user can do

### 🔄 Idempotency
- **Duplicate prevention:** Use `Idempotency-Key` header
- **Cached results:** Replayed requests return cached results without charging
- **Safe retries:** Retry failed requests without double-charging

---

## Quick Start

### 1. Login (v2 endpoint)
```bash
curl -X POST "http://localhost:8000/api/v2/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### 2. Check Balance
```bash
curl -X GET "http://localhost:8000/api/v3/points/balance" \
  -H "Authorization: Bearer <token>"
```

### 3. Convert File (3 points)
```bash
curl -X POST "http://localhost:8000/api/v3/conversions/pdf-to-word" \
  -H "Authorization: Bearer <token>" \
  -H "Idempotency-Key: $(uuidgen)" \
  -F "file=@document.pdf"
```

---

## Points System

### Default Allocations

| Role | Points | Conversions |
|------|--------|-------------|
| demo_user | 0 | Read-only |
| general_user | 30 | 10 conversions |
| admin_user | 100 | 33 conversions |
| super_user | ∞ | Unlimited |

### Point Costs

All conversions cost **3 points** per request:
- PDF to Word
- PDF to Excel
- DOCX to PDF
- Excel to PDF
- Image to PDF
- Remove PDF Pages

---

## Available Actions

| Action | Label | Permission Required |
|--------|-------|---------------------|
| `pdf_to_docs` | PDF to Word | Yes |
| `pdf_to_excel` | PDF to Excel | Yes |
| `docx_to_pdf` | DOCX to PDF | Yes |
| `excel_to_pdf` | Excel to PDF | Yes |
| `image_to_pdf` | Image to PDF | Yes |
| `pdf_page_remove` | Remove Pages from PDF | Yes |

---

## Main Endpoints

### Points Management
- `GET /api/v3/points/balance` - Get current balance
- `GET /api/v3/points/ledger` - View transaction history
- `POST /api/v3/points/topup` - Add points (admin only)
- `GET /api/v3/points/rules` - Get point costs

### Permissions Management
- `GET /api/v3/permissions/actions` - List all actions
- `GET /api/v3/permissions/users/{id}/permissions` - Get user permissions
- `PUT /api/v3/permissions/users/{id}/permissions` - Set permissions
- `PATCH /api/v3/permissions/users/{id}/permissions/{action}` - Update permission

### File Conversions
- `POST /api/v3/conversions/pdf-to-word` - Convert PDF to Word (3 pts)
- `POST /api/v3/conversions/pdf-to-excel` - Convert PDF to Excel (3 pts)
- `POST /api/v3/conversions/docx-to-pdf` - Convert DOCX to PDF (3 pts)
- `POST /api/v3/conversions/excel-to-pdf` - Convert Excel to PDF (3 pts)
- `POST /api/v3/conversions/image-to-pdf` - Convert Image to PDF (3 pts)
- `POST /api/v3/conversions/remove-pages-from-pdf` - Remove pages (3 pts)
- `GET /api/v3/conversions/{type}/files` - List files (free)
- `GET /api/v3/conversions/{type}/files/{filename}` - Download (free)

---

## Python Example

```python
import requests
import uuid

BASE_URL = "http://localhost:8000"

# Login
token = requests.post(
    f"{BASE_URL}/api/v2/auth/login",
    json={"email": "user@example.com", "password": "password"}
).json()["access_token"]

# Check balance
balance = requests.get(
    f"{BASE_URL}/api/v3/points/balance",
    headers={"Authorization": f"Bearer {token}"}
).json()["balance"]
print(f"Balance: {balance} points")

# Convert with idempotency
headers = {
    "Authorization": f"Bearer {token}",
    "Idempotency-Key": str(uuid.uuid4())
}

with open("document.pdf", "rb") as f:
    result = requests.post(
        f"{BASE_URL}/api/v3/conversions/pdf-to-word",
        headers=headers,
        files={"file": f}
    ).json()

if result["success"]:
    print(f"✅ Success: {result['filename']}")
else:
    print(f"❌ Failed: {result['message']}")
```

---

## Migration from v2

### What Changed
1. **Points required** - Users need points to convert files
2. **Permissions required** - Users need explicit permission for each action
3. **Base URL** - `/api/v2` → `/api/v3`
4. **New headers** - `Idempotency-Key` (optional but recommended)

### Migration Steps
1. Update base URL in client applications
2. Grant permissions to existing users
3. Top-up points for existing users
4. Add idempotency key generation
5. Handle new error codes (403, 409)

### Migration Script
```python
import requests

BASE_URL = "http://localhost:8000"
ADMIN_TOKEN = "<admin_token>"
headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}

# Get all users
users = requests.get(f"{BASE_URL}/api/v2/users", headers=headers).json()

for user in users:
    if user["role"] in ["general_user", "admin_user"]:
        # Grant all permissions
        requests.put(
            f"{BASE_URL}/api/v3/permissions/users/{user['id']}/permissions",
            headers=headers,
            json={
                "permissions": [
                    {"action": "pdf_to_docs", "is_allowed": True},
                    {"action": "pdf_to_excel", "is_allowed": True},
                    {"action": "docx_to_pdf", "is_allowed": True},
                    {"action": "excel_to_pdf", "is_allowed": True},
                    {"action": "image_to_pdf", "is_allowed": True},
                    {"action": "pdf_page_remove", "is_allowed": True},
                ]
            }
        )
        
        # Top-up 100 points
        requests.post(
            f"{BASE_URL}/api/v3/points/topup",
            headers=headers,
            json={
                "user_id": user["id"],
                "amount": 100,
                "note": "Migration from v2"
            }
        )
        
        print(f"✅ Migrated: {user['email']}")
```

---

## Error Handling

### Common Errors

**Insufficient Points (403):**
```json
{
  "detail": "Insufficient points. Balance: 0, Required: 3"
}
```

**Permission Denied (403):**
```json
{
  "detail": "Conversion not permitted: pdf_to_docs"
}
```

**Idempotency Conflict (409):**
```json
{
  "detail": "Idempotency-Key already used and result unavailable"
}
```

---

## Documentation

- **[Full v3 Documentation](./backend/docs/API_V3_DOCUMENTATION.md)** - Complete reference
- **[v3 Summary](./backend/docs/API_V3_SUMMARY.md)** - Quick overview
- **[v3 Quick Reference](./backend/docs/API_V3_QUICK_REFERENCE.md)** - Code examples
- **[v2 Documentation](./backend/docs/API_V2_DOCUMENTATION.md)** - Previous version
- **[v1 Documentation](./API_DOCUMENTATION.md)** - Original version

---

## Support

For issues, questions, or feature requests, please contact the development team.

**API Version:** 3.0  
**Last Updated:** February 25, 2026
