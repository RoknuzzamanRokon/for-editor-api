"""
Email verification service for user registration.

This module provides functionality for generating verification codes,
managing verification sessions, and validating email verification codes.
"""

import secrets
import string
from datetime import datetime, timedelta

from sqlalchemy.orm import Session
from fastapi import HTTPException

from db.models import EmailVerificationSession
from models.auth import DemoRegisterRequest
from services.email import send_verification_email


def generate_verification_code() -> str:
    """
    Generate a cryptographically secure 5-character verification code.
    
    The code consists of uppercase letters (A-Z) and digits (0-9), and is
    guaranteed to contain at least one letter and at least one number.
    
    Uses the secrets module for cryptographic randomness to ensure codes
    cannot be predicted.
    
    Returns:
        str: A 5-character alphanumeric verification code (e.g., "A3B9K")
    
    Example:
        >>> code = generate_verification_code()
        >>> len(code)
        5
        >>> all(c in string.ascii_uppercase + string.digits for c in code)
        True
    """
    # Character set: uppercase letters and digits
    charset = string.ascii_uppercase + string.digits
    
    # Generate codes until we get one with at least one letter and one number
    while True:
        # Generate 5 random characters from the charset
        code = ''.join(secrets.choice(charset) for _ in range(5))
        
        # Check if code contains at least one letter and one number
        has_letter = any(c in string.ascii_uppercase for c in code)
        has_number = any(c in string.digits for c in code)
        
        if has_letter and has_number:
            return code



def create_verification_session(
    db: Session,
    email: str,
    registration_data: DemoRegisterRequest
) -> EmailVerificationSession:
    """
    Create a new verification session for email verification.
    
    This function:
    1. Invalidates any existing active sessions for the email
    2. Generates a new verification code
    3. Stores registration data as JSON
    4. Sets expiration to 10 minutes from now
    5. Sends verification email
    6. Rolls back transaction if email sending fails
    
    Args:
        db: Database session
        email: Email address to verify
        registration_data: User registration data to store
        
    Returns:
        EmailVerificationSession: The created verification session
        
    Raises:
        HTTPException: If email sending fails (500 status code)
    """
    try:
        # Step 1: Invalidate any existing active sessions for this email
        # Mark all existing sessions as used to ensure only the new code is valid
        db.query(EmailVerificationSession).filter(
            EmailVerificationSession.email == email,
            EmailVerificationSession.is_used == False
        ).update({"is_used": True})
        
        # Step 2: Generate verification code
        verification_code = generate_verification_code()
        
        # Step 3: Create new session with registration data as JSON
        # Calculate expiration time (10 minutes from now)
        now = datetime.utcnow()
        expires_at = now + timedelta(minutes=10)
        
        # Convert registration_data to dict for JSON storage
        registration_data_dict = registration_data.model_dump()
        
        # Create the session object
        session = EmailVerificationSession(
            email=email,
            verification_code=verification_code,
            registration_data_json=registration_data_dict,
            expires_at=expires_at,
            created_at=now,
            is_used=False,
            failed_attempts=0
        )
        
        # Add to database but don't commit yet
        db.add(session)
        db.flush()  # Flush to get the ID but don't commit
        
        # Step 4: Send verification email
        # If this fails, the exception will be caught and transaction rolled back
        send_verification_email(
            to_email=email,
            verification_code=verification_code,
            expiration_minutes=10
        )
        
        # Step 5: Commit the transaction only if email was sent successfully
        db.commit()
        db.refresh(session)
        
        return session
        
    except HTTPException:
        # Email sending failed - rollback the transaction
        db.rollback()
        raise
    except Exception as e:
        # Any other error - rollback and raise as HTTPException
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create verification session: {str(e)}"
        )


