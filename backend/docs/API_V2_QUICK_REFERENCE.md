# API v2 Quick Reference Guide

## Base URL
```
http://localhost:8000/api/v2
```

## Authentication

### Login
```bash
POST /api/v2/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

### Refresh Token
```bash
POST /api/v2/auth/refresh
Content-Type: application/json

{
  "refresh_token": "your_refresh_token"
}
```

### Get Current User
```bash
GET /api/v2/auth/me
Authorization: Bearer <access_token>
```

---

## User Management

### Create User (admin/super_user only)
```bash
POST /api/v2/users
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "username": "newuser",
  "role": "general_user"
}
```

### List Users (admin/super_user only)
```bash
GET /api/v2/users
Authorization: Bearer <access_token>
```

### Update User Role (super_user only)
```bash
PATCH /api/v2/users/{user_id}/role
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "role": "admin_user"
}
```

### Disable User (admin/super_user only)
```bash
PATCH /api/v2/users/{user_id}/disable
Authorization: Bearer <access_token>
```

---

## File Conversions

All conversion endpoints require authentication and follow the same pattern.

### PDF to Word
```bash
# Upload & Convert
POST /api/v2/conversions/pdf-to-word
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
file: <PDF file>

# List Files
GET /api/v2/conversions/pdf-to-word/files
Authorization: Bearer <access_token>

# Download File
GET /api/v2/conversions/pdf-to-word/files/{filename}
Authorization: Bearer <access_token>
```

### PDF to Excel
```bash
# Upload & Convert
POST /api/v2/conversions/pdf-to-excel
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
file: <PDF file>

# List Files
GET /api/v2/conversions/pdf-to-excel/files
Authorization: Bearer <access_token>

# Download File
GET /api/v2/conversions/pdf-to-excel/files/{filename}
Authorization: Bearer <access_token>
```

### DOCX to PDF
```bash
# Upload & Convert
POST /api/v2/conversions/docx-to-pdf
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
file: <DOCX file>

# List Files
GET /api/v2/conversions/docx-to-pdf/files
Authorization: Bearer <access_token>

# Download File
GET /api/v2/conversions/docx-to-pdf/files/{filename}
Authorization: Bearer <access_token>
```

### Excel to PDF
```bash
# Upload & Convert
POST /api/v2/conversions/excel-to-pdf
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
file: <Excel file>

# List Files
GET /api/v2/conversions/excel-to-pdf/files
Authorization: Bearer <access_token>

# Download File
GET /api/v2/conversions/excel-to-pdf/files/{filename}
Authorization: Bearer <access_token>
```

### Image to PDF
```bash
# Upload & Convert
POST /api/v2/conversions/image-to-pdf
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
file: <Image file>

# List Files
GET /api/v2/conversions/image-to-pdf/files
Authorization: Bearer <access_token>

# Download File
GET /api/v2/conversions/image-to-pdf/files/{filename}
Authorization: Bearer <access_token>
```

### Remove Pages from PDF
```bash
# Upload & Process
POST /api/v2/conversions/remove-pages-from-pdf
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
file: <PDF file>
pages: "1,3,5-7" (optional)
remove_blank: true (optional)

# List Files
GET /api/v2/conversions/remove-pages-from-pdf/files
Authorization: Bearer <access_token>

# Download File
GET /api/v2/conversions/remove-pages-from-pdf/files/{filename}
Authorization: Bearer <access_token>
```

### Remove Background from Image
```bash
# Upload & Process
POST /api/v2/conversions/remove-background
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
file: <Image file>

# List Files
GET /api/v2/conversions/remove-background/files
Authorization: Bearer <access_token>

# Download File
GET /api/v2/conversions/remove-background/files/{filename}
Authorization: Bearer <access_token>
```

---

## User Roles

| Role | Can Upload | Can Download | Can Manage Users |
|------|------------|--------------|------------------|
| super_user | ✅ | ✅ | ✅ All users |
| admin_user | ✅ | ✅ | ✅ Limited |
| general_user | ✅ | ✅ | ❌ |
| demo_user | ❌ | ✅ | ❌ |

---

## Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

---

## File Limits

- **Max file size:** 50MB
- **Supported formats:**
  - PDF: `.pdf`
  - Word: `.docx`
  - Excel: `.xlsx`, `.xls`
  - Images: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.tiff`

