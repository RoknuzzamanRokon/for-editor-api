"""Outbound marketing/outreach to external leads — never to rows in `users`.

Unlike in-app notifications, every admin/super_user shares one contact list
and one send history: a marketing lead belongs to the team, not to whichever
admin happened to add it. `created_by_user_id` / `logged_by_user_id` are kept
for attribution only, never for access scoping.

Sending is not "one email to N addresses" — each recipient gets their own
message (`_deliver_message` is called once per contact), matching normal
cold-outreach practice: recipients must never see each other's address in
the To/Cc line, and a single bad address must not fail the rest of the batch.
"""

import logging
import time
from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from core.config import settings
from core.security import create_unsubscribe_token, decode_unsubscribe_token, TokenError
from db.models import MarketingCampaign, MarketingContact, MarketingResponse, User
from db.session import SessionLocal
from services.email import send_raw_email
from services.email_templates import build_marketing_email_html, build_marketing_email_text

logger = logging.getLogger(__name__)

# Statuses an admin's explicit edit may set. Automation (a send, a logged
# reply) only ever moves a contact forward through NEW -> CONTACTED ->
# RESPONDED, and never overrides WON / LOST / UNSUBSCRIBED.
_TERMINAL_STATUSES = {"won", "lost", "unsubscribed"}
VALID_STATUSES = {"new", "contacted", "responded", "won", "lost", "unsubscribed"}

# A short pause between sends in one campaign so a burst of near-identical
# cold emails doesn't read as a spam blast to the sending mailbox's provider.
_SEND_STAGGER_SECONDS = 0.4


def _unsubscribe_url(contact_id: int) -> str:
    token = create_unsubscribe_token(contact_id)
    base = settings.backend_url.rstrip("/") if settings.backend_url else ""
    return f"{base}/api/v3/marketing/unsubscribe?token={token}"


def _advance_status(contact: MarketingContact, next_status: str) -> None:
    if contact.status in _TERMINAL_STATUSES:
        return
    order = ["new", "contacted", "responded"]
    if next_status not in order:
        return
    if contact.status not in order or order.index(next_status) > order.index(contact.status):
        contact.status = next_status


def get_or_create_contact(db: Session, email: str) -> MarketingContact:
    normalized = email.strip().lower()
    contact = db.query(MarketingContact).filter(MarketingContact.email == normalized).first()
    if contact:
        return contact

    contact = MarketingContact(email=normalized, status="new")
    db.add(contact)
    db.flush()
    return contact


