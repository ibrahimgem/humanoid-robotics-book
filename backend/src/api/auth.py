from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from sqlalchemy.orm import Session
from ..services.user_service import UserService
from ..services.auth_service import AuthService
from ..database.connection import get_db
from ..models.user import User, UserProfile

router = APIRouter(prefix="/auth", tags=["auth"])

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    software_experience: Optional[str] = None
    hardware_experience: Optional[str] = None
    experience_level: Optional[str] = None
    preferred_language: Optional[str] = "en"
    learning_goals: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    email: str
    profile: Optional[dict] = None

class ProfileUpdateRequest(BaseModel):
    software_experience: Optional[str] = None
    hardware_experience: Optional[str] = None
    experience_level: Optional[str] = None
    preferred_language: Optional[str] = None
    learning_goals: Optional[str] = None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            return None
        return payload
    except JWTError:
        return None

@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    user_service = UserService(db)

    # Prepare profile data
    profile_data = {
        "software_experience": request.software_experience,
        "hardware_experience": request.hardware_experience,
        "experience_level": request.experience_level,
        "preferred_language": request.preferred_language,
        "learning_goals": request.learning_goals
    }

    try:
        user = user_service.create_user(
            email=request.email,
            password=request.password,
            profile_data=profile_data
        )

        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )

        # Get user profile
        profile = user_service.get_user_profile(user.id)
        profile_dict = None
        if profile:
            profile_dict = {
                "software_experience": profile.software_experience,
                "hardware_experience": profile.hardware_experience,
                "experience_level": profile.experience_level,
                "preferred_language": profile.preferred_language,
                "learning_goals": profile.learning_goals
            }

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=user.id,
            email=user.email,
            profile=profile_dict
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)

    user = auth_service.authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    # Get user profile
    user_service = UserService(db)
    profile = user_service.get_user_profile(user.id)
    profile_dict = None
    if profile:
        profile_dict = {
            "software_experience": profile.software_experience,
            "hardware_experience": profile.hardware_experience,
            "experience_level": profile.experience_level,
            "preferred_language": profile.preferred_language,
            "learning_goals": profile.learning_goals
        }

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        profile=profile_dict
    )

@router.get("/profile", response_model=ProfileUpdateRequest)
async def get_profile(credentials: HTTPAuthorizationCredentials = Depends(security),
                     db: Session = Depends(get_db)):
    token_data = verify_token(credentials.credentials)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = int(token_data["sub"])
    user_service = UserService(db)
    profile = user_service.get_user_profile(user_id)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    return ProfileUpdateRequest(
        software_experience=profile.software_experience,
        hardware_experience=profile.hardware_experience,
        experience_level=profile.experience_level,
        preferred_language=profile.preferred_language,
        learning_goals=profile.learning_goals
    )

@router.put("/profile", response_model=ProfileUpdateRequest)
async def update_profile(request: ProfileUpdateRequest,
                        credentials: HTTPAuthorizationCredentials = Depends(security),
                        db: Session = Depends(get_db)):
    token_data = verify_token(credentials.credentials)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = int(token_data["sub"])
    user_service = UserService(db)

    profile_data = request.dict(exclude_unset=True)
    updated_profile = user_service.update_user_profile(user_id, profile_data)

    if not updated_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    return ProfileUpdateRequest(
        software_experience=updated_profile.software_experience,
        hardware_experience=updated_profile.hardware_experience,
        experience_level=updated_profile.experience_level,
        preferred_language=updated_profile.preferred_language,
        learning_goals=updated_profile.learning_goals
    )