"""
Embedding model for the RAG AI Chatbot
Vector representation of book content used for semantic search and retrieval
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
import uuid


class EmbeddingCreate(BaseModel):
    """Schema for creating a new embedding"""
    chunk_id: str
    vector_data: str  # Store as string representation of vector
    model_used: str


class Embedding(BaseModel):
    """Schema for an embedding with all fields"""
    embedding_id: str = str(uuid.uuid4())
    chunk_id: str
    vector_data: str  # Store as string representation of vector
    model_used: str
    created_at: datetime = datetime.now()