from pydantic import BaseModel, EmailStr
from typing import Optional

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

class ProfileResponse(BaseModel):
    id: int
    user_id: int
    software_experience: Optional[str] = None
    hardware_experience: Optional[str] = None
    experience_level: Optional[str] = None
    preferred_language: Optional[str] = None
    learning_goals: Optional[str] = None