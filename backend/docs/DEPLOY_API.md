# Deploy API

Guide for using the v3 deploy endpoints.

---

## Base URL

```text
http://localhost:8000/api/v3
```

---

## Access Rule

These endpoints can be used by `super_user` only.

You must:

1. Login with a super user account
2. Send the access token in the `Authorization` header

Example login:

```bash
TOKEN=$(curl -s -X POST "http://localhost:8000/api/v2/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@local","password":"Admin@12345"}' \
  | jq -r '.access_token')
```

Then use:

```bash
-H "Authorization: Bearer $TOKEN"
```

---

## Endpoints

### Start Backend Deploy

```http
POST /api/v3/live-project-push/backend
```

Example:

```bash
curl -X POST "http://localhost:8000/api/v3/live-project-push/backend" \
  -H "Authorization: Bearer $TOKEN"
```

Success response:

```json
{
  "status": "started",
  "log_file": "/path/to/deploy_backend.log",
  "stdout": "",
  "stderr": ""
}
```

### Start Frontend Deploy

```http
POST /api/v3/live-project-push/frontend
```

Example:

```bash
curl -X POST "http://localhost:8000/api/v3/live-project-push/frontend" \
  -H "Authorization: Bearer $TOKEN"
```

Success response:

```json
{
  "status": "started",
  "log_file": "/path/to/deploy_frontend.log",
  "stdout": "",
  "stderr": ""
}
```

### Check Deploy Status

```http
GET /api/v3/live-project-push/status
```

Example:

```bash
curl -X GET "http://localhost:8000/api/v3/live-project-push/status" \
  -H "Authorization: Bearer $TOKEN"
```

Example response:

```json
{
  "backend": {
    "status": "success",
    "log_file": "/path/to/deploy_backend.log",
    "last_output": "Deployment completed successfully"
  },
  "frontend": {
    "status": "running",
    "log_file": "/path/to/deploy_frontend.log",
    "last_output": "Installing dependencies..."
  }
}
```

---

## Status Values

Possible status values:

- `not_started`: log file does not exist yet
- `started`: log file exists but no output yet
- `running`: log file has output and no success/failure marker found
- `success`: log contains `deployment completed successfully` or `deploy_success`
- `failed`: log contains `error`, `failed`, or `traceback`

---

## Environment Variables

You can configure custom script and log paths with these environment variables:

### Script Paths

- `DEPLOY_BACKEND_SCRIPT_PATH`
- `DEPLOY_FRONTEND_SCRIPT_PATH`

Default values:

```python
PROJECT_ROOT / "deploy_backend.sh"
PROJECT_ROOT / "deploy_frontend.sh"
```

### Log Paths

- `DEPLOY_BACKEND_LOG_PATH`
- `DEPLOY_FRONTEND_LOG_PATH`

Default values:

```python
PROJECT_ROOT / "deploy_backend.log"
PROJECT_ROOT / "deploy_frontend.log"
```

---

## Required Files

Make sure these files exist in the project root, unless you override them with env vars:

```text
deploy_backend.sh
deploy_frontend.sh
```

Example:

```bash
chmod +x deploy_backend.sh
chmod +x deploy_frontend.sh
```

---

## How It Works

- The API starts the script in background using `nohup`
- Output is written to the deploy log file
- API returns immediately with `status: started`
- Use the status endpoint to check progress

---

## Common Errors

### 401 Unauthorized

Your token is missing or invalid.

### 403 Forbidden

Your user is not a `super_user`.

Example:

```json
{
  "detail": "Forbidden"
}
```

### 404 Not Found

Deploy script file was not found.

Example:

```json
{
  "detail": "Deploy script not found: /path/to/deploy_backend.sh"
}
```

### 500 Internal Server Error

The script could not be started.

Example:

```json
{
  "detail": {
    "status": "failed_to_start",
    "exit_code": 1,
    "stdout": "",
    "stderr": "some error message"
  }
}
```

---

## Full Example Flow

### 1. Login

```bash
TOKEN=$(curl -s -X POST "http://localhost:8000/api/v2/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@local","password":"Admin@12345"}' \
  | jq -r '.access_token')
```

### 2. Start backend deploy

```bash
curl -X POST "http://localhost:8000/api/v3/live-project-push/backend" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Start frontend deploy

```bash
curl -X POST "http://localhost:8000/api/v3/live-project-push/frontend" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Check status

```bash
curl -X GET "http://localhost:8000/api/v3/live-project-push/status" \
  -H "Authorization: Bearer $TOKEN"
```
