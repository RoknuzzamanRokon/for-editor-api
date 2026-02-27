# Postman Collection Guide

## Overview

Your Postman collection has been successfully created with 15+ API requests covering all three versions of your PDF Converter API.

## Collection Details

- **Workspace:** PDF Converter API
- **Collection ID:** `9ee2db49-39d3-4e90-9c07-31c9900e472d`
- **Environment:** Local Development (http://localhost:8000)

## What's Included

### API v1 - Basic Conversions (No Auth)
- Convert PDF to Excel
- Convert PDF to Word

### API v2 - Authentication
- Register (creates new user account)
- Login (saves token automatically)
- Get Current User

### API v3 - Points & Permissions
**Points Management:**
- Get Balance
- Get Ledger (transaction history)
- Get Point Rules
- Top Up Points (admin only)

**Permissions:**
- List All Actions

**Conversions (3 points each):**
- Convert PDF to Word
- Convert PDF to Excel
- Convert DOCX to PDF
- Convert Excel to PDF
- Convert Image to PDF

## How to Use

### 1. Open in Postman

Visit your workspace:
https://www.postman.com/rokoron/workspace/pdf-converter-api

### 2. Test the API

**Option A: Test v1 (No Auth Required)**
1. Select "API v1 - Convert PDF to Excel"
2. Click "Body" tab
3. Select a PDF file
4. Click "Send"

**Option B: Test v2/v3 (Auth Required)**
1. First, run "API v2 - Login" to get a token
   - The token is automatically saved to `{{token}}` variable
2. Then run any v2 or v3 endpoint
   - They all use `Bearer {{token}}` authentication

### 3. Variables

The collection uses these variables:
- `{{base_url}}` - Set to `http://localhost:8000`
- `{{token}}` - Auto-populated after login
- `{{$guid}}` - Auto-generated for idempotency keys

## Testing Workflow

### Quick Test (v1 - No Auth)
```
1. API v1 - Convert PDF to Excel
   → Upload a PDF file
   → Get download URL
```

### Full Test (v2 + v3 with Auth)
```
1. API v2 - Register
   → Create a new user account

2. API v2 - Login
   → Get access token (auto-saved)

3. API v3 - Get Balance
   → Check your points (should be 30 for new users)

4. API v3 - Convert PDF to Word (3 pts)
   → Upload a PDF file
   → Uses idempotency key for safe retries

5. API v3 - Get Balance
   → Verify points deducted (should be 27)

6. API v3 - Get Ledger
   → View transaction history
```

## Running the Collection

You can run the entire collection or specific folders using Postman's Collection Runner:

1. Click the collection name
2. Click "Run" button
3. Select which requests to run
4. Click "Run PDF Converter API"

## Automated Testing

The collection includes test scripts:

**Login Request:**
- Automatically saves the access token to `{{token}}`
- Logs the token to console

**All v3 Conversion Requests:**
- Include `Idempotency-Key` header for safe retries
- Prevents duplicate charges on network failures

## Next Steps

### Add More Tests

You can add test scripts to validate responses:

```javascript
// Example: Test successful conversion
pm.test("Conversion successful", function () {
    pm.response.to.have.status(200);
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.filename).to.exist;
});

// Example: Test points deduction
pm.test("Points deducted correctly", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.points_remaining).to.be.a('number');
});
```

### Create Environments

Create different environments for:
- Local: `http://localhost:8000`
- Staging: `https://staging.example.com`
- Production: `https://app.graphicscycle.com`

### Export Collection

To share with your team:
1. Click the collection
2. Click "..." menu
3. Select "Export"
4. Choose v2.1 format
5. Save the JSON file

## Troubleshooting

**"Unauthorized" errors:**
- Run "API v2 - Login" first
- Check that `{{token}}` variable is set

**"Insufficient points" errors:**
- Check balance with "API v3 - Get Balance"
- Use "API v3 - Top Up Points" (requires admin role)

**"Permission denied" errors:**
- Contact admin to grant permissions
- Check available actions with "API v3 - List All Actions"

## API Documentation

For detailed API documentation, see:
- [API v1 Documentation](./API_DOCUMENTATION.md)
- [API v2 Documentation](./backend/docs/API_V2_DOCUMENTATION.md)
- [API v3 Documentation](./backend/docs/API_V3_DOCUMENTATION.md)

## Support

For issues or questions:
- Check the API documentation
- Review the Postman console for detailed logs
- Verify your server is running on http://localhost:8000
