# API v2 Quick Summary

One-page overview of the PDF Converter API v2.

---

## Base URL
```
http://localhost:8000/api/v2
```

---

## Authentication

All endpoints (except `/auth/login` and `/auth/refresh`) require JWT authentication.

**Header:**
```
Authorization: Bearer <access_token>
```

---

## Endpoints Overview

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | Login with email/password | ❌ |
| POST | `/auth/refresh` | Refresh access token | ❌ |
| GET | `/auth/me` | Get current user info | ✅ |

### User Management
| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| POST | `/users` | Create new user | super_user, admin_user |
| GET | `/users` | List all users | super_user, admin_user |
| PATCH | `/users/{id}/role` | Update user role | super_user |
| PATCH | `/users/{id}/disable` | Disable user | super_user, admin_user |

### File Conversions
| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| POST | `/conversions/pdf-to-word` | Convert PDF to DOCX | All (except demo) |
| POST | `/conversions/pdf-to-excel` | Convert PDF to XLSX | All (except demo) |
| POST | `/conversions/docx-to-pdf` | Convert DOCX to PDF | All (except demo) |
| POST | `/conversions/excel-to-pdf` | Convert Excel to PDF | All (except demo) |
| POST | `/conversions/image-to-pdf` | Convert image to PDF | All (except demo) |
| POST | `/conversions/remove-pages-from-pdf` | Remove PDF pages | All (except demo) |
| POST | `/conversions/remove-background` | Remove image background | All (except demo) |
| GET | `/conversions/{type}/files` | List converted files | All authenticated |
| GET | `/conversions/{type}/files/{filename}` | Download file | All authenticated |

---

## User Roles

| Role | Upload Files | Download Files | Manage Users |
|------|--------------|----------------|--------------|
| super_user | ✅ | ✅ | ✅ All |
| admin_user | ✅ | ✅ | ✅ Limited |
| general_user | ✅ | ✅ | ❌ |
| demo_user | ❌ | ✅ | ❌ |

---

## Quick Examples

### Login
```bash
curl -X POST "http://localhost:8000/api/v2/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### Create User
```bash
curl -X POST "http://localhost:8000/api/v2/users" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","password":"pass123","role":"general_user"}'
```

### Convert PDF to Word
```bash
curl -X POST "http://localhost:8000/api/v2/conversions/pdf-to-word" \
  -H "Authorization: Bearer <token>" \
  -F "file=@document.pdf"
```

### List Files
```bash
curl -X GET "http://localhost:8000/api/v2/conversions/pdf-to-word/files" \
  -H "Authorization: Bearer <token>"
```

### Download File
```bash
curl -X GET "http://localhost:8000/api/v2/conversions/pdf-to-word/files/{filename}" \
  -H "Authorization: Bearer <token>" \
  -o "output.docx"
```

---

## Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (invalid data) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |

---

## File Limits

- **Max Size:** 50MB
- **Formats:** PDF, DOCX, XLSX, XLS, JPG, JPEG, PNG, GIF, BMP, TIFF

---

## Token Expiration

- **Access Token:** 30 minutes
- **Refresh Token:** 7 days

---

## Documentation Links

- **[Full Documentation](./API_V2_DOCUMENTATION.md)** - Complete API reference
- **[Quick Reference](./API_V2_QUICK_REFERENCE.md)** - Code examples
- **[Postman Guide](./API_V2_POSTMAN_GUIDE.md)** - Testing guide
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues

---

**API Version:** 2.0  
**Last Updated:** February 23, 2026
