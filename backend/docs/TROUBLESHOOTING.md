# API v2 Troubleshooting Guide

Common issues and solutions for the PDF Converter API v2.

---

## Table of Contents

1. [Authentication Issues](#authentication-issues)
2. [Email Validation Errors](#email-validation-errors)
3. [Database Connection Issues](#database-connection-issues)
4. [File Upload Issues](#file-upload-issues)
5. [Permission Errors](#permission-errors)
6. [Conversion Failures](#conversion-failures)
7. [Server Errors](#server-errors)

---

## Authentication Issues

### Issue: 401 Unauthorized

**Symptoms:**
```json
{
  "detail": "Invalid credentials"
}
```

**Solutions:**

1. **Check credentials:**
   ```bash
   # Verify email and password are correct
   curl -X POST "http://localhost:8000/api/v2/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email":"correct@email.com","password":"correct_password"}'
   ```

2. **Check user exists:**
   ```bash
   # Login as admin and list users
   curl -X GET "http://localhost:8000/api/v2/users" \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   ```

3. **Check user is active:**
   - User account might be disabled
   - Contact admin to re-enable account

---

### Issue: Token Expired

**Symptoms:**
```json
{
  "detail": "Invalid token"
}
```

**Solutions:**

1. **Refresh the token:**
   ```bash
   curl -X POST "http://localhost:8000/api/v2/auth/refresh" \
     -H "Content-Type: application/json" \
     -d '{"refresh_token":"your_refresh_token"}'
   ```

2. **Re-login if refresh fails:**
   ```bash
   curl -X POST "http://localhost:8000/api/v2/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password"}'
   ```

---

## Email Validation Errors

### Issue: ResponseValidationError for email

**Symptoms:**
```
ResponseValidationError: value is not a valid email address
```

**Cause:**
- Email format doesn't meet validation requirements
- Common with local development emails like `admin@local`

**Solution:**

The API now supports lenient email validation. Emails only need to contain `@` symbol.

**Valid formats:**
- `user@example.com` ✅
- `admin@local` ✅
- `test@localhost` ✅

**Invalid formats:**
- `userexample.com` ❌ (missing @)
- `@example.com` ❌ (missing local part)
- `user@` ❌ (missing domain)

**For production:**
Update `.env` to use proper domain:
```env
DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
```

See [EMAIL_VALIDATION_NOTE.md](./EMAIL_VALIDATION_NOTE.md) for details.

---

## Database Connection Issues

### Issue: Database connection failed

**Symptoms:**
```
sqlalchemy.exc.OperationalError: (pymysql.err.OperationalError)
```

**Solutions:**

1. **Check database is running:**
   ```bash
   # For MySQL
   sudo systemctl status mysql
   
   # For PostgreSQL
   sudo systemctl status postgresql
   ```

2. **Verify connection settings in `.env`:**
   ```env
   DB_HOST=localhost
   DB_NAME=pdf_converter
   DB_USER=your_user
   DB_PASSWORD=your_password
   ```

3. **Test database connection:**
   ```bash
   # MySQL
   mysql -h localhost -u your_user -p pdf_converter
   
   # PostgreSQL
   psql -h localhost -U your_user -d pdf_converter
   ```

4. **Initialize database:**
   ```bash
   cd backend
   python -c "from db.session import init_db; init_db()"
   ```

---

### Issue: Table doesn't exist

**Symptoms:**
```
sqlalchemy.exc.ProgrammingError: (pymysql.err.ProgrammingError) 
(1146, "Table 'pdf_converter.users' doesn't exist")
```

**Solution:**

Run database migrations:
```bash
cd backend

# Option 1: Use SQLAlchemy
python -c "from db.session import init_db; init_db()"

# Option 2: Use SQL migration
mysql -u your_user -p pdf_converter < db/migrations/001_initial_schema.sql
```

---

## File Upload Issues

### Issue: File size exceeds limit

**Symptoms:**
```json
{
  "detail": "File size exceeds maximum limit of 50MB"
}
```

**Solution:**

1. **Compress the file** before uploading
2. **Split large files** into smaller parts
3. **Increase limit** (if you control the server):
   - Update `MAX_FILE_SIZE_BYTES` in `backend/models/schemas.py`
   - Restart the server

---

### Issue: Invalid file type

**Symptoms:**
```json
{
  "detail": "Invalid file type. Expected: application/pdf"
}
```

**Solution:**

1. **Check file extension:**
   - PDF files: `.pdf`
   - Word files: `.docx`
   - Excel files: `.xlsx`, `.xls`
   - Images: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.tiff`

2. **Verify file is not corrupted:**
   ```bash
   file document.pdf
   # Should output: PDF document, version X.X
   ```

3. **Re-save file** in correct format using appropriate software

---

### Issue: File upload timeout

**Symptoms:**
- Request hangs
- Connection timeout error

**Solutions:**

1. **Check network connection**
2. **Increase timeout** in client:
   ```python
   # Python
   response = requests.post(url, files=files, timeout=300)  # 5 minutes
   ```
3. **Use smaller files** for testing
4. **Check server logs** for errors

---

## Permission Errors

### Issue: 403 Forbidden - Insufficient permissions

**Symptoms:**
```json
{
  "detail": "Insufficient permissions"
}
```

**Solutions:**

1. **Check your role:**
   ```bash
   curl -X GET "http://localhost:8000/api/v2/auth/me" \
     -H "Authorization: Bearer $TOKEN"
   ```

2. **Required roles by endpoint:**
   - Create user: `super_user` or `admin_user`
   - Update role: `super_user` only
   - Disable user: `super_user` or `admin_user`
   - File conversions: All authenticated users

3. **Contact admin** to update your role if needed

---

### Issue: Demo users cannot upload files

**Symptoms:**
```json
{
  "detail": "Demo users cannot perform write operations"
}
```

**Solution:**

Demo users have read-only access. To upload files:
1. **Request role upgrade** from admin
2. **Create new account** with `general_user` role
3. **Use different account** for uploads

---

## Conversion Failures

### Issue: PDF to Excel - No tables found

**Symptoms:**
```json
{
  "success": false,
  "message": "No tables found in PDF"
}
```

**Solutions:**

1. **Verify PDF contains tables:**
   - Open PDF and check for table structures
   - Tables must have clear borders or structure

2. **Try different PDF:**
   - Some PDFs have tables as images (won't work)
   - Use PDFs with actual table data

3. **Use PDF to Word** instead:
   - Convert to Word first
   - Extract tables manually

---

### Issue: Conversion failed with no error message

**Symptoms:**
```json
{
  "success": false,
  "message": "Conversion failed"
}
```

**Solutions:**

1. **Check server logs:**
   ```bash
   # View recent logs
   tail -f /path/to/logs/app.log
   ```

2. **Verify file is not corrupted:**
   ```bash
   file document.pdf
   ```

3. **Try with different file:**
   - Test with known good file
   - Check if issue is file-specific

4. **Check dependencies:**
   ```bash
   cd backend
   pipenv install
   ```

---

## Server Errors

### Issue: 500 Internal Server Error

**Symptoms:**
```json
{
  "detail": "Internal server error: ..."
}
```

**Solutions:**

1. **Check server logs:**
   ```bash
   # If running with uvicorn
   # Logs appear in terminal
   
   # Check system logs
   journalctl -u pdf-converter-api -n 50
   ```

2. **Verify all dependencies installed:**
   ```bash
   cd backend
   pipenv install
   pipenv shell
   ```

3. **Check environment variables:**
   ```bash
   cat .env
   # Verify all required variables are set
   ```

4. **Restart server:**
   ```bash
   # Stop server (Ctrl+C)
   # Start again
   uvicorn main:app --reload
   ```

---

### Issue: Module not found

**Symptoms:**
```
ModuleNotFoundError: No module named 'xxx'
```

**Solutions:**

1. **Install dependencies:**
   ```bash
   cd backend
   pipenv install
   ```

2. **Activate virtual environment:**
   ```bash
   pipenv shell
   ```

3. **Install specific package:**
   ```bash
   pipenv install package-name
   ```

---

## Common Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Invalid input data, file validation failed |
| 401 | Unauthorized | Missing/invalid token, wrong credentials |
| 403 | Forbidden | Insufficient permissions, demo user restrictions |
| 404 | Not Found | File/user not found, wrong endpoint |
| 422 | Validation Error | Pydantic validation failed, invalid data format |
| 500 | Server Error | Internal error, check logs |

---

## Debug Mode

Enable debug mode for detailed error messages:

```python
# backend/main.py
app = FastAPI(debug=True)  # Enable debug mode
```

**Warning:** Never enable debug mode in production!

---

## Getting Help

If issues persist:

1. **Check documentation:**
   - [API_V2_DOCUMENTATION.md](./API_V2_DOCUMENTATION.md)
   - [API_V2_QUICK_REFERENCE.md](./API_V2_QUICK_REFERENCE.md)

2. **Review logs:**
   - Server logs
   - Database logs
   - Application logs

3. **Test with Postman:**
   - Use [Postman Guide](./API_V2_POSTMAN_GUIDE.md)
   - Test individual endpoints

4. **Contact support:**
   - Provide error messages
   - Include relevant logs
   - Describe steps to reproduce

---

## Useful Commands

### Check API Status
```bash
curl http://localhost:8000/api/v2/
```

### View OpenAPI Docs
```
http://localhost:8000/docs
```

### Test Database Connection
```bash
cd backend
python -c "from db.session import SessionLocal; db = SessionLocal(); print('✅ Connected'); db.close()"
```

### List All Users (as admin)
```bash
curl -X GET "http://localhost:8000/api/v2/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Check Token Validity
```bash
curl -X GET "http://localhost:8000/api/v2/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

---

**Last Updated:** February 23, 2026
