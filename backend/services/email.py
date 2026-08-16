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
    message["Subject"] = "Your ConvertPro verification code"
    message["From"] = config.from_email
    message["To"] = to_email

    # Plain-text fallback for clients that don't render HTML.
    text_body = f"""Verify your email address

Thanks for registering with ConvertPro! Use the verification code below to
complete your registration:

    {verification_code}

This code expires in {expiration_minutes} minutes.

If you didn't request this, you can safely ignore this email — no account
will be created. Never share this code with anyone, including ConvertPro
support.
"""

    # HTML version — styles are inlined throughout since most email clients
    # strip <style> blocks or ignore embedded stylesheets.
    html_body = f"""\
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Verify your email address</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 10px rgba(15,23,42,0.08);">
          <tr>
            <td style="background-color:#0f172a; padding:28px 32px;">
              <span style="color:#ffffff; font-size:20px; font-weight:800; letter-spacing:0.02em;">ConvertPro</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 12px; font-size:20px; font-weight:700; color:#0f172a;">Verify your email address</h1>
              <p style="margin:0 0 24px; font-size:14px; line-height:1.6; color:#475569;">
                Thanks for registering! Use the verification code below to complete your registration. This code is valid for <strong>{expiration_minutes} minutes</strong>.
              </p>
              <div style="margin:0 0 24px; padding:20px; background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; text-align:center;">
                <span style="display:inline-block; font-family:'Courier New',Courier,monospace; font-size:32px; font-weight:800; letter-spacing:8px; color:#ea580c;">{verification_code}</span>
              </div>
              <p style="margin:0 0 8px; font-size:13px; line-height:1.6; color:#64748b;">
                If you didn't request this, you can safely ignore this email — no account will be created.
              </p>
              <p style="margin:0; font-size:13px; line-height:1.6; color:#64748b;">
                For your security, never share this code with anyone, including ConvertPro support.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px; background-color:#f8fafc; border-top:1px solid #e2e8f0;">
              <p style="margin:0; font-size:12px; color:#94a3b8;">This is an automated message — please don't reply to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    # Attach plain text first, HTML last — for multipart/alternative, clients
    # render the *last* part they support, so HTML must come after plain text.
    message.attach(MIMEText(text_body, "plain"))
    message.attach(MIMEText(html_body, "html"))

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
