from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict, Any

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import User as UserSchema, UserCreate

router = APIRouter()

@router.get("/me", response_model=Dict[str, Any])
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Get user metadata from Firebase token claims.
    """
    return {
        "uid": current_user.get("uid"),
        "email": current_user.get("email"),
        "name": current_user.get("name"),
        "email_verified": current_user.get("email_verified", False),
    }

@router.post("/sync", response_model=UserSchema)
async def sync_user(
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> User:
    """
    Synchronize the authenticated Firebase user with the local PostgreSQL database.
    Creates a new user record if it doesn't already exist.
    """
    firebase_uid = current_user.get("uid")
    email = current_user.get("email")
    name = current_user.get("name")

    if not firebase_uid or not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Firebase user token lacks UID or Email",
        )

    # Check if user already exists
    result = await db.execute(select(User).filter(User.firebase_uid == firebase_uid))
    user = result.scalars().first()

    if not user:
        # Create user
        user = User(
            firebase_uid=firebase_uid,
            email=email,
            name=name,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user
