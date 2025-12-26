"""
User Session model for the RAG AI Chatbot
The interaction state between a user and the chatbot during a session
"""
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel
import uuid


class UserSessionCreate(BaseModel):
    """Schema for creating a new user session"""
    user_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class UserSession(BaseModel):
    """Schema for a user session with all fields"""
    session_id: str = str(uuid.uuid4())
    user_id: Optional[str] = None
    start_time: datetime = datetime.now()
    last_interaction: datetime = datetime.now()
    active: bool = True
    metadata: Optional[Dict[str, Any]] = None