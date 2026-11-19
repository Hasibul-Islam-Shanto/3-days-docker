from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import RegisterInput, LoginInput, AuthResponse
from app.schemas.user import SessionUser
from app.auth.security import verify_password, get_password_hash, create_access_token
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

def user_to_session_user(user: User) -> SessionUser:
    return SessionUser(
        id=int(user.id),
        name=user.name,
        email=user.email,
        bio=user.bio or "",
        avatarUrl=user.avatar_url,
        joinedAt=user.created_at.isoformat() if user.created_at else "",
    )

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(input_data: RegisterInput, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == input_data.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "CONFLICT", "message": "An account with that email already exists"},
        )

    hashed_pw = get_password_hash(input_data.password)
    new_user = User(
        name=input_data.name.strip(),
        email=input_data.email.lower().strip(),
        password_hash=hashed_pw,
        bio="",
        avatar_url=None,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    user_schema = user_to_session_user(new_user)
    token = create_access_token(int(new_user.id), new_user.email)
    return AuthResponse(token=token, user=user_schema)

@router.post("/login", response_model=AuthResponse)
def login(input_data: LoginInput, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == input_data.email.lower()).first()
    if not user or not verify_password(input_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "Email or password is incorrect"},
        )

    user_schema = user_to_session_user(user)
    token = create_access_token(int(user.id), user.email)
    return AuthResponse(token=token, user=user_schema)

@router.get("/me", response_model=SessionUser)
def get_me(current_user: User = Depends(get_current_user)):
    return user_to_session_user(current_user)
