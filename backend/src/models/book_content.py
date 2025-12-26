"""
Book Content model for the RAG AI Chatbot
The Docusaurus markdown content that has been processed and stored for RAG
"""
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel
import uuid


class BookContentCreate(BaseModel):
    """Schema for creating new book content"""
    document_path: str
    title: str
    content_text: str
    metadata: Optional[Dict[str, Any]] = None


class BookContent(BaseModel):
    """Schema for book content with all fields"""
    content_id: str = str(uuid.uuid4())
    document_path: str
    title: str
    content_text: str
    processed: bool = False
    last_modified: datetime = datetime.now()
    metadata: Optional[Dict[str, Any]] = None