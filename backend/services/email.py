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


def _deliver_message(config: EmailConfig, to_addrs: list[str], message: MIMEMultipart, failure_context: str) -> None:
    """
    Send a prepared MIME message over SMTP, using SSL for port 465 and
    STARTTLS otherwise. Shared by every send_* function in this module so
    there is a single place that knows how to talk to the SMTP server.

    Raises:
        HTTPException: If email sending fails
    """
    try:
        if config.smtp_port == 465:
            with smtplib.SMTP_SSL(config.smtp_server, config.smtp_port) as server:
                server.login(config.username, config.password)
                server.sendmail(config.from_email, to_addrs, message.as_string())
        else:
            with smtplib.SMTP(config.smtp_server, config.smtp_port) as server:
                server.starttls()
                server.login(config.username, config.password)
                server.sendmail(config.from_email, to_addrs, message.as_string())

    except smtplib.SMTPAuthenticationError:
        raise HTTPException(
            status_code=500,
            detail="Email authentication failed. Please check email credentials."
        )
    except smtplib.SMTPException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send {failure_context}: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error sending {failure_context}: {str(e)}"
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

    _deliver_message(config, [to_email], message, "verification email")


def send_contact_request_email(
    name: str,
    email: str,
    phone: str,
    plan_name: str,
) -> None:
    """
    Notify the admin of a new pricing-page contact request, and CC a
    secondary address if CC_EMAIL is configured.

    Args:
        name: Visitor's name
        email: Visitor's email address (set as Reply-To)
        phone: Visitor's phone number
        plan_name: The pricing plan they're asking about

    Raises:
        HTTPException: If email sending fails, or BOSS_EMAIL is not configured
    """
    config = get_email_config()

    recipient = os.getenv("BOSS_EMAIL")
    if not recipient:
        raise HTTPException(
            status_code=500,
            detail="Contact form recipient is not configured. Set BOSS_EMAIL in the environment."
        )

    cc_email = os.getenv("CC_EMAIL")
    to_addrs = [recipient] + ([cc_email] if cc_email else [])

    message = MIMEMultipart("alternative")
    message["Subject"] = f"New Contact Request — {plan_name} Plan"
    message["From"] = config.from_email
    message["To"] = recipient
    if cc_email:
        message["Cc"] = cc_email
    message["Reply-To"] = email

    body = f"""A visitor submitted a contact request from the pricing page.

Plan: {plan_name}
Name: {name}
Email: {email}
Phone: {phone}

Reply directly to this email to reach them at {email}.
"""

    text_part = MIMEText(body, "plain")
    message.attach(text_part)

    _deliver_message(config, to_addrs, message, "contact request email")
