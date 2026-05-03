# Email Verification Registration Implementation

## Overview
Implemented a 4-step registration process with email verification for the ConvertPro API application.

## Registration Flow

### Step 1: Email Entry
- User enters their email address
- Basic email format validation

### Step 2: Username & Password
- User creates a username
- User creates and confirms password (minimum 6 characters)
- Password visibility toggle

### Step 3: API Selection
- User selects up to 3 APIs from available options:
  - PDF to Word
  - PDF to Excel
  - DOCX to PDF
  - Excel to PDF
  - Image to PDF
  - Remove Background
  - Remove PDF Pages
- After selection, verification code is sent to email

### Step 4: Email Verification
- User enters 5-character verification code sent to their email
- Code format: Uppercase letters and digits (e.g., "A3B9K")
- Option to resend verification code
- Code expires in 10 minutes
- Maximum 5 failed attempts per session

### Step 5: Terms & Conditions
- Review account details:
  - Account type: Demo user
  - Trial period: 8 days
  - Starting points: 33
  - Selected APIs
- Accept terms to complete registration

## Backend Changes

### New Endpoints

#### POST /api/v2/auth/register
- Creates verification session
- Sends verification email
- Returns: `VerificationPendingResponse`

#### POST /api/v2/auth/verify-email
- Validates verification code
- Creates user account
- Returns: `TokenPair` (access & refresh tokens)

#### POST /api/v2/auth/resend-verification
- Resends verification code to email
- Invalidates previous codes
- Returns: `VerificationPendingResponse`

### New Models

#### EmailVerificationRequest
```python
{
  "email": "user@example.com",
  "code": "A3B9K"
}
```

#### ResendVerificationRequest
```python
{
  "email": "user@example.com"
}
```

#### VerificationPendingResponse
```python
{
  "message": "Verification code sent to your email",
  "email": "user@example.com",
  "expires_in_minutes": 10
}
```

### Database

#### email_verification_sessions Table
- `id`: Primary key
- `email`: User email address
- `verification_code`: 5-character code
- `registration_data_json`: Stored registration data
- `expires_at`: Expiration timestamp (10 minutes)
- `created_at`: Creation timestamp
- `is_used`: Whether code has been used
- `failed_attempts`: Number of failed verification attempts

**Indexes:**
- `ix_email_verification_sessions_email`
- `ix_email_verification_sessions_verification_code`
- `ix_email_verification_sessions_expires_at`
- `ix_email_active` (composite: email, is_used, expires_at)

### Verification Service

#### generate_verification_code()
- Generates cryptographically secure 5-character code
- Contains at least one letter and one digit
- Uses uppercase letters (A-Z) and digits (0-9)

#### create_verification_session()
- Invalidates existing active sessions for email
- Generates new verification code
- Stores registration data as JSON
- Sends verification email
- Rolls back if email sending fails

#### validate_verification_code()
- Validates code format
- Checks expiration
- Checks if already used
- Enforces rate limiting (5 attempts max)
- Returns validation result and session

#### complete_registration()
- Creates user account from verified session
- Marks session as used
- Returns created user

## Frontend Changes

### Updated Registration Page
- Changed from 3-step to 5-step process
- Added email verification step with code input
- Added resend code functionality
- Improved step indicators with completion states
- Better error handling and user feedback

### New State Variables
- `verificationCode`: Stores the 5-character code
- `username`: Stores username (now separate from email)
- `resendLoading`: Loading state for resend button

### User Experience
- Clear step progression with visual indicators
- Inline validation and error messages
- Success messages for code sending
- Ability to go back to previous steps
- Disabled states during loading

## Migration

Run the migration to create the email_verification_sessions table:

```bash
cd backend
alembic upgrade head
```

Migration file: `h5i6j7k8l9m0_add_email_verification_sessions_table.py`

## Security Features

1. **Cryptographic Code Generation**: Uses `secrets` module for unpredictable codes
2. **Rate Limiting**: Maximum 5 failed attempts per session
3. **Time-Limited Codes**: 10-minute expiration
4. **Session Invalidation**: Old codes invalidated when new one is requested
5. **One-Time Use**: Codes can only be used once
6. **Transaction Safety**: Email sending failure rolls back session creation

## Testing

### Manual Testing Steps

1. Navigate to `/register`
2. Enter email address → Click "Next"
3. Enter username and password → Click "Next"
4. Select 1-3 APIs → Click "Send verification code"
5. Check email for verification code
6. Enter code → Click "Next"
7. Review terms → Accept → Click "Create account"
8. Should redirect to login with prefilled credentials

### Test Cases

- Valid registration flow
- Invalid email format
- Password mismatch
- Weak password (< 6 characters)
- No APIs selected
- Invalid verification code
- Expired verification code
- Too many failed attempts
- Resend verification code
- Email already registered

## Notes

- Email service must be configured for verification emails to work
- Verification codes are case-insensitive (automatically converted to uppercase)
- Demo users get 8 days trial period and 33 starting points
- Users can select 1-3 APIs during registration
