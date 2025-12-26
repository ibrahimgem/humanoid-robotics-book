"""
Query model for the RAG AI Chatbot
Represents a user's question submitted to the system
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from enum import Enum
import uuid


class QueryMode(str, Enum):
    """Enumeration for query modes"""
    GLOBAL = "global"
    SELECTED_TEXT = "selected_text"


class QueryCreate(BaseModel):
    """Schema for creating a new query"""
    question_text: str
    query_mode: QueryMode = QueryMode.GLOBAL
    selected_text: Optional[str] = None
    session_id: Optional[str] = None
    user_id: Optional[str] = None


class Query(BaseModel):
    """Schema for a query with all fields"""
    query_id: str = str(uuid.uuid4())
    user_id: Optional[str] = None
    question_text: str
    query_mode: QueryMode
    selected_text: Optional[str] = None
    timestamp: datetime = datetime.now()
    session_id: Optional[str] = None