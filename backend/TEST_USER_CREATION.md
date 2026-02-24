# User Creation API Test Guide

This guide shows how to test the user creation API endpoint.

---

## Quick Test with Python Script

### Run the Test Script

```bash
cd backend
python test_create_user_api.py
```

This script will:
1. Login as super_user
2. List existing users
3. Create a general_user
4. Create a demo_user
5. Create an admin_user
6. List all users again
7. Test error cases (duplicate email, short password)

---

## Manual Testing with cURL

### 1. Login to Get Access Token

```bash
curl -X POST "http://127.0.0.1:8000/api/v2/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rokon123rokon@gmail.com",
    "password": "rokon123rokon"
  }'
```

**Save the access_token from the response!**

---

### 2. Create a General User

```bash
curl -X POST "http://127.0.0.1:8000/api/v2/users" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123",
    "username": "testuser",
    "role": "general_user"
  }'
```

**Expected Response:**
```json
{
  "id": 3,
  "email": "testuser@example.com",
  "username": "testuser",
  "role": "general_user",
  "is_active": true,
  "created_at": "2026-02-23T16:45:00"
}
```

---

### 3. Create a Demo User

```bash
curl -X POST "http://127.0.0.1:8000/api/v2/users" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "demo123456",
    "username": "demouser",
    "role": "demo_user"
  }'
```

---

### 4. Create an Admin User

```bash
curl -X POST "http://127.0.0.1:8000/api/v2/users" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123456",
    "username": "adminuser",
    "role": "admin_user"
  }'
```

---

### 5. List All Users

```bash
curl -X GET "http://127.0.0.1:8000/api/v2/users" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "email": "admin@local",
    "username": null,
    "role": "admin_user",
    "is_active": true,
    "created_at": "2026-02-23T01:21:03"
  },
  {
    "id": 2,
    "email": "rokon123rokon@gmail.com",
    "username": "rokon123rokon",
    "role": "super_user",
    "is_active": true,
    "created_at": "2026-02-23T16:29:30"
  },
  {
    "id": 3,
    "email": "testuser@example.com",
    "username": "testuser",
    "role": "general_user",
    "is_active": true,
    "created_at": "2026-02-23T16:45:00"
  }
]
```

---

## Python Example

### Simple Example

```python
import requests

# Configuration
BASE_URL = "http://127.0.0.1:8000/api/v2"
ADMIN_EMAIL = "rokon123rokon@gmail.com"
ADMIN_PASSWORD = "rokon123rokon"

# 1. Login
response = requests.post(
    f"{BASE_URL}/auth/login",
    json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
)
access_token = response.json()["access_token"]
print(f"✅ Logged in successfully")

# 2. Create user
headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}
payload = {
    "email": "newuser@example.com",
    "password": "password123",
    "username": "newuser",
    "role": "general_user"
}

response = requests.post(
    f"{BASE_URL}/users",
    headers=headers,
    json=payload
)

if response.status_code == 200:
    user = response.json()
    print(f"✅ User created:")
    print(f"   ID: {user['id']}")
    print(f"   Email: {user['email']}")
    print(f"   Username: {user['username']}")
    print(f"   Role: {user['role']}")
else:
    print(f"❌ Error: {response.json()['detail']}")
```

---

## Testing Error Cases

### 1. Duplicate Email

```bash
# Try to create user with existing email
curl -X POST "http://127.0.0.1:8000/api/v2/users" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123",
    "username": "testuser2",
    "role": "general_user"
  }'
```

**Expected Error:**
```json
{
  "detail": "Email already registered"
}
```

---

### 2. Short Password

```bash
# Try to create user with password < 6 characters
curl -X POST "http://127.0.0.1:8000/api/v2/users" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "shortpass@example.com",
    "password": "12345",
    "username": "shortpass",
    "role": "general_user"
  }'
```

**Expected Error:**
```json
{
  "detail": [
    {
      "loc": ["body", "password"],
      "msg": "ensure this value has at least 6 characters",
      "type": "value_error.any_str.min_length"
    }
  ]
}
```

---

### 3. Admin Creating Super User (Should Fail)

```bash
# Login as admin_user (not super_user)
# Then try to create super_user
curl -X POST "http://127.0.0.1:8000/api/v2/users" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superuser@example.com",
    "password": "password123",
    "username": "superuser",
    "role": "super_user"
  }'
```

**Expected Error:**
```json
{
  "detail": "Admin cannot create super_user"
}
```

---

### 4. Invalid Token

```bash
curl -X POST "http://127.0.0.1:8000/api/v2/users" \
  -H "Authorization: Bearer INVALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "role": "general_user"
  }'
```

**Expected Error:**
```json
{
  "detail": "Invalid token"
}
```

---

## Role Creation Matrix

| Creator Role | Can Create |
|--------------|------------|
| super_user | super_user, admin_user, general_user, demo_user |
| admin_user | general_user, demo_user |
| general_user | ❌ Cannot create users |
| demo_user | ❌ Cannot create users |

---

## Field Validation Rules

| Field | Required | Validation |
|-------|----------|------------|
| email | ✅ Yes | Must contain @ symbol, must be unique |
| password | ✅ Yes | Minimum 6 characters |
| username | ❌ No | Must be unique if provided |
| role | ❌ No | Defaults to `general_user` if not specified |

---

## Common Issues

### Issue: 401 Unauthorized
**Solution:** Check that your access token is valid and not expired. Re-login if needed.

### Issue: 403 Forbidden
**Solution:** Check that your user role has permission to create users. Only `super_user` and `admin_user` can create users.

### Issue: 400 Email already registered
**Solution:** Use a different email address. Each email must be unique.

### Issue: 422 Validation Error
**Solution:** Check that all required fields are provided and meet validation requirements (e.g., password minimum 6 characters).

---

## Next Steps

After creating users, you can:

1. **Update user roles** (super_user only):
   ```bash
   curl -X PATCH "http://127.0.0.1:8000/api/v2/users/{user_id}/role" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"role": "admin_user"}'
   ```

2. **Disable users** (super_user or admin_user):
   ```bash
   curl -X PATCH "http://127.0.0.1:8000/api/v2/users/{user_id}/disable" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

3. **Test login with new user**:
   ```bash
   curl -X POST "http://127.0.0.1:8000/api/v2/auth/login" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testuser@example.com",
       "password": "password123"
     }'
   ```

---

## Documentation

For complete API documentation, see:
- [API_V2_DOCUMENTATION.md](./docs/API_V2_DOCUMENTATION.md)
- [API_V2_QUICK_REFERENCE.md](./docs/API_V2_QUICK_REFERENCE.md)
- [API_V2_POSTMAN_GUIDE.md](./docs/API_V2_POSTMAN_GUIDE.md)

---

**Last Updated:** February 23, 2026
