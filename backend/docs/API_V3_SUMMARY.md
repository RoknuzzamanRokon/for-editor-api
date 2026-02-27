# API v3 Quick Summary

One-page overview of the PDF Converter API v3 with points and permissions.

---

## Base URL
```
http://localhost:8000/api/v3
```

---

## What's New in v3

- ✅ **Points System** - Pay 3 points per conversion
- ✅ **Granular Permissions** - Per-action permission control
- ✅ **Idempotency** - Prevent duplicate charges with `Idempotency-Key` header
- ✅ **Auto Refunds** - Failed conversions refund points automatically
- ✅ **Points Ledger** - Complete audit trail of transactions

---

## Points System

### Costs
- **All conversions:** 3 points per request
- **Super users:** Unlimited (no charges)

### Default Allocations
| Role | Points | Conversions |
|------|--------|-------------|
| demo_user | 0 | Read-only |
| general_user | 30 | 10 conversions |
| admin_user | 100 | 33 conversions |
| super_user | ∞ | Unlimited |

---

## Authentication

Same as v2 - JWT Bearer tokens required for all endpoints.

```bash
# Login (v2 endpoint)
curl -X POST "http://localhost:8000/api/v2/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Use token in v3
curl -X GET "http://localhost:8000/api/v3/points/balance" \
  -H "Authorization: Bearer <token>"
```

---

## Endpoints Overview

### Points Management
| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/points/balance` | Get current balance | All authenticated |
| GET | `/points/ledger` | Get transaction history | All authenticated |
| POST | `/points/topup` | Add points to user | super_user, admin_user |
| GET | `/points/rules` | Get point cost rules | All authenticated |

### Permissions Management
| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/permissions/actions` | List all actions | All authenticated |
| GET | `/permissions/users/{id}/permissions` | Get user permissions | super_user, admin_user |
| PUT | `/permissions/users/{id}/permissions` | Set multiple permissions | super_user, admin_user |
| PATCH | `/permissions/users/{id}/permissions/{action}` | Update single permission | super_user, admin_user |

### File Conversions
| Method | Endpoint | Cost | Permission Required |
|--------|----------|------|---------------------|
| POST | `/conversions/pdf-to-word` | 3 pts | pdf_to_docs |
| POST | `/conversions/pdf-to-excel` | 3 pts | pdf_to_excel |
| POST | `/conversions/docx-to-pdf` | 3 pts | docx_to_pdf |
| POST | `/conversions/excel-to-pdf` | 3 pts | excel_to_pdf |
| POST | `/conversions/image-to-pdf` | 3 pts | image_to_pdf |
| POST | `/conversions/remove-pages-from-pdf` | 3 pts | pdf_page_remove |
| GET | `/conversions/{type}/files` | Free | None |
| GET | `/conversions/{type}/files/{filename}` | Free | None |

---

## Available Actions

| Action | Label | Description |
|--------|-------|-------------|
| `pdf_to_docs` | PDF to Word | Convert PDF to DOCX |
| `pdf_to_excel` | PDF to Excel | Convert PDF to XLSX |
| `docx_to_pdf` | DOCX to PDF | Convert Word to PDF |
| `excel_to_pdf` | Excel to PDF | Convert Excel to PDF |
| `image_to_pdf` | Image to PDF | Convert images to PDF |
| `pdf_page_remove` | Remove Pages from PDF | Remove pages from PDF |

---

## Quick Examples

### Check Balance
```bash
curl -X GET "http://localhost:8000/api/v3/points/balance" \
  -H "Authorization: Bearer <token>"
```

### View Ledger
```bash
curl -X GET "http://localhost:8000/api/v3/points/ledger?limit=10" \
  -H "Authorization: Bearer <token>"
```

### Top-up Points (Admin)
```bash
curl -X POST "http://localhost:8000/api/v3/points/topup" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"user_id":5,"amount":50,"note":"Monthly allocation"}'
```

### Grant Permission (Admin)
```bash
curl -X PATCH "http://localhost:8000/api/v3/permissions/users/5/permissions/pdf_to_docs" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"is_allowed":true}'
```

### Convert with Idempotency
```bash
curl -X POST "http://localhost:8000/api/v3/conversions/pdf-to-word" \
  -H "Authorization: Bearer <token>" \
  -H "Idempotency-Key: $(uuidgen)" \
  -F "file=@document.pdf"
```

---

## Idempotency

Use `Idempotency-Key` header to prevent duplicate charges:

```bash
# First request - charges 3 points
curl -X POST "http://localhost:8000/api/v3/conversions/pdf-to-word" \
  -H "Authorization: Bearer <token>" \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -F "file=@document.pdf"

# Duplicate request - returns cached result, no charge
# Response includes: X-Idempotent-Replay: true
```

---

## Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (invalid data) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient points/permissions) |
| 404 | Not Found |
| 409 | Conflict (idempotency key already used) |
| 422 | Validation Error |
| 500 | Internal Server Error (points refunded) |

---

## Error Examples

### Insufficient Points
```json
{
  "detail": "Insufficient points. Balance: 0, Required: 3"
}
```

### Permission Denied
```json
{
  "detail": "Conversion not permitted: pdf_to_docs"
}
```

### Idempotency Conflict
```json
{
  "detail": "Idempotency-Key already used and result unavailable"
}
```

---

## Migration from v2

### Key Changes
1. Points required for conversions
2. Permissions required for each action
3. Base URL: `/api/v2` → `/api/v3`
4. New headers: `Idempotency-Key` (optional)
5. New response header: `X-Idempotent-Replay`

### Migration Checklist
- [ ] Update base URL in client apps
- [ ] Grant permissions to existing users
- [ ] Top-up points for existing users
- [ ] Add idempotency key generation
- [ ] Handle new error codes (403, 409)

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

headers = {
    "Authorization": f"Bearer {token}",
    "Idempotency-Key": str(uuid.uuid4())
}

# Check balance
balance = requests.get(
    f"{BASE_URL}/api/v3/points/balance",
    headers=headers
).json()
print(f"Balance: {balance['balance']} points")

# Convert PDF
with open("document.pdf", "rb") as f:
    result = requests.post(
        f"{BASE_URL}/api/v3/conversions/pdf-to-word",
        headers=headers,
        files={"file": f}
    ).json()

if result["success"]:
    print(f"✅ Converted: {result['filename']}")
    print(f"Download: {result['download_url']}")
else:
    print(f"❌ Failed: {result['message']}")
```

---

## Documentation Links

- **[Full v3 Documentation](./API_V3_DOCUMENTATION.md)** - Complete API reference
- **[v2 Documentation](./API_V2_DOCUMENTATION.md)** - Previous version
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues

---

**API Version:** 3.0  
**Last Updated:** February 25, 2026
