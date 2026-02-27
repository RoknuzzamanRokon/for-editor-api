# API v3 Quick Reference

Fast reference for common v3 operations.

---

## Base URL
```
http://localhost:8000/api/v3
```

---

## Authentication

```bash
# Login (use v2 endpoint)
TOKEN=$(curl -s -X POST "http://localhost:8000/api/v2/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.access_token')
```

---

## Points Operations

### Check Balance
```bash
curl -X GET "http://localhost:8000/api/v3/points/balance" \
  -H "Authorization: Bearer $TOKEN"
```

### View Transaction History
```bash
curl -X GET "http://localhost:8000/api/v3/points/ledger?limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Top-up Points (Admin Only)
```bash
curl -X POST "http://localhost:8000/api/v3/points/topup" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 5,
    "amount": 100,
    "note": "Monthly allocation"
  }'
```

### Get Point Rules
```bash
curl -X GET "http://localhost:8000/api/v3/points/rules" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Permissions Operations

### List All Actions
```bash
curl -X GET "http://localhost:8000/api/v3/permissions/actions" \
  -H "Authorization: Bearer $TOKEN"
```

### Get User Permissions (Admin Only)
```bash
curl -X GET "http://localhost:8000/api/v3/permissions/users/5/permissions" \
  -H "Authorization: Bearer $TOKEN"
```

### Grant All Permissions (Admin Only)
```bash
curl -X PUT "http://localhost:8000/api/v3/permissions/users/5/permissions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": [
      {"action": "pdf_to_docs", "is_allowed": true},
      {"action": "pdf_to_excel", "is_allowed": true},
      {"action": "docx_to_pdf", "is_allowed": true},
      {"action": "excel_to_pdf", "is_allowed": true},
      {"action": "image_to_pdf", "is_allowed": true},
      {"action": "pdf_page_remove", "is_allowed": true}
    ]
  }'
```

### Update Single Permission (Admin Only)
```bash
curl -X PATCH "http://localhost:8000/api/v3/permissions/users/5/permissions/pdf_to_docs" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_allowed": true}'
```

---

## File Conversions

### PDF to Word (3 points)
```bash
curl -X POST "http://localhost:8000/api/v3/conversions/pdf-to-word" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -F "file=@document.pdf"
```

### PDF to Excel (3 points)
```bash
curl -X POST "http://localhost:8000/api/v3/conversions/pdf-to-excel" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -F "file=@spreadsheet.pdf"
```

### DOCX to PDF (3 points)
```bash
curl -X POST "http://localhost:8000/api/v3/conversions/docx-to-pdf" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -F "file=@document.docx"
```

### Excel to PDF (3 points)
```bash
curl -X POST "http://localhost:8000/api/v3/conversions/excel-to-pdf" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -F "file=@spreadsheet.xlsx"
```

### Image to PDF (3 points)
```bash
curl -X POST "http://localhost:8000/api/v3/conversions/image-to-pdf" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -F "file=@photo.jpg"
```

### Remove PDF Pages (3 points)
```bash
# Remove specific pages
curl -X POST "http://localhost:8000/api/v3/conversions/remove-pages-from-pdf" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -F "file=@document.pdf" \
  -F "pages=1,3,5-7"

# Remove blank pages
curl -X POST "http://localhost:8000/api/v3/conversions/remove-pages-from-pdf" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -F "file=@document.pdf" \
  -F "remove_blank=true"
```

### List Files (Free)
```bash
curl -X GET "http://localhost:8000/api/v3/conversions/pdf-to-word/files" \
  -H "Authorization: Bearer $TOKEN"
```

### Download File (Free)
```bash
curl -X GET "http://localhost:8000/api/v3/conversions/pdf-to-word/files/document_20260225_120000_abc123.docx" \
  -H "Authorization: Bearer $TOKEN" \
  -o "converted.docx"
```

---

## Python Examples

### Complete Workflow
```python
import requests
import uuid

BASE_URL = "http://localhost:8000"

# Login
token = requests.post(
    f"{BASE_URL}/api/v2/auth/login",
    json={"email": "user@example.com", "password": "password"}
).json()["access_token"]

headers = {"Authorization": f"Bearer {token}"}

# Check balance
balance = requests.get(
    f"{BASE_URL}/api/v3/points/balance",
    headers=headers
).json()["balance"]
print(f"Balance: {balance} points")

# Convert with idempotency
headers["Idempotency-Key"] = str(uuid.uuid4())
with open("document.pdf", "rb") as f:
    result = requests.post(
        f"{BASE_URL}/api/v3/conversions/pdf-to-word",
        headers=headers,
        files={"file": f}
    ).json()

if result["success"]:
    print(f"✅ Success: {result['filename']}")
    
    # Download
    download = requests.get(
        f"{BASE_URL}{result['download_url']}",
        headers=headers
    )
    with open("converted.docx", "wb") as f:
        f.write(download.content)
else:
    print(f"❌ Failed: {result['message']}")
```

