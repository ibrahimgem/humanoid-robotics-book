"""
Chat Log model for the RAG AI Chatbot
Log of user interactions for analytics and improvement purposes
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
import uuid


class ChatLogCreate(BaseModel):
    """Schema for creating a new chat log entry"""
    query_id: str
    response_text: str
    relevance_score: Optional[float] = None
    user_feedback: Optional[str] = None


class ChatLog(BaseModel):
    """Schema for a chat log entry with all fields"""
    log_id: str = str(uuid.uuid4())
    query_id: str
    response_text: str
    relevance_score: Optional[float] = None
    user_feedback: Optional[str] = None
    timestamp: datetime = datetime.now()
    response_time_ms: Optional[int] = None