from typing import Optional
from pydantic import Field, EmailStr
from app.schemas.common import CamelModel

class PublicUser(CamelModel):
    id: int
    name: str
    bio: str = ""
    avatar_url: Optional[str] = None
    joined_at: str

class SessionUser(PublicUser):
    email: EmailStr

class UpdateProfileInput(CamelModel):
    name: Optional[str] = Field(None, min_length=2, max_length=80)
    bio: Optional[str] = Field(None, max_length=280)
    avatar_url: Optional[str] = Field(None, max_length=500)