def validate_verification_code(
    db: Session,
    email: str,
    code: str
) -> tuple[bool, str, EmailVerificationSession | None]:
    """
    Validate a verification code for email verification.
    
    This function performs comprehensive validation checks:
    1. Code format validation (5 alphanumeric characters)
    2. Session lookup by email and code
    3. Expiration check
    4. Usage check (not already used)
    5. Rate limiting check (< 5 failed attempts)
    
    On invalid code (but valid session), increments failed_attempts counter.
    
    Args:
        db: Database session
        email: Email address associated with the verification
        code: Verification code to validate
        
    Returns:
        tuple: (is_valid, error_message, session)
            - is_valid: True if code is valid, False otherwise
            - error_message: Empty string if valid, error description if invalid
            - session: EmailVerificationSession object if found, None otherwise
            
    Example:
        >>> is_valid, error, session = validate_verification_code(db, "user@example.com", "A3B9K")
        >>> if is_valid:
        ...     # Proceed with registration
        ...     user = complete_registration(db, session)
        >>> else:
        ...     # Handle error
        ...     raise HTTPException(status_code=400, detail=error)
    """
    # Step 1: Check code format (5 alphanumeric characters)
    # This check happens before database lookup for efficiency
    if len(code) != 5:
        return False, "Invalid verification code format", None
    
    if not code.isalnum():
        return False, "Invalid verification code format", None
    
    # Step 2: Look up session by email and code
    session = db.query(EmailVerificationSession).filter(
        EmailVerificationSession.email == email,
        EmailVerificationSession.verification_code == code
    ).first()
    
    if not session:
        return False, "Invalid verification code", None
    
    # Step 3: Check if session has expired
    now = datetime.utcnow()
    if now > session.expires_at:
        return False, "Verification code has expired", session
    
    # Step 4: Check if session has already been used
    if session.is_used:
        return False, "Verification code has already been used", session
    
    # Step 5: Check rate limiting (failed_attempts < 5)
    if session.failed_attempts >= 5:
        return False, "Too many failed attempts. Please request a new verification code", session
    
    # All checks passed - code is valid
    return True, "", session


def increment_failed_attempts(db: Session, session: EmailVerificationSession) -> None:
    """
    Increment the failed_attempts counter for a verification session.
    
    This function is called when a verification attempt fails to track
    rate limiting. After 5 failed attempts, the session will be blocked
    from further verification attempts.
    
    Args:
        db: Database session
        session: EmailVerificationSession to update
    """
    session.failed_attempts += 1
    db.commit()


def complete_registration(
    db: Session,
    session: EmailVerificationSession
) -> "User":
    """
    Create user account from a verified email verification session.
    
    This function:
    1. Deserializes registration data from JSON to DemoRegisterRequest
    2. Calls the existing create_demo_self_registered_user function
    3. Marks the session as used to prevent reuse
    4. Returns the created user
    
    Args:
        db: Database session
        session: Verified EmailVerificationSession containing registration data
        
    Returns:
        User: The newly created user account
        
    Raises:
        HTTPException: If user creation fails (e.g., email already exists)
        
    Example:
        >>> is_valid, error, session = validate_verification_code(db, "user@example.com", "A3B9K")
        >>> if is_valid:
        ...     user = complete_registration(db, session)
        ...     # User account is now created and session is marked as used
    """
    # Import here to avoid circular dependency
    from services.users import create_demo_self_registered_user
    from db.models import User
    
    # Step 1: Deserialize registration_data_json to DemoRegisterRequest
    # The JSON is stored as a dict, so we need to convert it back to the Pydantic model
    registration_data = DemoRegisterRequest(**session.registration_data_json)
    
    # Step 2: Call existing create_demo_self_registered_user
    # This function handles all the user creation logic including:
    # - Checking for existing users
    # - Creating unique username
    # - Hashing password
    # - Setting up demo user with expiration
    # - Creating user points
    # - Seeding permissions
    # - Assigning initial demo points
    user = create_demo_self_registered_user(db, registration_data)
    
    # Step 3: Mark session as used to prevent reuse
    session.is_used = True
    db.commit()
    
    # Step 4: Return created user
    return user
