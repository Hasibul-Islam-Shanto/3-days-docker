from pydantic import BaseModel, EmailStr, Field
from app.schemas.user import SessionUser

class RegisterInput(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    email: EmailStr = Field(..., max_length=255)
    password: str = Field(..., min_length=8, max_length=72)

class LoginInput(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)

class AuthResponse(BaseModel):
    token: str
    user: SessionUser
