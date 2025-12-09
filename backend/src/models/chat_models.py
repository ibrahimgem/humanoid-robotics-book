"""
Database models for the RAG chatbot system.
Defines the schema for all database entities.
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, UUID, ForeignKey, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class ChatSession(Base):
    """
    Stores user chat session information and history.
    """
    __tablename__ = 'chat_sessions'

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PostgresUUID(as_uuid=True), nullable=True)  # nullable, for anonymous sessions
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    session_metadata = Column(JSON)  # additional session data

class ChatLog(Base):
    """
    Stores individual chat messages within sessions.
    """
    __tablename__ = 'chat_logs'

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(PostgresUUID(as_uuid=True), ForeignKey('chat_sessions.id'))
    role = Column(String, nullable=False)  # enum: 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    query_mode = Column(String, nullable=False)  # enum: 'global', 'local'
    selected_text = Column(Text, nullable=True)  # nullable, for local queries
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    log_metadata = Column(JSON)  # retrieval context, sources, etc.

class KnowledgeChunk(Base):
    """
    Stores metadata about content chunks that are vectorized.
    """
    __tablename__ = 'knowledge_chunks'

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chapter_id = Column(String, nullable=False)  # chapter identifier for namespacing
    content_hash = Column(String, nullable=False, unique=True)  # unique hash of content
    source_file = Column(String, nullable=False)  # path to source document
    source_section = Column(String, nullable=False)  # section title/heading
    content_preview = Column(Text)  # first 200 chars of content
    embedding_status = Column(String, nullable=False)  # enum: 'pending', 'processed', 'failed'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class FileMap(Base):
    """
    Maps original files to their processed chunks.
    """
    __tablename__ = 'file_mappings'

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    original_path = Column(String, nullable=False)  # original file path
    processed_chunks = Column(Integer, default=0)  # number of chunks created
    last_processed = Column(DateTime(timezone=True))  # timestamp of last processing
    processing_status = Column(String, nullable=False)  # enum: 'pending', 'in_progress', 'completed', 'failed'