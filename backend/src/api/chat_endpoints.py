"""
Chat endpoints for the RAG AI Chatbot
API endpoints for chat interactions
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import uuid
from ..models.query import QueryCreate
from ..services.chat_service import chat_service
from ..agents.orchestration_agent.query_handler import QueryHandler

# Create router for chat endpoints
router = APIRouter()

@router.post("/chat")
async def chat(query_data: QueryCreate):
    """Submit a query to the chatbot"""
    try:
        # Process the query through the chat service
        response = await chat_service.process_query(query_data)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")


@router.post("/chat/educational")
async def chat_educational(query_data: QueryCreate):
    """Submit a query to the chatbot with educational focus"""
    try:
        # Process the query through the chat service with educational focus
        response = await chat_service.process_educational_query(query_data)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing educational query: {str(e)}")


@router.post("/chat/stream")
async def chat_stream(query_data: QueryCreate):
    """Submit a query to the chatbot with streaming response"""
    try:
        # For now, return the same response as regular chat
        # In a real implementation, this would stream the response
        response = await chat_service.process_query(query_data)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing stream query: {str(e)}")


@router.post("/query-mode")
async def set_query_mode(session_id: str, mode: str):
    """Set the query mode (global or selected-text)"""
    try:
        result = await chat_service.set_query_mode(session_id, mode)
        if not result.get("success", False):
            raise HTTPException(status_code=400, detail=result.get("error", "Invalid query mode"))

        return {
            "success": True,
            "mode": result.get("mode")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error setting query mode: {str(e)}")


@router.post("/session")
async def create_session():
    """Create a new user session"""
    try:
        from ..models.user_session import UserSessionCreate
        session_data = UserSessionCreate()
        session = await chat_service.create_session(session_data)

        return {
            "session_id": session.session_id,
            "created_at": session.start_time
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating session: {str(e)}")


@router.get("/chat/health")
async def chat_health():
    """Health check for the chat service"""
    try:
        health_status = await chat_service.health_check()
        return {"status": "healthy" if health_status else "unhealthy"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


@router.get("/chat/stats")
async def get_chat_stats():
    """Get chat statistics"""
    try:
        # For now, return basic stats
        # In a real implementation, this would return actual statistics
        return {
            "total_queries": len(chat_service.chat_logs),
            "active_sessions": len(chat_service.sessions),
            "status": "operational"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting stats: {str(e)}")