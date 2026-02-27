# Conversion Permissions System - Complete Guide

## Overview

Your application has a granular permission system that controls which conversion actions each user can perform. This allows admins to enable/disable specific conversion features for individual users.

## How It Works

### 1. Permission Model

The `UserConversionPermission` table stores permissions for each user:

```python
class UserConversionPermission:
    user_id: int              # The user who has this permission
    action: str               # The conversion action (e.g., "pdf_to_docs")
    is_allowed: bool          # Whether the action is allowed (True/False)
    created_by: int           # Admin who created this permission
    updated_by: int           # Admin who last updated this permission
    created_at: datetime
    updated_at: datetime
```

### 2. Available Actions

The system supports these conversion actions:

| Action | Description |
|--------|-------------|
| `pdf_to_docs` | PDF to Word conversion |
| `pdf_to_excel` | PDF to Excel conversion |
| `docx_to_pdf` | DOCX to PDF conversion |
| `excel_to_pdf` | Excel to PDF conversion |
| `image_to_pdf` | Image to PDF conversion |
| `pdf_page_remove` | Remove pages from PDF |

### 3. Role-Based Behavior

Different user roles have different permission behaviors:

#### Super User (`super_user`)
- **Bypasses all permission checks**
- Can perform any conversion without restrictions
- Cannot have their permissions modified

#### Admin User (`admin_user`)
- Must have explicit permissions for each action
- Can manage permissions for `general_user` and `demo_user`
- Cannot manage permissions for other admins or super users

#### General User (`general_user`)
- Must have explicit permissions for each action
- Permissions can be managed by admins and super users
- Default role for new users

#### Demo User (`demo_user`)
- **Read-only access** - cannot perform any conversions
- Always blocked regardless of permissions
- Used for demonstration/preview purposes

## API Endpoints

### 1. Get Available Actions

**Endpoint:** `GET /api/v3/permissions/actions`

**Authentication:** Required (any authenticated user)

**Response:**
```json
[
  {
    "action": "pdf_to_docs",
    "label": "PDF to Word"
  },
  {
    "action": "pdf_to_excel",
    "label": "PDF to Excel"
  }
  // ... more actions
]
```

### 2. Get User Permissions

**Endpoint:** `GET /api/v3/permissions/users/{user_id}/permissions`

**Authentication:** Required (admin_user or super_user)

**Response:**
```json
{
  "user_id": 5,
  "permissions": [
    {
      "id": 1,
      "user_id": 5,
      "action": "pdf_to_docs",
      "is_allowed": true,
      "created_at": "2026-02-27T10:00:00",
      "updated_at": "2026-02-27T10:00:00"
    },
    {
      "id": 2,
      "user_id": 5,
      "action": "pdf_to_excel",
      "is_allowed": false,
      "created_at": "2026-02-27T10:00:00",
      "updated_at": "2026-02-27T10:00:00"
    }
  ]
}
```

### 3. Update Multiple Permissions (Bulk Update)

**Endpoint:** `PUT /api/v3/permissions/users/{user_id}/permissions`

**Authentication:** Required (admin_user or super_user)

**Request Body:**
```json
{
  "permissions": [
    {
      "action": "pdf_to_docs",
      "is_allowed": true
    },
    {
      "action": "pdf_to_excel",
      "is_allowed": true
    },
    {
      "action": "docx_to_pdf",
      "is_allowed": false
    }
  ]
}
```

**Response:** Same as "Get User Permissions"

### 4. Update Single Permission

**Endpoint:** `PATCH /api/v3/permissions/users/{user_id}/permissions/{action}`

**Authentication:** Required (admin_user or super_user)

**Request Body:**
```json
{
  "is_allowed": true
}
```

**Response:** Same as "Get User Permissions"

## Usage Examples

### Example 1: Grant PDF to Word Permission

```bash
curl -X PATCH "http://localhost:8000/api/v3/permissions/users/5/permissions/pdf_to_docs" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_allowed": true}'
```

### Example 2: Revoke Excel to PDF Permission

```bash
curl -X PATCH "http://localhost:8000/api/v3/permissions/users/5/permissions/excel_to_pdf" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_allowed": false}'
```

### Example 3: Set Multiple Permissions at Once

```bash
curl -X PUT "http://localhost:8000/api/v3/permissions/users/5/permissions" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": [
      {"action": "pdf_to_docs", "is_allowed": true},
      {"action": "pdf_to_excel", "is_allowed": true},
      {"action": "docx_to_pdf", "is_allowed": true},
      {"action": "excel_to_pdf", "is_allowed": false},
      {"action": "image_to_pdf", "is_allowed": false},
      {"action": "pdf_page_remove", "is_allowed": true}
    ]
  }'
```

