"""
Email service for sending verification emails.

This module provides functionality to send verification emails using SMTP
configuration from environment variables.
"""

import os
import smtplib
from dataclasses import dataclass
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import HTTPException


@dataclass
class EmailConfig:
    """Email configuration loaded from environment variables."""
    smtp_server: str
    smtp_port: int
    username: str
    password: str
    from_email: str


def get_email_config() -> EmailConfig:
    """
    Load email configuration from environment variables.
    
    Returns:
        EmailConfig: Configuration object with SMTP settings
        
    Raises:
        HTTPException: If required environment variables are missing
    """
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = os.getenv("SMTP_PORT")
    username = os.getenv("EMAIL_USERNAME")
    password = os.getenv("EMAIL_PASSWORD")
    
    # Validate all required variables are present
    if not all([smtp_server, smtp_port, username, password]):
        missing = []
        if not smtp_server:
            missing.append("SMTP_SERVER")
        if not smtp_port:
            missing.append("SMTP_PORT")
        if not username:
            missing.append("EMAIL_USERNAME")
        if not password:
            missing.append("EMAIL_PASSWORD")
        raise HTTPException(
            status_code=500,
            detail=f"Email configuration incomplete. Missing: {', '.join(missing)}"
        )
    
    try:
        port = int(smtp_port)
    except ValueError:
        raise HTTPException(
            status_code=500,
            detail=f"Invalid SMTP_PORT value: {smtp_port}. Must be an integer."
        )
    
    return EmailConfig(
        smtp_server=smtp_server,
        smtp_port=port,
        username=username,
        password=password,
        from_email=username  # Use username as from_email by default
    )


def send_verification_email(
    to_email: str,
    verification_code: str,
    expiration_minutes: int = 10
) -> None:
    """
    Send verification email with code.
    
    Args:
        to_email: Recipient email address
        verification_code: 5-character verification code
        expiration_minutes: Minutes until code expires (default: 10)
        
    Raises:
        HTTPException: If email sending fails
    """
    config = get_email_config()
    
    # Create email message
    message = MIMEMultipart("alternative")
    message["Subject"] = "Verify Your Email Address"
    message["From"] = config.from_email
    message["To"] = to_email
    
    # Email body template
    body = f"""Hello,

Thank you for registering! Please use the following verification code to complete your registration:

Verification Code: {verification_code}

This code will expire in {expiration_minutes} minutes.

If you didn't request this registration, please ignore this email.

Do not share this code with anyone.
"""
    
    # Attach plain text body
    text_part = MIMEText(body, "plain")
    message.attach(text_part)
    
    # Send email using SMTP
    try:
        # Use SSL connection for port 465, STARTTLS for other ports
        if config.smtp_port == 465:
            # SSL connection
            with smtplib.SMTP_SSL(config.smtp_server, config.smtp_port) as server:
                server.login(config.username, config.password)
                server.sendmail(config.from_email, to_email, message.as_string())
        else:
            # STARTTLS connection
            with smtplib.SMTP(config.smtp_server, config.smtp_port) as server:
                server.starttls()
                server.login(config.username, config.password)
                server.sendmail(config.from_email, to_email, message.as_string())
                
    except smtplib.SMTPAuthenticationError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Email authentication failed. Please check email credentials."
        )
    except smtplib.SMTPException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send verification email: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error sending email: {str(e)}"
        )
