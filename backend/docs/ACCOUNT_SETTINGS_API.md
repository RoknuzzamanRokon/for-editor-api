# Account Settings API

This guide covers the new authenticated account settings endpoints:

- `GET /api/v2/auth/settings`
- `PATCH /api/v2/auth/settings/profile`
- `PATCH /api/v2/auth/settings/preferences`
- `POST /api/v2/auth/settings/change-password`

Base URL examples below use:

```text
http://127.0.0.1:8000
```

All endpoints require:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

## 1. Get Current Settings

### Endpoint

```http
GET /api/v2/auth/settings
```

### cURL

```bash
curl -X GET "http://127.0.0.1:8000/api/v2/auth/settings" \
  -H "Authorization: Bearer <access_token>"
```

### Example response

```json
{
  "identity": {
    "id": 4,
    "email": "user@example.com",
    "username": "Ron - N",
    "role": "admin_user",
    "created_at": "2026-04-14T05:12:18",
    "last_login": "2026-04-14T08:20:01"
  },
  "preferences": {
    "theme": "dark",
    "security_alerts_enabled": true,
    "login_notifications_enabled": true,
    "profile_private": false
  }
}
```

## 2. Update Profile

Use this endpoint only for profile identity fields in phase 1.

### Endpoint

```http
PATCH /api/v2/auth/settings/profile
```

### Supported body

```json
{
  "username": "Ron - N"
}
```

### Important

`theme`, `profile_private`, `security_alerts_enabled`, and `login_notifications_enabled` do not belong in this request body. Those fields must be sent to `PATCH /api/v2/auth/settings/preferences`.

### cURL

```bash
curl -X PATCH "http://127.0.0.1:8000/api/v2/auth/settings/profile" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Ron - N"
  }'
```

### Python `requests`

```python
import requests
import json

url = "http://127.0.0.1:8000/api/v2/auth/settings/profile"

payload = json.dumps({
  "username": "Ron - N"
})

headers = {
  "Authorization": "Bearer <access_token>",
  "Content-Type": "application/json"
}

response = requests.patch(url, headers=headers, data=payload)
print(response.status_code)
print(response.text)
```

## 3. Update Preferences

Use this endpoint for theme and security/privacy settings.

### Endpoint

```http
PATCH /api/v2/auth/settings/preferences
```

### Supported fields

```json
{
  "theme": "dark",
  "security_alerts_enabled": true,
  "login_notifications_enabled": true,
  "profile_private": true
}
```

You can send only the fields you want to change.

### cURL

```bash
curl -X PATCH "http://127.0.0.1:8000/api/v2/auth/settings/preferences" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "dark",
    "profile_private": true
  }'
```

### Python `requests`

```python
import requests
import json

url = "http://127.0.0.1:8000/api/v2/auth/settings/preferences"

payload = json.dumps({
  "theme": "dark",
  "profile_private": True,
  "security_alerts_enabled": True,
  "login_notifications_enabled": True
})

headers = {
  "Authorization": "Bearer <access_token>",
  "Content-Type": "application/json"
}

response = requests.patch(url, headers=headers, data=payload)
print(response.status_code)
print(response.text)
```

## 4. Change Password

### Endpoint

```http
POST /api/v2/auth/settings/change-password
```

### Request body

```json
{
  "current_password": "OldPassword123",
  "new_password": "NewPassword123"
}
```

### Rules

- `current_password` must match the existing password
- `new_password` must be at least 8 characters
- `new_password` must be different from the current password

### cURL

```bash
curl -X POST "http://127.0.0.1:8000/api/v2/auth/settings/change-password" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "OldPassword123",
    "new_password": "NewPassword123"
  }'
```

### Python `requests`

```python
import requests
import json

url = "http://127.0.0.1:8000/api/v2/auth/settings/change-password"

payload = json.dumps({
  "current_password": "OldPassword123",
  "new_password": "NewPassword123"
})

headers = {
  "Authorization": "Bearer <access_token>",
  "Content-Type": "application/json"
}

response = requests.post(url, headers=headers, data=payload)
print(response.status_code)
print(response.text)
```

## 5. Correct Usage for Your Example

Your original payload mixed profile and preference fields together:

```json
{
  "username": "Ron - N",
  "theme": "dark",
  "profile_private": true
}
```

That should be split into two requests.

### Request 1: profile

```python
import requests
import json

headers = {
  "Authorization": "Bearer <access_token>",
  "Content-Type": "application/json"
}

profile_response = requests.patch(
  "http://127.0.0.1:8000/api/v2/auth/settings/profile",
  headers=headers,
  data=json.dumps({
    "username": "Ron - N"
  })
)

print(profile_response.status_code)
print(profile_response.text)
```

### Request 2: preferences

```python
import requests
import json

headers = {
  "Authorization": "Bearer <access_token>",
  "Content-Type": "application/json"
}

preferences_response = requests.patch(
  "http://127.0.0.1:8000/api/v2/auth/settings/preferences",
  headers=headers,
  data=json.dumps({
    "theme": "dark",
    "profile_private": True
  })
)

print(preferences_response.status_code)
print(preferences_response.text)
```

## 6. Forgot Password

Forgot-password is not implemented in phase 1.

Planned phase-2 flow:

- `POST /api/v2/auth/forgot-password`
- `POST /api/v2/auth/reset-password`
- reset-token storage with expiry
- email delivery integration
