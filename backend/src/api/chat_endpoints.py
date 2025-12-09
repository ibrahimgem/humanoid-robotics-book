from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from uuid import UUID
import uuid
from datetime import datetime
import asyncio

from src.database.connection import get_db
from src.models.chat_models import ChatSession, ChatLog
from src.vector_store.qdrant_client import qdrant_manager
from src.services.embedding_service import embedding_service
from src.utils.content_parser import ContentParser
from src.services.rag_service import rag_service

# Pydantic models for request/response
class ChatQueryRequest(BaseModel):
    message: str
    session_id: str
    query_mode: str = "global"  # 'global' or 'local'
    selected_text: Optional[str] = None

class Citation(BaseModel):
    source: str
    section: str
    text: str

class ChatQueryResponse(BaseModel):
    response: str
    sources: List[str]
    session_id: str
    query_mode: str
    citations: List[Citation]

# Initialize API router
router = APIRouter(prefix="/chat", tags=["chat"])

# Add CORS middleware is not needed for routers - it's handled at the main app level

@router.get("/health")
async def health_check():
    """Health check endpoint to verify service is running."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "details": {
            "qdrant_connection": True,  # Simplified - would check actual connection
            "database_connection": True  # Simplified - would check actual connection
        }
    }

@router.post("/query", response_model=ChatQueryResponse)
async def chat_query(request: ChatQueryRequest):
    """
    Submit a query to the RAG system.
    Process a user query against the book content using RAG.
    """
    try:
        # Validate query mode
        if request.query_mode not in ["global", "local"]:
            raise HTTPException(status_code=400, detail="query_mode must be 'global' or 'local'")

        # Get or create chat session
        db = next(get_db())
        try:
            # Validate and convert session_id to UUID format
            try:
                session_uuid = UUID(request.session_id)
            except ValueError:
                # If session_id is not a valid UUID, generate a new one but log the original for debugging
                session_uuid = UUID(uuid.uuid4())
                print(f"Invalid UUID format for session_id: {request.session_id}. Generated new UUID: {session_uuid}")

            # Check if session exists, create if not
            session = db.query(ChatSession).filter(ChatSession.id == session_uuid).first()
            if not session:
                session = ChatSession(id=session_uuid)
                db.add(session)
                db.commit()
                db.refresh(session)

            # Log the user message
            user_log = ChatLog(
                session_id=session_uuid,
                role="user",
                content=request.message,
                query_mode=request.query_mode,
                selected_text=request.selected_text
            )
            db.add(user_log)
            db.commit()

            # Process the query using the RAG service
            response = await rag_service.process_query(
                query=request.message,
                session_id=str(session_uuid),  # Pass the UUID as string
                query_mode=request.query_mode,
                selected_text=request.selected_text
            )

            # Log the assistant response
            assistant_log = ChatLog(
                session_id=session_uuid,
                role="assistant",
                content=response['response'],
                query_mode=request.query_mode,
                selected_text=request.selected_text
            )
            db.add(assistant_log)
            db.commit()

            # Prepare the response
            response_obj = ChatQueryResponse(
                response=response['response'],
                sources=response.get('sources', []),
                session_id=str(session_uuid),
                query_mode=request.query_mode,
                citations=response.get('citations', [])
            )

            return response_obj

        finally:
            db.close()

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@router.post("/query-selected", response_model=ChatQueryResponse)
async def chat_query_selected(request: ChatQueryRequest):
    """
    Submit a query with selected text context.
    Process a user query with specific text selection context.
    """
    # This is essentially the same as local query mode
    if not request.selected_text:
        raise HTTPException(status_code=400, detail="selected_text is required for this endpoint")

    # Create a new request with local mode
    local_request = ChatQueryRequest(
        message=request.message,
        session_id=request.session_id,
        query_mode="local",
        selected_text=request.selected_text
    )

    return await chat_query(local_request)

# Additional utility endpoints

@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get chat session details and history."""
    try:
        db = next(get_db())
        try:
            session = db.query(ChatSession).filter(ChatSession.id == UUID(session_id)).first()
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")

            # Get chat logs for this session
            chat_logs = db.query(ChatLog).filter(ChatLog.session_id == UUID(session_id)).all()

            return {
                "session_id": session_id,
                "created_at": session.created_at,
                "updated_at": session.updated_at,
                "message_count": len(chat_logs),
                "logs": [
                    {
                        "role": log.role,
                        "content": log.content,
                        "timestamp": log.created_at,
                        "query_mode": log.query_mode
                    } for log in chat_logs
                ]
            }
        finally:
            db.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving session: {str(e)}")

@router.get("/session-context/{session_id}")
async def get_session_context(session_id: str):
    """Get the current context for a session including last selected text."""
    try:
        context = await rag_service.get_session_context(session_id)
        return context
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving session context: {str(e)}")

@router.put("/session-mode/{session_id}")
async def update_session_mode(session_id: str, mode: str = None):
    """Update the query mode for a session."""
    try:
        if mode not in ["global", "local"]:
            raise HTTPException(status_code=400, detail="Mode must be 'global' or 'local'")

        success = await rag_service.update_query_mode(session_id, mode)
        if not success:
            raise HTTPException(status_code=404, detail="Session not found")

        return {"message": f"Query mode updated to {mode}", "session_id": session_id, "new_mode": mode}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating session mode: {str(e)}")

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete a chat session and its logs."""
    try:
        db = next(get_db())
        try:
            # Delete chat logs first (due to foreign key constraint)
            db.query(ChatLog).filter(ChatLog.session_id == UUID(session_id)).delete()

            # Delete the session
            deleted_count = db.query(ChatSession).filter(ChatSession.id == UUID(session_id)).delete()

            if deleted_count == 0:
                raise HTTPException(status_code=404, detail="Session not found")

            db.commit()
            return {"message": "Session deleted successfully"}
        finally:
            db.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting session: {str(e)}")

# The main app will be created in main.py