### Admin: Setup New User
```python
import requests

BASE_URL = "http://localhost:8000"
ADMIN_TOKEN = "<admin_token>"
headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}

user_id = 5

# Grant all permissions
requests.put(
    f"{BASE_URL}/api/v3/permissions/users/{user_id}/permissions",
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
        "user_id": user_id,
        "amount": 100,
        "note": "Initial allocation"
    }
)

print(f"✅ User {user_id} ready to use v3")
```

### Error Handling
```python
import requests

try:
    response = requests.post(
        f"{BASE_URL}/api/v3/conversions/pdf-to-word",
        headers=headers,
        files={"file": open("document.pdf", "rb")}
    )
    response.raise_for_status()
    result = response.json()
    
    if result["success"]:
        print(f"✅ Success: {result['filename']}")
    else:
        print(f"⚠️  Conversion failed: {result['message']}")
        
except requests.exceptions.HTTPError as e:
    if e.response.status_code == 403:
        error = e.response.json()["detail"]
        if "Insufficient points" in error:
            print("❌ Not enough points - contact admin")
        elif "not permitted" in error:
            print("❌ No permission - contact admin")
        else:
            print(f"❌ Forbidden: {error}")
    elif e.response.status_code == 409:
        print("⚠️  Duplicate request detected")
    else:
        print(f"❌ Error {e.response.status_code}: {e.response.json()}")
```

### Retry with Idempotency
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
for attempt in range(max_retries):
    try:
        response = requests.post(
            f"{BASE_URL}/api/v3/conversions/pdf-to-word",
            headers=headers,
            files={"file": open("document.pdf", "rb")},
            timeout=30
        )
        
        if "X-Idempotent-Replay" in response.headers:
            print("⚠️  Cached result (no charge)")
        
        result = response.json()
        if result["success"]:
            print(f"✅ Success: {result['filename']}")
            break
            
    except requests.exceptions.Timeout:
        if attempt < max_retries - 1:
            wait = 2 ** attempt
            print(f"⏱️  Timeout, retrying in {wait}s...")
            time.sleep(wait)
        else:
            print("❌ Max retries exceeded")
```

---

## JavaScript/Node.js Examples

### Basic Conversion
```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const BASE_URL = 'http://localhost:8000';

async function convertPdfToWord(token, filePath) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  
  const response = await axios.post(
    `${BASE_URL}/api/v3/conversions/pdf-to-word`,
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Idempotency-Key': uuidv4(),
        ...formData.getHeaders()
      }
    }
  );
  
  return response.data;
}

// Usage
const token = '<your_token>';
convertPdfToWord(token, 'document.pdf')
  .then(result => {
    if (result.success) {
      console.log(`✅ Success: ${result.filename}`);
      console.log(`Download: ${result.download_url}`);
    } else {
      console.log(`❌ Failed: ${result.message}`);
    }
  })
  .catch(error => {
    if (error.response?.status === 403) {
      console.log('❌ Insufficient points or permissions');
    } else {
      console.log(`❌ Error: ${error.message}`);
    }
  });
```

### Check Balance
```javascript
async function checkBalance(token) {
  const response = await axios.get(
    `${BASE_URL}/api/v3/points/balance`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  return response.data.balance;
}

// Usage
checkBalance(token).then(balance => {
  console.log(`Balance: ${balance} points`);
});
```

---

## Response Examples

### Successful Conversion
```json
{
  "success": true,
  "message": "PDF converted successfully",
  "filename": "document_20260225_120000_abc123.docx",
  "download_url": "/api/v3/conversions/pdf-to-word/files/document_20260225_120000_abc123.docx"
}
```

### Failed Conversion (Points Refunded)
```json
{
  "success": false,
  "message": "Conversion failed: Invalid PDF structure",
  "filename": null,
  "download_url": null
}
```

### Points Balance
```json
{
  "balance": 27
}
```

### Points Ledger
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
        "result": {
          "success": true,
          "filename": "document_20260225_120000_abc123.docx"
        }
      },
      "created_at": "2026-02-25T12:00:00"
    }
  ],
  "limit": 50,
  "offset": 0
}
```

### User Permissions
```json
{
  "user_id": 5,
  "permissions": [
    {
      "action": "pdf_to_docs",
      "is_allowed": true,
      "created_at": "2026-02-25T10:00:00",
      "updated_at": "2026-02-25T10:00:00"
    }
  ]
}
```

---

## Common Errors

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

### Invalid File
```json
{
  "detail": "Only PDF files are accepted"
}
```

---

## Tips & Best Practices

1. **Always use Idempotency-Key** for conversions to prevent duplicate charges
2. **Check balance** before batch operations
3. **Handle 403 errors** gracefully (insufficient points/permissions)
4. **Monitor ledger** for audit trail
5. **Super users** bypass points and permissions (use for admin operations)
6. **Failed conversions** automatically refund points
7. **Cached results** (X-Idempotent-Replay) don't charge points

---

**API Version:** 3.0  
**Last Updated:** February 25, 2026
