# PDF Converter API Documentation

Welcome to the PDF Converter API documentation. This folder contains comprehensive guides for both API versions and services.

---

## 📚 Documentation Index

### API v2 Documentation (Recommended)

#### Core Documentation
- **[API v2 Summary](./API_V2_SUMMARY.md)** ⭐ - One-page quick overview
- **[API v2 Full Documentation](./API_V2_DOCUMENTATION.md)** - Complete API reference with all endpoints, authentication, and examples
- **[API v2 Quick Reference](./API_V2_QUICK_REFERENCE.md)** - Quick reference guide with code examples in multiple languages
- **[API v2 Postman Guide](./API_V2_POSTMAN_GUIDE.md)** - Step-by-step guide for testing with Postman

#### Additional Guides
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[Email Validation Note](./EMAIL_VALIDATION_NOTE.md)** - Email validation configuration details

#### Services
- **[Services Documentation](./SERVICES_DOCUMENTATION.md)** - Internal services and business logic documentation

---

## 🚀 Quick Start

### For New Users

1. **Start here:** [API v2 Summary](./API_V2_SUMMARY.md) - Get a quick overview
2. **Then read:** [API v2 Quick Reference](./API_V2_QUICK_REFERENCE.md) - See code examples
3. **For details:** [API v2 Full Documentation](./API_V2_DOCUMENTATION.md) - Complete reference

### For Testing

1. **Use Postman:** [Postman Guide](./API_V2_POSTMAN_GUIDE.md)
2. **Or Python:** See [Quick Reference](./API_V2_QUICK_REFERENCE.md) for examples
3. **Having issues?** Check [Troubleshooting](./TROUBLESHOOTING.md)

---

## 🎯 Choose Your Documentation

### I want to...

**Get started quickly**
→ [API v2 Summary](./API_V2_SUMMARY.md)

**See code examples**
→ [API v2 Quick Reference](./API_V2_QUICK_REFERENCE.md)

**Understand everything in detail**
→ [API v2 Full Documentation](./API_V2_DOCUMENTATION.md)

**Test with Postman**
→ [API v2 Postman Guide](./API_V2_POSTMAN_GUIDE.md)

**Fix an error**
→ [Troubleshooting Guide](./TROUBLESHOOTING.md)

**Understand email validation**
→ [Email Validation Note](./EMAIL_VALIDATION_NOTE.md)

**Learn about internal services**
→ [Services Documentation](./SERVICES_DOCUMENTATION.md)

---

## 📖 Documentation Overview

### API v2 Summary (NEW!)

**[API_V2_SUMMARY.md](./API_V2_SUMMARY.md)**

One-page quick reference with:
- All endpoints at a glance
- User roles matrix
- Quick examples
- Common status codes
- File limits and token expiration

**Best for:** Quick lookups, getting started, sharing with team

---

### API v2 Full Documentation

**[API_V2_DOCUMENTATION.md](./API_V2_DOCUMENTATION.md)**

Comprehensive documentation covering:
- Authentication & Authorization
- User Management (CRUD operations)
- All File Conversion Endpoints
- Role-Based Access Control (RBAC)
- Request/Response Models
- Error Handling
- Security Features
- Complete Examples

**Best for:** Understanding the complete API, integration planning, reference

---

### API v2 Quick Reference

**[API_V2_QUICK_REFERENCE.md](./API_V2_QUICK_REFERENCE.md)**

Quick reference guide with:
- All endpoints at a glance
- cURL examples
- Python code examples
- JavaScript/Node.js examples
- Error handling patterns
- Common workflows

**Best for:** Quick lookups, copy-paste examples, daily development

---

### API v2 Postman Guide

**[API_V2_POSTMAN_GUIDE.md](./API_V2_POSTMAN_GUIDE.md)**

Postman testing guide with:
- Collection setup instructions
- Environment configuration
- Automated token management
- Test scripts for all endpoints
- Newman CLI usage
- Troubleshooting tips

**Best for:** API testing, QA workflows, automated testing

---

### Troubleshooting Guide

