from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.user import (
    LoginRequest,
    TokenResponse,
    RefreshRequest,
    UserOut,
)

from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)

router = APIRouter()


# =========================
# LOGIN
# =========================
@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):

    result = await db.execute(
        select(User).where(
            User.email == payload.email,
            User.is_active == True
        )
    )

    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
        )

    return TokenResponse(
        access_token=create_access_token(
            str(user.id),
            {"role": user.role}
        ),
        refresh_token=create_refresh_token(str(user.id)),
    )


# =========================
# REFRESH TOKEN
# =========================
@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    payload: RefreshRequest,
    db: AsyncSession = Depends(get_db)
):

    token_data = decode_refresh_token(payload.refresh_token)

    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    result = await db.execute(
        select(User).where(
            User.id == str(token_data["sub"]),
            User.is_active == True
        )
    )

    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return TokenResponse(
        access_token=create_access_token(
            str(user.id),
            {"role": user.role}
        ),
        refresh_token=create_refresh_token(str(user.id)),
    )


# =========================
# CURRENT USER
# =========================
@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
