from fastapi import APIRouter

from models.contact import ContactRequest, ContactResponse
from services.email import send_contact_request_email

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", response_model=ContactResponse)
def submit_contact_request(payload: ContactRequest) -> ContactResponse:
    send_contact_request_email(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        plan_name=payload.plan_name,
    )
    return ContactResponse(message="Your request has been submitted. We'll be in touch shortly.")