### Example 4: Check User's Permissions

```bash
curl -X GET "http://localhost:8000/api/v3/permissions/users/5/permissions" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## How Permissions Are Checked

When a user tries to perform a conversion, the system checks permissions in this order:

1. **Check if user is super_user**
   - If yes → Allow (bypass all checks)

2. **Check if user is demo_user**
   - If yes → Deny (demo users are read-only)

3. **Query UserConversionPermission table**
   - Look for a record matching `user_id` and `action`
   - If found and `is_allowed = true` → Allow
   - If found and `is_allowed = false` → Deny
   - If not found → Deny

### Code Example

```python
from core.permissions import ensure_permission

# In your conversion endpoint
@router.post("/convert/pdf-to-docs")
def convert_pdf_to_docs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # This will raise an exception if user doesn't have permission
    ensure_permission(db, current_user, "pdf_to_docs")
    
    # Proceed with conversion...
```

## Database Schema

```sql
CREATE TABLE user_conversion_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action VARCHAR(64) NOT NULL,
    is_allowed BOOLEAN NOT NULL DEFAULT TRUE,
    created_by INT,
    updated_by INT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    
    UNIQUE KEY uq_user_conversion_permissions (user_id, action)
);
```

## Common Scenarios

### Scenario 1: New User Setup

When a new general user is created, they have NO permissions by default. An admin must explicitly grant permissions:

```python
# Admin grants all permissions to new user
PUT /api/v3/permissions/users/10/permissions
{
  "permissions": [
    {"action": "pdf_to_docs", "is_allowed": true},
    {"action": "pdf_to_excel", "is_allowed": true},
    {"action": "docx_to_pdf", "is_allowed": true},
    {"action": "excel_to_pdf", "is_allowed": true},
    {"action": "image_to_pdf", "is_allowed": true},
    {"action": "pdf_page_remove", "is_allowed": true}
  ]
}
```

### Scenario 2: Restrict User to Specific Conversions

Grant only PDF-related conversions:

```python
PUT /api/v3/permissions/users/10/permissions
{
  "permissions": [
    {"action": "pdf_to_docs", "is_allowed": true},
    {"action": "pdf_to_excel", "is_allowed": true},
    {"action": "docx_to_pdf", "is_allowed": false},
    {"action": "excel_to_pdf", "is_allowed": false},
    {"action": "image_to_pdf", "is_allowed": false},
    {"action": "pdf_page_remove", "is_allowed": true}
  ]
}
```

### Scenario 3: Temporarily Disable User Access

Revoke all permissions:

```python
PUT /api/v3/permissions/users/10/permissions
{
  "permissions": [
    {"action": "pdf_to_docs", "is_allowed": false},
    {"action": "pdf_to_excel", "is_allowed": false},
    {"action": "docx_to_pdf", "is_allowed": false},
    {"action": "excel_to_pdf", "is_allowed": false},
    {"action": "image_to_pdf", "is_allowed": false},
    {"action": "pdf_page_remove", "is_allowed": false}
  ]
}
```

## Error Handling

### Permission Denied Error

When a user tries to perform a conversion they don't have permission for:

```python
# Raises ConversionNotPermittedError
# Returns HTTP 403 Forbidden
{
  "detail": "Conversion not permitted"
}
```

### Demo User Error

When a demo user tries to perform any conversion:

```python
# Returns HTTP 403 Forbidden
{
  "detail": "Demo user is read-only"
}
```

### Invalid Action Error

When trying to set permission for an invalid action:

```python
# Returns HTTP 400 Bad Request
{
  "detail": "Invalid action"
}
```

## Best Practices

1. **Default Deny**: Users have no permissions by default - explicitly grant what they need

2. **Use Bulk Updates**: When setting up a new user, use PUT to set all permissions at once

3. **Audit Trail**: The system tracks who created/updated permissions via `created_by` and `updated_by`

4. **Super Users**: Use super_user role sparingly - they bypass all permission checks

5. **Demo Users**: Use demo_user role for trial accounts or demonstrations

6. **Regular Reviews**: Periodically review user permissions to ensure they're still appropriate

## Testing Permissions

You can test the permission system using Postman or curl:

1. Create a test user (general_user role)
2. Try to perform a conversion → Should fail (no permissions)
3. Grant permission for that action
4. Try again → Should succeed
5. Revoke permission
6. Try again → Should fail

## Summary

The permission system provides fine-grained control over conversion features:

- ✅ Per-user, per-action permissions
- ✅ Role-based access control
- ✅ Audit trail (who granted/revoked)
- ✅ Bulk and individual permission management
- ✅ Super user bypass for admins
- ✅ Demo user read-only mode

This allows you to create different user tiers, trial accounts, and custom access levels for your PDF conversion service.
