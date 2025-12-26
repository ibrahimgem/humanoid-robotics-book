"""
Context Chunk model for the RAG AI Chatbot
A segment of book content retrieved from vector storage that is relevant to a query
"""
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel
import uuid


class ContextChunkCreate(BaseModel):
    """Schema for creating a new context chunk"""
    content: str
    source_document: str
    source_section: str
    metadata: Optional[Dict[str, Any]] = None


class ContextChunk(BaseModel):
    """Schema for a context chunk with all fields"""
    chunk_id: str = str(uuid.uuid4())
    content: str
    source_document: str
    source_section: str
    embedding_vector: Optional[str] = None  # Store as string representation of vector
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = datetime.now()