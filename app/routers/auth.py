import os
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import create_access_token, hash_password, verify_password
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import TokenResponse, UserLoginRequest, UserOut, UserProfileUpdate, UserRegisterRequest

router = APIRouter()


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    requested_role = payload.role.upper()
    if requested_role == "ADMIN":
        expected_key = os.getenv("ADMIN_REGISTRATION_KEY", "")
        if not payload.admin_registration_key or payload.admin_registration_key != expected_key:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin registration key is required")

    user = User(
        name=payload.name.strip(),
        email=email,
        password_hash=hash_password(payload.password),
        role=requested_role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login_user(payload: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.strip().lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(user.id)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_me(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user = db.merge(current_user)

    if payload.name is not None:
        current_user.name = payload.name.strip()

    if payload.email is not None:
        email = payload.email.strip().lower()
        if db.query(User).filter(User.email == email, User.id != current_user.id).first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
        current_user.email = email

    db.commit()
    db.refresh(current_user)
    return current_user
