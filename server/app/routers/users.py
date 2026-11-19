from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import PublicUser, SessionUser, UpdateProfileInput
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])

def user_to_public_user(user: User) -> PublicUser:
    return PublicUser(
        id=int(user.id),
        name=user.name,
        bio=user.bio or "",
        avatarUrl=user.avatar_url,
        joinedAt=user.created_at.isoformat() if user.created_at else "",
    )

def user_to_session_user(user: User) -> SessionUser:
    return SessionUser(
        id=int(user.id),
        name=user.name,
        email=user.email,
        bio=user.bio or "",
        avatarUrl=user.avatar_url,
        joinedAt=user.created_at.isoformat() if user.created_at else "",
    )

@router.patch("/me", response_model=SessionUser)
def update_me(
    input_data: UpdateProfileInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if input_data.name is not None:
        current_user.name = input_data.name.strip()
    if input_data.bio is not None:
        current_user.bio = input_data.bio.strip()
    if input_data.avatar_url is not None:
        current_user.avatar_url = input_data.avatar_url.strip() or None

    db.commit()
    db.refresh(current_user)
    return user_to_session_user(current_user)

@router.get("/{user_id}", response_model=PublicUser)
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "User not found"},
        )
    return user_to_public_user(user)
