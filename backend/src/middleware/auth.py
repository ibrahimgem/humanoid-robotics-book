from fastapi import HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from typing import Optional
import os
from sqlalchemy.orm import Session
from ..services.user_service import UserService

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

security = HTTPBearer()

def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token and return payload if valid."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            return None
        return payload
    except JWTError:
        return None

def get_current_user_id(credentials: HTTPAuthorizationCredentials = security) -> int:
    """Get the current user ID from the token."""
    token_data = verify_token(credentials.credentials)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return int(token_data["sub"])

def get_current_user(credentials: HTTPAuthorizationCredentials = security) -> dict:
    """Get the current user details from the token."""
    token_data = verify_token(credentials.credentials)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = int(token_data["sub"])
    return {"user_id": user_id}