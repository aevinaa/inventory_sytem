from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserOut(BaseModel):
    """What we return to the client — never expose password_hash."""
    id: str
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    """Admin creating a new staff account."""
    name: str
    email: EmailStr
    password: str
    role: str = "staff"


class UserUpdate(BaseModel):
    """Admin updating a user."""
    name: str | None = None
    email: EmailStr | None = None
    role: str | None = None
    is_active: bool | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str