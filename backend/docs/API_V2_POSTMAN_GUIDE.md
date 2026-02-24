# API v2 Postman Collection Guide

This guide explains how to set up and use Postman to test the PDF Converter API v2.

---

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Environment Variables](#environment-variables)
3. [Authentication Setup](#authentication-setup)
4. [Testing Endpoints](#testing-endpoints)
5. [Automated Token Refresh](#automated-token-refresh)
6. [Collection Structure](#collection-structure)

---

## Initial Setup

### Step 1: Import Collection

If you have a Postman collection file:

1. Open Postman
2. Click **Import** button
3. Select `PDF_Converter_API.postman_collection.json`
4. Click **Import**

### Step 2: Create Environment

1. Click **Environments** in the left sidebar
2. Click **+** to create new environment
3. Name it: `PDF Converter API v2 - Local`
4. Add the following variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:8000` | `http://localhost:8000` |
| `api_version` | `v2` | `v2` |
| `access_token` | (leave empty) | (leave empty) |
| `refresh_token` | (leave empty) | (leave empty) |
| `user_email` | `user@example.com` | `user@example.com` |
| `user_password` | `password123` | `password123` |

5. Click **Save**
6. Select this environment from the dropdown in top-right corner

---

## Environment Variables

### Variable Descriptions

- `base_url` - API base URL (change for production)
- `api_version` - API version (v1 or v2)
- `access_token` - JWT access token (auto-populated after login)
- `refresh_token` - JWT refresh token (auto-populated after login)
- `user_email` - Your login email
- `user_password` - Your login password

### Using Variables in Requests

In Postman, reference variables using double curly braces:

```
{{base_url}}/api/{{api_version}}/auth/login
```

This resolves to: `http://localhost:8000/api/v2/auth/login`

---

## Authentication Setup

### Step 1: Create Login Request

1. Create new request: `POST Login`
2. URL: `{{base_url}}/api/{{api_version}}/auth/login`
3. Headers:
   ```
   Content-Type: application/json
   ```
4. Body (raw JSON):
   ```json
   {
     "email": "{{user_email}}",
     "password": "{{user_password}}"
   }
   ```

### Step 2: Auto-Save Tokens

Add this script to the **Tests** tab of your login request:

```javascript
// Parse response
const response = pm.response.json();

// Save tokens to environment
if (response.access_token) {
    pm.environment.set("access_token", response.access_token);
    console.log("✅ Access token saved");
}

if (response.refresh_token) {
    pm.environment.set("refresh_token", response.refresh_token);
    console.log("✅ Refresh token saved");
}

// Test assertions
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has access_token", function () {
    pm.expect(response).to.have.property("access_token");
});

pm.test("Response has refresh_token", function () {
    pm.expect(response).to.have.property("refresh_token");
});

pm.test("Token type is bearer", function () {
    pm.expect(response.token_type).to.eql("bearer");
});
```

### Step 3: Use Token in Requests

For all authenticated requests, add this header:

```
Authorization: Bearer {{access_token}}
```

Or use Postman's **Authorization** tab:
1. Type: `Bearer Token`
2. Token: `{{access_token}}`

---

## Testing Endpoints

### 1. Authentication Endpoints

#### Login
```
POST {{base_url}}/api/{{api_version}}/auth/login
Content-Type: application/json

{
  "email": "{{user_email}}",
  "password": "{{user_password}}"
}
```

**Tests:**
```javascript
const response = pm.response.json();

pm.test("Login successful", () => {
    pm.response.to.have.status(200);
    pm.expect(response).to.have.property("access_token");
    pm.expect(response).to.have.property("refresh_token");
});

// Save tokens
pm.environment.set("access_token", response.access_token);
pm.environment.set("refresh_token", response.refresh_token);
```

---

#### Refresh Token
```
POST {{base_url}}/api/{{api_version}}/auth/refresh
Content-Type: application/json

{
  "refresh_token": "{{refresh_token}}"
}
```

**Tests:**
```javascript
const response = pm.response.json();

pm.test("Token refreshed", () => {
    pm.response.to.have.status(200);
    pm.expect(response).to.have.property("access_token");
});

// Update access token
pm.environment.set("access_token", response.access_token);
```

---

#### Get Current User
```
GET {{base_url}}/api/{{api_version}}/auth/me
Authorization: Bearer {{access_token}}
```

**Tests:**
```javascript
const response = pm.response.json();

pm.test("User info retrieved", () => {
    pm.response.to.have.status(200);
    pm.expect(response).to.have.property("id");
    pm.expect(response).to.have.property("email");
    pm.expect(response).to.have.property("role");
});
```

---

### 2. User Management Endpoints

#### Create User
```
POST {{base_url}}/api/{{api_version}}/users
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "username": "newuser",
  "role": "general_user"
}
```

**Tests:**
```javascript
const response = pm.response.json();

pm.test("User created", () => {
    pm.response.to.have.status(200);
    pm.expect(response).to.have.property("id");
    pm.expect(response.email).to.eql("newuser@example.com");
});

// Save user ID for later use
pm.environment.set("created_user_id", response.id);
```

---

#### List Users
```
GET {{base_url}}/api/{{api_version}}/users
Authorization: Bearer {{access_token}}
```

**Tests:**
```javascript
const response = pm.response.json();

pm.test("Users list retrieved", () => {
    pm.response.to.have.status(200);
    pm.expect(response).to.be.an("array");
    pm.expect(response.length).to.be.above(0);
});
```

---

### 3. File Conversion Endpoints

#### PDF to Word Conversion
```
POST {{base_url}}/api/{{api_version}}/conversions/pdf-to-word
Authorization: Bearer {{access_token}}
Content-Type: multipart/form-data

file: [Select PDF file]
```

**Tests:**
```javascript
const response = pm.response.json();

pm.test("Conversion successful", () => {
    pm.response.to.have.status(200);
    pm.expect(response.success).to.be.true;
    pm.expect(response).to.have.property("filename");
    pm.expect(response).to.have.property("download_url");
});

// Save filename for download test
if (response.success) {
    pm.environment.set("converted_filename", response.filename);
    pm.environment.set("download_url", response.download_url);
}
```

---

#### List Converted Files
```
GET {{base_url}}/api/{{api_version}}/conversions/pdf-to-word/files
Authorization: Bearer {{access_token}}
```

**Tests:**
```javascript
const response = pm.response.json();

pm.test("Files list retrieved", () => {
    pm.response.to.have.status(200);
    pm.expect(response).to.have.property("files");
    pm.expect(response).to.have.property("total_count");
    pm.expect(response.files).to.be.an("array");
});

pm.test("Total count matches files length", () => {
    pm.expect(response.total_count).to.eql(response.files.length);
});
```

---

#### Download Converted File
```
GET {{base_url}}/api/{{api_version}}{{download_url}}
Authorization: Bearer {{access_token}}
```

**Tests:**
```javascript
pm.test("File downloaded", () => {
    pm.response.to.have.status(200);
    pm.expect(pm.response.headers.get("Content-Type")).to.include("application");
});

pm.test("Content-Disposition header present", () => {
    pm.expect(pm.response.headers.has("Content-Disposition")).to.be.true;
});
```

---

## Automated Token Refresh

### Pre-request Script for Collection

Add this to your collection's **Pre-request Scripts** to automatically refresh expired tokens:

```javascript
// Check if access token exists
const accessToken = pm.environment.get("access_token");
const refreshToken = pm.environment.get("refresh_token");

if (!accessToken && refreshToken) {
    console.log("⚠️ No access token, attempting refresh...");
    
    // Refresh token request
    const refreshRequest = {
        url: pm.environment.get("base_url") + "/api/" + pm.environment.get("api_version") + "/auth/refresh",
        method: "POST",
        header: {
            "Content-Type": "application/json"
        },
        body: {
            mode: "raw",
            raw: JSON.stringify({
                refresh_token: refreshToken
            })
        }
    };
    
    pm.sendRequest(refreshRequest, (err, response) => {
        if (err) {
            console.error("❌ Token refresh failed:", err);
        } else {
            const jsonResponse = response.json();
            if (jsonResponse.access_token) {
                pm.environment.set("access_token", jsonResponse.access_token);
                console.log("✅ Access token refreshed");
            }
        }
    });
}
```

---

## Collection Structure

Organize your Postman collection with folders:

```
📁 PDF Converter API v2
├── 📁 Authentication
│   ├── POST Login
│   ├── POST Refresh Token
│   └── GET Current User
├── 📁 User Management
│   ├── POST Create User
│   ├── GET List Users
│   ├── PATCH Update User Role
│   └── PATCH Disable User
├── 📁 PDF to Word
│   ├── POST Convert PDF to Word
│   ├── GET List Word Files
│   └── GET Download Word File
├── 📁 PDF to Excel
│   ├── POST Convert PDF to Excel
│   ├── GET List Excel Files
│   └── GET Download Excel File
├── 📁 DOCX to PDF
│   ├── POST Convert DOCX to PDF
│   ├── GET List PDF Files
│   └── GET Download PDF File
├── 📁 Excel to PDF
│   ├── POST Convert Excel to PDF
│   ├── GET List PDF Files
│   └── GET Download PDF File
├── 📁 Image to PDF
│   ├── POST Convert Image to PDF
│   ├── GET List PDF Files
│   └── GET Download PDF File
├── 📁 Remove Pages from PDF
│   ├── POST Remove Pages
│   ├── GET List PDF Files
│   └── GET Download PDF File
└── 📁 Remove Background
    ├── POST Remove Background
    ├── GET List PNG Files
    └── GET Download PNG File
```

---

## Common Test Scripts

### Generic Success Test
```javascript
pm.test("Request successful", () => {
    pm.response.to.have.status(200);
});

pm.test("Response time acceptable", () => {
    pm.expect(pm.response.responseTime).to.be.below(5000);
});
```

### Authentication Error Test
```javascript
pm.test("Unauthorized error", () => {
    pm.response.to.have.status(401);
});

pm.test("Error message present", () => {
    const response = pm.response.json();
    pm.expect(response).to.have.property("detail");
});
```

### File Upload Test
```javascript
const response = pm.response.json();

pm.test("File uploaded successfully", () => {
    pm.response.to.have.status(200);
    pm.expect(response.success).to.be.true;
});

pm.test("Filename generated", () => {
    pm.expect(response.filename).to.match(/^.+_\d{8}_\d{6}_[a-f0-9]{8}\.\w+$/);
});

pm.test("Download URL provided", () => {
    pm.expect(response.download_url).to.include("/files/");
});
```

---

## Running Collection

### Run Entire Collection

1. Click on collection name
2. Click **Run** button
3. Select requests to run
4. Configure:
   - Iterations: 1
   - Delay: 500ms
   - Data file: (optional)
5. Click **Run PDF Converter API v2**

### Run with Newman (CLI)

```bash
# Install Newman
npm install -g newman

# Run collection
newman run PDF_Converter_API.postman_collection.json \
  -e PDF_Converter_API_v2_Local.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export report.html

# Run with data file
newman run PDF_Converter_API.postman_collection.json \
  -e PDF_Converter_API_v2_Local.postman_environment.json \
  -d test_data.json
```

---

## Tips & Best Practices

1. **Use environment variables** for all dynamic values
2. **Add tests to every request** to validate responses
3. **Use pre-request scripts** for token refresh
4. **Organize with folders** for better navigation
5. **Save examples** of successful responses
6. **Use variables for file paths** when testing locally
7. **Create separate environments** for dev/staging/production
8. **Export collections regularly** for version control
9. **Use collection variables** for shared data
10. **Document requests** with descriptions

---

## Troubleshooting

### Token Not Saving
- Check Tests tab has token save script
- Verify environment is selected
- Check Console for errors

### 401 Unauthorized
- Verify access token is set
- Try refreshing token
- Re-login if refresh fails

### File Upload Fails
- Check file size (max 50MB)
- Verify file type is supported
- Ensure Content-Type is multipart/form-data

### Request Timeout
- Increase timeout in Settings
- Check server is running
- Verify network connection

---

For detailed API documentation, see [API_V2_DOCUMENTATION.md](./API_V2_DOCUMENTATION.md)