def list_contacts(
    db: Session,
    search: str,
    status_filter: str,
    limit: int,
    offset: int,
) -> tuple[int, list[tuple[MarketingContact, datetime | None]]]:
    query = db.query(MarketingContact)

    if status_filter:
        query = query.filter(MarketingContact.status == status_filter)
    if search:
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(MarketingContact.email).like(term),
                func.lower(MarketingContact.company_name).like(term),
                func.lower(MarketingContact.contact_name).like(term),
            )
        )

    total = query.count()
    contacts = (
        query.order_by(MarketingContact.updated_at.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    if not contacts:
        return total, []

    last_activity = dict(
        db.query(MarketingResponse.contact_id, func.max(MarketingResponse.created_at))
        .filter(MarketingResponse.contact_id.in_([c.id for c in contacts]))
        .group_by(MarketingResponse.contact_id)
        .all()
    )
    return total, [(contact, last_activity.get(contact.id)) for contact in contacts]


def create_contact(
    db: Session,
    creator: User,
    email: str,
    company_name: str | None,
    contact_name: str | None,
    notes: str | None,
) -> MarketingContact:
    normalized = email.strip().lower()
    existing = db.query(MarketingContact).filter(MarketingContact.email == normalized).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Contact already exists")

    contact = MarketingContact(
        email=normalized,
        company_name=company_name,
        contact_name=contact_name,
        notes=notes,
        status="new",
        created_by_user_id=creator.id,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


def update_contact(
    db: Session,
    contact_id: int,
    status_value: str | None,
    company_name: str | None,
    contact_name: str | None,
    notes: str | None,
) -> MarketingContact:
    contact = db.query(MarketingContact).filter(MarketingContact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")

    if status_value is not None:
        if status_value not in VALID_STATUSES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status")
        contact.status = status_value
    if company_name is not None:
        contact.company_name = company_name
    if contact_name is not None:
        contact.contact_name = contact_name
    if notes is not None:
        contact.notes = notes

    db.commit()
    db.refresh(contact)
    return contact


def get_contact_thread(db: Session, contact_id: int) -> tuple[MarketingContact, list[MarketingResponse]]:
    contact = db.query(MarketingContact).filter(MarketingContact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")

    items = (
        db.query(MarketingResponse)
        .filter(MarketingResponse.contact_id == contact_id)
        .order_by(MarketingResponse.created_at.asc(), MarketingResponse.id.asc())
        .all()
    )
    return contact, items


def log_reply(
    db: Session,
    actor: User,
    contact_id: int,
    subject: str | None,
    body: str,
) -> MarketingResponse:
    contact = db.query(MarketingContact).filter(MarketingContact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")

    entry = MarketingResponse(
        contact_id=contact.id,
        direction="inbound",
        subject=subject,
        body=body.strip(),
        logged_by_user_id=actor.id,
    )
    db.add(entry)
    _advance_status(contact, "responded")
    db.commit()
    db.refresh(entry)
    return entry


def create_campaign(
    db: Session,
    sender: User,
    subject: str,
    body_html: str,
    contact_ids: list[int],
    new_emails: list[str],
) -> tuple[MarketingCampaign, list[int]]:
    """Creates the campaign and its per-recipient rows (status="queued") inside
    one transaction, then returns the contact ids to actually email — the
    caller schedules `send_campaign_emails` as a background task so the
    request returns immediately."""
    resolved_ids = {int(cid) for cid in contact_ids}
    existing = (
        db.query(MarketingContact).filter(MarketingContact.id.in_(resolved_ids)).all()
        if resolved_ids
        else []
    )
    if len(existing) != len(resolved_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more selected contacts no longer exist",
        )

    contacts: list[MarketingContact] = list(existing)
    seen_emails = {contact.email for contact in contacts}
    for raw_email in new_emails:
        normalized = raw_email.strip().lower()
        if normalized in seen_emails:
            continue
        contact = get_or_create_contact(db, normalized)
        contacts.append(contact)
        seen_emails.add(normalized)

    sendable = [c for c in contacts if c.status != "unsubscribed"]
    if not sendable:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Select at least one recipient who hasn't unsubscribed",
        )

    campaign = MarketingCampaign(
        sender_user_id=sender.id,
        subject=subject.strip(),
        body_html=body_html,
        recipient_count=len(sendable),
    )
    db.add(campaign)
    db.flush()

    db.add_all(
        [
            MarketingResponse(
                contact_id=contact.id,
                campaign_id=campaign.id,
                direction="outbound",
                subject=campaign.subject,
                body=body_html,
                status="queued",
                logged_by_user_id=sender.id,
            )
            for contact in sendable
        ]
    )
    db.commit()
    db.refresh(campaign)

    return campaign, [contact.id for contact in sendable]


def send_campaign_emails(campaign_id: int) -> None:
    """Runs as a FastAPI BackgroundTask *after* the request's own DB session
    has already closed, so this opens its own session rather than reusing one
    from a request-scoped dependency."""
    db = SessionLocal()
    try:
        campaign = db.query(MarketingCampaign).filter(MarketingCampaign.id == campaign_id).first()
        if not campaign:
            return

        rows = (
            db.query(MarketingResponse)
            .filter(
                MarketingResponse.campaign_id == campaign_id,
                MarketingResponse.direction == "outbound",
                MarketingResponse.status == "queued",
            )
            .all()
        )

        for index, row in enumerate(rows):
            contact = db.query(MarketingContact).filter(MarketingContact.id == row.contact_id).first()
            if not contact:
                row.status = "failed"
                row.error_message = "Contact no longer exists"
                db.commit()
                continue

            try:
                unsubscribe_url = _unsubscribe_url(contact.id)
                html_body = build_marketing_email_html(campaign.subject, campaign.body_html, unsubscribe_url)
                text_body = build_marketing_email_text(campaign.body_html, unsubscribe_url)
                send_raw_email(
                    contact.email,
                    campaign.subject,
                    html_body,
                    text_body,
                    list_unsubscribe_url=unsubscribe_url,
                )

                row.status = "sent"
                row.sent_at = datetime.utcnow()
                _advance_status(contact, "contacted")
            except HTTPException as exc:
                row.status = "failed"
                row.error_message = str(exc.detail)[:500]
                logger.warning("Marketing send failed for contact %s: %s", contact.id, exc.detail)
            except Exception as exc:  # noqa: BLE001 - one bad recipient must not stop the batch
                row.status = "failed"
                row.error_message = str(exc)[:500]
                logger.exception("Unexpected error sending marketing email to contact %s", contact.id)

            db.commit()

            if index < len(rows) - 1:
                time.sleep(_SEND_STAGGER_SECONDS)
    finally:
        db.close()


def list_campaigns(db: Session, limit: int, offset: int) -> tuple[int, list[MarketingCampaign], dict[int, dict[str, int]]]:
    query = db.query(MarketingCampaign)
    total = query.count()
    campaigns = (
        query.order_by(MarketingCampaign.created_at.desc(), MarketingCampaign.id.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    counts: dict[int, dict[str, int]] = {}
    if campaigns:
        rows = (
            db.query(
                MarketingResponse.campaign_id,
                MarketingResponse.status,
                func.count(MarketingResponse.id),
            )
            .filter(
                MarketingResponse.campaign_id.in_([c.id for c in campaigns]),
                MarketingResponse.direction == "outbound",
            )
            .group_by(MarketingResponse.campaign_id, MarketingResponse.status)
            .all()
        )
        for campaign_id, status_value, count in rows:
            counts.setdefault(campaign_id, {})[status_value or "queued"] = count

    return total, campaigns, counts


def unsubscribe_by_token(db: Session, token: str) -> None:
    try:
        contact_id = decode_unsubscribe_token(token)
    except TokenError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired link")

    contact = db.query(MarketingContact).filter(MarketingContact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")

    contact.status = "unsubscribed"
    db.commit()
