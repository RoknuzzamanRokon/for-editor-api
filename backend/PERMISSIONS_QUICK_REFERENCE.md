# Conversion Permissions - Quick Reference

## TL;DR

Users need explicit permissions to perform conversions. Admins can grant/revoke these permissions.

## Command Line Tool

```bash
# List all users
pipenv run python manage_permissions.py list-users

# Show user's permissions
pipenv run python manage_permissions.py show 5

# Grant specific permission
pipenv run python manage_permissions.py grant 5 pdf_to_docs

# Revoke specific permission
pipenv run python manage_permissions.py revoke 5 pdf_to_excel

# Grant all permissions
pipenv run python manage_permissions.py grant-all 5

# Revoke all permissions
pipenv run python manage_permissions.py revoke-all 5
```

## API Endpoints

```bash
# Get available actions
GET /api/v3/permissions/actions

# Get user permissions
GET /api/v3/permissions/users/{user_id}/permissions

# Update multiple permissions
PUT /api/v3/permissions/users/{user_id}/permissions
Body: {"permissions": [{"action": "pdf_to_docs", "is_allowed": true}]}

# Update single permission
PATCH /api/v3/permissions/users/{user_id}/permissions/{action}
Body: {"is_allowed": true}
```

## Available Actions

| Action | Description |
|--------|-------------|
| `pdf_to_docs` | PDF → Word |
| `pdf_to_excel` | PDF → Excel |
| `docx_to_pdf` | Word → PDF |
| `excel_to_pdf` | Excel → PDF |
| `image_to_pdf` | Image → PDF |
| `pdf_page_remove` | Remove PDF pages |

## User Roles

| Role | Behavior |
|------|----------|
| `super_user` | ✅ All permissions (bypass checks) |
| `admin_user` | ⚙️ Needs explicit permissions |
| `general_user` | ⚙️ Needs explicit permissions |
| `demo_user` | ❌ Read-only (no conversions) |

## Permission Logic

```
super_user → Always allowed
demo_user → Always denied
Others → Check database:
  - Record exists + is_allowed=true → Allowed
  - Record exists + is_allowed=false → Denied
  - No record → Denied (default deny)
```

## Quick Examples

### Grant PDF to Word permission
```bash
# CLI
pipenv run python manage_permissions.py grant 5 pdf_to_docs

# API
curl -X PATCH "http://localhost:8000/api/v3/permissions/users/5/permissions/pdf_to_docs" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_allowed": true}'
```

### Setup new user with all permissions
```bash
# CLI
pipenv run python manage_permissions.py grant-all 5

# API
curl -X PUT "http://localhost:8000/api/v3/permissions/users/5/permissions" \
  -H "Authorization: Bearer TOKEN" \
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

### Check user permissions
```bash
# CLI
pipenv run python manage_permissions.py show 5

# API
curl -X GET "http://localhost:8000/api/v3/permissions/users/5/permissions" \
  -H "Authorization: Bearer TOKEN"
```

## Common Scenarios

### New User Setup
1. Create user (default: general_user, no permissions)
2. Grant needed permissions: `grant-all 5` or grant individually
3. User can now perform conversions

### Restrict User
1. Revoke specific permissions: `revoke 5 pdf_to_excel`
2. Or revoke all: `revoke-all 5`

### Trial Account
1. Create user with demo_user role
2. They can view but not convert

## Files

- `CONVERSION_PERMISSIONS_GUIDE.md` - Full documentation
- `PERMISSION_FLOW.md` - Visual flow diagrams
- `manage_permissions.py` - CLI management tool
- `backend/core/permissions.py` - Permission logic
- `backend/api/v3/endpoints/permissions.py` - API endpoints

## Database Table

```sql
user_conversion_permissions
├── user_id (FK → users.id)
├── action (e.g., "pdf_to_docs")
├── is_allowed (true/false)
├── created_by (FK → users.id)
├── updated_by (FK → users.id)
└── UNIQUE(user_id, action)
```

## Testing

```bash
# 1. Create test user
# 2. Try conversion → Should fail (no permission)
# 3. Grant permission
# 4. Try conversion → Should succeed
# 5. Revoke permission
# 6. Try conversion → Should fail
```

## Need Help?

See the full guides:
- `CONVERSION_PERMISSIONS_GUIDE.md` - Complete documentation
- `PERMISSION_FLOW.md` - Visual diagrams and examples
