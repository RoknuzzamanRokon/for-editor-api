# Email Validation Configuration

## Overview

The API uses lenient email validation to support both production and local development environments.

## Changes Made

### Previous Behavior
- Used Pydantic's strict `EmailStr` validation
- Required fully qualified domain names (e.g., `user@example.com`)
- Rejected local emails like `admin@local`

### Current Behavior
- Uses `str` type with custom validator
- Accepts any email with `@` symbol
- Supports local development emails (e.g., `admin@local`, `test@localhost`)
- Still validates basic email format

## Affected Models

### `LoginRequest`
```python
class LoginRequest(BaseModel):
    email: str  # Changed from EmailStr
    password: str = Field(min_length=6)
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        if not v or '@' not in v:
            raise ValueError("Invalid email format")
        return v
```

### `UserOut`
```python
class UserOut(BaseModel):
    id: int
    email: str  # Changed from EmailStr
    username: Optional[str] = None
    role: RoleEnum
    is_active: bool
    created_at: datetime
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        if not v or '@' not in v:
            raise ValueError("Invalid email format")
        return v
```

### `UserCreate`
Still uses `EmailStr` for stricter validation on user creation to encourage proper email formats.

## Valid Email Examples

### Accepted Formats
✅ `user@example.com` - Standard email  
✅ `admin@local` - Local development  
✅ `test@localhost` - Local testing  
✅ `user@192.168.1.1` - IP-based email  
✅ `name+tag@domain.com` - Email with plus sign  

### Rejected Formats
❌ `userexample.com` - Missing @ symbol  
❌ `@example.com` - Missing local part  
❌ `user@` - Missing domain  
❌ `` (empty string) - Empty email  

## Production Recommendations

For production environments, consider:

1. **Use proper domain emails** - Always use fully qualified domain names
2. **Update default admin email** - Change from `admin@local` to `admin@yourdomain.com`
3. **Add additional validation** - Implement domain whitelist if needed
4. **Email verification** - Add email verification flow for new users

## Configuration

Update your `.env` file for production:

```env
# Development
DEFAULT_ADMIN_EMAIL=admin@local
DEFAULT_ADMIN_PASSWORD=Admin@12345

# Production (recommended)
DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
DEFAULT_ADMIN_PASSWORD=SecurePassword123!
```

## Migration Impact

### Existing Users
- No migration needed
- All existing emails remain valid
- Local emails like `admin@local` continue to work

### New Users
- Can use any email format with `@` symbol
- Recommended to use proper domain emails in production

## Security Considerations

1. **Email validation is lenient** - Does not verify domain existence
2. **No email verification** - Users are not required to verify email ownership
3. **Consider adding:**
   - Email verification flow
   - Domain whitelist for production
   - Rate limiting on login attempts
   - CAPTCHA for registration

## Testing

Test with various email formats:

```bash
# Valid local email
curl -X POST "http://localhost:8000/api/v2/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@local","password":"password"}'

# Valid production email
curl -X POST "http://localhost:8000/api/v2/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Invalid email (should fail)
curl -X POST "http://localhost:8000/api/v2/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","password":"password"}'
```

## Future Enhancements

Consider implementing:

1. **Strict mode toggle** - Environment variable to enable strict email validation
2. **Domain whitelist** - Allow only specific domains in production
3. **Email verification** - Send verification emails to new users
4. **Custom validators** - Different validation rules per environment

## Related Files

- `backend/models/auth.py` - Email validation models
- `backend/core/config.py` - Default admin email configuration
- `backend/.env` - Environment-specific email settings

---

**Last Updated:** February 23, 2026  
**Issue:** Fixed ResponseValidationError for local development emails
