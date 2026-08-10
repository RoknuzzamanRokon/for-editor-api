from pydantic import BaseModel, EmailStr, Field


class ContactRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    phone: str = Field(min_length=1, max_length=50)
    plan_name: str = Field(min_length=1, max_length=100)


class ContactResponse(BaseModel):
    success: bool = True
    message: str
