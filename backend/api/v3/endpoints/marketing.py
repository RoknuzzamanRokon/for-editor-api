"""Outbound marketing/outreach to external leads.

Every endpoint except `/unsubscribe` is shared by every admin_user/super_user
— see services.marketing's module docstring for why contacts aren't scoped
per-admin the way notification audiences are.
"""

from fastapi import APIRouter, BackgroundTasks, Depends, Query, Response, status
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from core.deps import get_current_user, require_role
from db.models import RoleEnum, User
from db.session import get_db
from models.marketing import (
    CampaignCreateRequest,
    CampaignCreateResponse,
    CampaignEntry,
    CampaignList,
    ContactCreateRequest,
    ContactEntry,
    ContactList,
    ContactThread,
    ContactUpdateRequest,
    LogReplyRequest,
    ResponseEntry,
)
from services import marketing as marketing_service

router = APIRouter(prefix="/marketing", tags=["marketing"])

_MARKETING_ROLES = (RoleEnum.super_user, RoleEnum.admin_user)


def _contact_entry(contact, last_activity_at=None) -> ContactEntry:
    return ContactEntry(
        id=contact.id,
        email=contact.email,
        company_name=contact.company_name,
        contact_name=contact.contact_name,
        status=contact.status,
        notes=contact.notes,
        created_at=contact.created_at,
        updated_at=contact.updated_at,
        last_activity_at=last_activity_at,
    )


def _response_entry(response, sender_label: str | None) -> ResponseEntry:
    return ResponseEntry(
        id=response.id,
        contact_id=response.contact_id,
        campaign_id=response.campaign_id,
        direction=response.direction,
        subject=response.subject,
        body=response.body,
        status=response.status,
        error_message=response.error_message,
        sender_label=sender_label,
        created_at=response.created_at,
    )


@router.get("/contacts", response_model=ContactList)
def get_contacts(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(*_MARKETING_ROLES)),
    search: str = Query(""),
    status_filter: str = Query("", alias="status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> ContactList:
    total, rows = marketing_service.list_contacts(db, search, status_filter, limit, offset)
    return ContactList(
        total=total,
        limit=limit,
        offset=offset,
        items=[_contact_entry(contact, last_activity) for contact, last_activity in rows],
    )


@router.post("/contacts", response_model=ContactEntry, status_code=status.HTTP_201_CREATED)
def post_contact(
    payload: ContactCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(*_MARKETING_ROLES)),
) -> ContactEntry:
    contact = marketing_service.create_contact(
        db,
        current_user,
        email=str(payload.email),
        company_name=payload.company_name,
        contact_name=payload.contact_name,
        notes=payload.notes,
    )
    return _contact_entry(contact)


@router.patch("/contacts/{contact_id}", response_model=ContactEntry)
def patch_contact(
    contact_id: int,
    payload: ContactUpdateRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(*_MARKETING_ROLES)),
) -> ContactEntry:
    contact = marketing_service.update_contact(
        db,
        contact_id,
        status_value=payload.status,
        company_name=payload.company_name,
        contact_name=payload.contact_name,
        notes=payload.notes,
    )
    return _contact_entry(contact)


@router.get("/contacts/{contact_id}/thread", response_model=ContactThread)
def get_contact_thread(
    contact_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(*_MARKETING_ROLES)),
) -> ContactThread:
    contact, items = marketing_service.get_contact_thread(db, contact_id)

    sender_ids = {item.logged_by_user_id for item in items if item.logged_by_user_id}
    senders = {}
    if sender_ids:
        senders = {
            user.id: user.username or user.email
            for user in db.query(User).filter(User.id.in_(sender_ids)).all()
        }

    return ContactThread(
        contact=_contact_entry(contact),
        items=[
            _response_entry(item, senders.get(item.logged_by_user_id))
            for item in items
        ],
    )


@router.post(
    "/contacts/{contact_id}/responses",
    response_model=ResponseEntry,
    status_code=status.HTTP_201_CREATED,
)
def post_reply(
    contact_id: int,
    payload: LogReplyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(*_MARKETING_ROLES)),
) -> ResponseEntry:
    entry = marketing_service.log_reply(
        db, current_user, contact_id, subject=payload.subject, body=payload.body
    )
    sender_label = current_user.username or current_user.email
    return _response_entry(entry, sender_label)


@router.post("/campaigns", response_model=CampaignCreateResponse, status_code=status.HTTP_201_CREATED)
def post_campaign(
    payload: CampaignCreateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(*_MARKETING_ROLES)),
) -> CampaignCreateResponse:
    campaign, _contact_ids = marketing_service.create_campaign(
        db,
        current_user,
        subject=payload.subject,
        body_html=payload.body_html,
        contact_ids=payload.contact_ids,
        new_emails=[str(email) for email in payload.new_emails],
    )
    background_tasks.add_task(marketing_service.send_campaign_emails, campaign.id)

    return CampaignCreateResponse(
        id=campaign.id,
        subject=campaign.subject,
        recipient_count=campaign.recipient_count,
        created_at=campaign.created_at,
    )


@router.get("/campaigns", response_model=CampaignList)
def get_campaigns(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(*_MARKETING_ROLES)),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> CampaignList:
    total, campaigns, counts = marketing_service.list_campaigns(db, limit, offset)
    items = [
        CampaignEntry(
            id=campaign.id,
            subject=campaign.subject,
            body_html=campaign.body_html,
            category=campaign.category,
            recipient_count=campaign.recipient_count,
            sent_count=counts.get(campaign.id, {}).get("sent", 0),
            failed_count=counts.get(campaign.id, {}).get("failed", 0),
            created_at=campaign.created_at,
        )
        for campaign in campaigns
    ]
    return CampaignList(total=total, limit=limit, offset=offset, items=items)


@router.get("/unsubscribe", response_class=HTMLResponse, include_in_schema=False)
def get_unsubscribe(token: str, db: Session = Depends(get_db)) -> HTMLResponse:
    """Public — reached by clicking the visible link in a marketing email, not
    from inside the app, so it carries no auth dependency."""
    marketing_service.unsubscribe_by_token(db, token)
    return HTMLResponse(
        """<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Unsubscribed</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background:#f1f5f9; margin:0; padding:48px 16px; text-align:center;">
<div style="max-width:420px; margin:0 auto; background:#ffffff; border-radius:12px; padding:32px; box-shadow:0 2px 10px rgba(15,23,42,0.08);">
<h1 style="margin:0 0 12px; font-size:18px; color:#0f172a;">You're unsubscribed</h1>
<p style="margin:0; font-size:14px; color:#475569; line-height:1.6;">You won't receive any further marketing emails from ConvaterPro at this address.</p>
</div>
</body></html>"""
    )


@router.post("/unsubscribe", include_in_schema=False)
def post_unsubscribe(token: str, db: Session = Depends(get_db)) -> Response:
    """The RFC 8058 one-click target: mail clients (Gmail, Outlook) POST here
    on the user's behalf when they use the client's own native "Unsubscribe"
    affordance next to the sender name — driven by the List-Unsubscribe /
    List-Unsubscribe-Post headers set in services.email.send_raw_email, not by
    anything rendered in the email body. No confirmation page; the client
    shows its own."""
    marketing_service.unsubscribe_by_token(db, token)
    return Response(status_code=status.HTTP_200_OK)