**[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**

Common issues and solutions:
- Authentication issues
- Email validation errors
- Database connection problems
- File upload issues
- Permission errors
- Conversion failures
- Server errors

**Best for:** Debugging, solving problems, error resolution

---

### Email Validation Note

**[EMAIL_VALIDATION_NOTE.md](./EMAIL_VALIDATION_NOTE.md)**

Email validation details:
- Why validation was changed
- Supported email formats
- Production recommendations
- Migration impact
- Security considerations

**Best for:** Understanding email validation, production setup

---

### Services Documentation

**[SERVICES_DOCUMENTATION.md](./SERVICES_DOCUMENTATION.md)**

Internal services documentation covering:
- File conversion services
- Authentication services
- User management services
- File management utilities
- Business logic implementation

**Best for:** Backend developers, service maintenance, extending functionality

---

## 🔑 Key Features

### API v2 Features

✅ **JWT Authentication** - Secure token-based authentication  
✅ **Role-Based Access Control** - 4 user roles with different permissions  
✅ **Token Refresh** - Automatic token renewal without re-login  
✅ **User Management** - Complete CRUD for user accounts  
✅ **File Conversions** - 7 different conversion types  
✅ **File Management** - List and download converted files  
✅ **Security** - bcrypt password hashing, input validation, path traversal protection  

### Supported Conversions

1. **PDF to Word** - Convert PDF documents to editable DOCX files
2. **PDF to Excel** - Extract tables from PDF to XLSX spreadsheets
3. **DOCX to PDF** - Convert Word documents to PDF format
4. **Excel to PDF** - Convert spreadsheets to PDF format
5. **Image to PDF** - Convert images (JPG, PNG, etc.) to PDF
6. **Remove Pages from PDF** - Remove specific or blank pages from PDFs
7. **Remove Background** - Remove background from images (outputs PNG with transparency)

---

## 👥 User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **super_user** | System administrator | Full access to all features and user management |
| **admin_user** | Organization admin | Can create/manage users, full conversion access |
| **general_user** | Regular user | Full conversion access, no user management |
| **demo_user** | Read-only demo | Can list and download files, cannot upload |

---

## 🔐 Authentication Flow

```
1. POST /api/v2/auth/login
   ↓
2. Receive access_token + refresh_token
   ↓
3. Use access_token in Authorization header
   ↓
4. When access_token expires (30 min)
   ↓
5. POST /api/v2/auth/refresh with refresh_token
   ↓
6. Receive new access_token
   ↓
7. Continue using API
```

---

## 📝 Common Use Cases

### Use Case 1: Convert PDF to Word

```bash
# 1. Login
TOKEN=$(curl -s -X POST "http://localhost:8000/api/v2/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.access_token')

# 2. Convert
curl -X POST "http://localhost:8000/api/v2/conversions/pdf-to-word" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@document.pdf"

# 3. Download
curl -X GET "http://localhost:8000/api/v2/conversions/pdf-to-word/files/document_20260223_120000_abc123.docx" \
  -H "Authorization: Bearer $TOKEN" \
  -o "converted.docx"
```

### Use Case 2: Create New User (Admin)

```bash
curl -X POST "http://localhost:8000/api/v2/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "secure_password",
    "username": "newuser",
    "role": "general_user"
  }'
```

### Use Case 3: Remove Pages from PDF

```bash
curl -X POST "http://localhost:8000/api/v2/conversions/remove-pages-from-pdf" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@document.pdf" \
  -F "pages=1,3,5-7" \
  -F "remove_blank=true"
```

---

## 🛠️ Development Setup

### Prerequisites

- Python 3.9+
- FastAPI
- SQLAlchemy
- JWT libraries
- File conversion libraries (see requirements)

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DB_HOST=localhost
DB_NAME=pdf_converter
DB_USER=your_user
DB_PASSWORD=your_password
DATABASE_URL=sqlite:///./pdf_converter.db

# Security
SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# API
BACKEND_URL=http://localhost:8000

# Default Admin
DEFAULT_ADMIN_EMAIL=admin@local
DEFAULT_ADMIN_PASSWORD=Admin@12345
```

### Running the API

```bash
# Install dependencies
cd backend
pipenv install

# Activate virtual environment
pipenv shell

# Initialize database
python -c "from db.session import init_db; init_db()"

# Create super user
python create_superuser.py

# Run server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### API Documentation (Swagger)

Once the server is running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 📊 API Comparison

| Feature | API v1 | API v2 |
|---------|--------|--------|
| Authentication | ❌ None | ✅ JWT |
| Authorization | ❌ None | ✅ RBAC |
| User Management | ❌ | ✅ |
| Token Refresh | ❌ | ✅ |
| File Conversions | ✅ | ✅ |
| Demo Mode | ❌ | ✅ |
| Base Path | `/api/v1` | `/api/v2` |

---

## 🔗 Related Documentation

### Project Root Documentation
- **[README.md](../../README.md)** - Project overview and setup
- **[API_DOCUMENTATION.md](../../API_DOCUMENTATION.md)** - General API documentation
- **[API_ENDPOINTS_SUMMARY.md](../../API_ENDPOINTS_SUMMARY.md)** - Endpoints summary
- **[FRONTEND_SETUP.md](../../FRONTEND_SETUP.md)** - Frontend setup guide

### Backend Documentation
- **[Database Migrations](../db/migrations/README.md)** - Database schema and migrations
- **[Create Super User Guide](../CREATE_SUPERUSER.md)** - Super user creation guide
- **[Test User Creation](../TEST_USER_CREATION.md)** - User creation API testing guide

---

## 🤝 Contributing

When updating the API:

1. Update the relevant documentation file
2. Add examples for new endpoints
3. Update the Postman collection
4. Test all examples
5. Update this README if adding new docs

---

## 📞 Support

For questions or issues:
- Check the documentation first
- Review code examples
- Test with Postman
- Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Contact the development team

---

## 📄 License

See project root for license information.

---

**Last Updated:** February 23, 2026  
**API Version:** 2.0  
**Documentation Version:** 1.1