---

## Token Expiration

- **Access Token:** 30 minutes
- **Refresh Token:** 7 days

---

## cURL Examples

### Complete Workflow
```bash
# 1. Login
TOKEN_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/v2/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}')

ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.access_token')

# 2. Convert PDF to Word
curl -X POST "http://localhost:8000/api/v2/conversions/pdf-to-word" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "file=@document.pdf"

# 3. List converted files
curl -X GET "http://localhost:8000/api/v2/conversions/pdf-to-word/files" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 4. Download file
curl -X GET "http://localhost:8000/api/v2/conversions/pdf-to-word/files/document_20260223_120000_abc123.docx" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -o "output.docx"
```

---

## Python Example

```python
import requests

# Base URL
BASE_URL = "http://localhost:8000/api/v2"

# 1. Login
response = requests.post(
    f"{BASE_URL}/auth/login",
    json={"email": "user@example.com", "password": "password"}
)
tokens = response.json()
access_token = tokens["access_token"]

# 2. Upload and convert
headers = {"Authorization": f"Bearer {access_token}"}
files = {"file": open("document.pdf", "rb")}
response = requests.post(
    f"{BASE_URL}/conversions/pdf-to-word",
    headers=headers,
    files=files
)
result = response.json()
print(f"Conversion: {result['message']}")
print(f"Download URL: {result['download_url']}")

# 3. Download converted file
if result["success"]:
    download_url = f"{BASE_URL}{result['download_url']}"
    response = requests.get(download_url, headers=headers)
    with open("converted.docx", "wb") as f:
        f.write(response.content)
```

---

## JavaScript/Node.js Example

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:8000/api/v2';

async function convertPdfToWord() {
  // 1. Login
  const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'user@example.com',
    password: 'password'
  });
  const accessToken = loginResponse.data.access_token;

  // 2. Upload and convert
  const formData = new FormData();
  formData.append('file', fs.createReadStream('document.pdf'));

  const convertResponse = await axios.post(
    `${BASE_URL}/conversions/pdf-to-word`,
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  console.log('Conversion:', convertResponse.data.message);
  console.log('Download URL:', convertResponse.data.download_url);

  // 3. Download converted file
  if (convertResponse.data.success) {
    const downloadUrl = `${BASE_URL}${convertResponse.data.download_url}`;
    const fileResponse = await axios.get(downloadUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      responseType: 'arraybuffer'
    });
    fs.writeFileSync('converted.docx', fileResponse.data);
  }
}

convertPdfToWord();
```

---

## Error Handling Example

```python
import requests

def convert_with_error_handling(access_token, file_path):
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        files = {"file": open(file_path, "rb")}
        
        response = requests.post(
            "http://localhost:8000/api/v2/conversions/pdf-to-word",
            headers=headers,
            files=files
        )
        
        if response.status_code == 200:
            result = response.json()
            if result["success"]:
                print(f"✅ Success: {result['message']}")
                return result
            else:
                print(f"❌ Conversion failed: {result['message']}")
                return None
        elif response.status_code == 401:
            print("❌ Unauthorized: Token expired or invalid")
        elif response.status_code == 403:
            print("❌ Forbidden: Insufficient permissions")
        elif response.status_code == 400:
            error = response.json()
            print(f"❌ Bad Request: {error['detail']}")
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
    
    return None
```

---

## Tips & Best Practices

1. **Store tokens securely** - Never commit tokens to version control
2. **Refresh tokens proactively** - Refresh before access token expires
3. **Handle 401 errors** - Implement automatic token refresh
4. **Validate files client-side** - Check file size and type before upload
5. **Use HTTPS in production** - Never send tokens over HTTP
6. **Implement retry logic** - Handle temporary network failures
7. **Clean up downloaded files** - Delete temporary files after processing
8. **Monitor rate limits** - Implement exponential backoff for retries

---

For detailed documentation, see [API_V2_DOCUMENTATION.md](./API_V2_DOCUMENTATION.md)
