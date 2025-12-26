"""
Chat service for the RAG AI Chatbot
Handles chat interactions and coordinates agents
"""
from typing import Dict, Any, List
import uuid
import asyncio
from datetime import datetime
from ..agents.orchestration_agent.query_handler import QueryHandler
from ..models.query import Query, QueryCreate, QueryMode
from ..models.user_session import UserSession, UserSessionCreate
from ..models.chat_log import ChatLog, ChatLogCreate
from ..utils.logger import logger


class ChatService:
    """Service class for chat interactions"""

    def __init__(self):
        """Initialize the chat service"""
        self.query_handler = QueryHandler()
        self.sessions: Dict[str, UserSession] = {}
        self.chat_logs: List[ChatLog] = []

    async def create_session(self, session_data: UserSessionCreate = None) -> UserSession:
        """Create a new user session"""
        if not session_data:
            session_data = UserSessionCreate()

        session_id = str(uuid.uuid4())
        session = UserSession(
            session_id=session_id,
            user_id=session_data.user_id,
            metadata=session_data.metadata
        )

        self.sessions[session_id] = session
        logger.info(f"Created new session: {session_id}")

        return session

    async def get_session(self, session_id: str) -> UserSession:
        """Get an existing user session"""
        return self.sessions.get(session_id)

    async def process_query(self, query_data: QueryCreate) -> Dict[str, Any]:
        """Process a user query through the agents"""
        # Create a query object
        query = Query(
            question_text=query_data.question_text,
            query_mode=query_data.query_mode,
            selected_text=query_data.selected_text,
            session_id=query_data.session_id,
            user_id=query_data.user_id
        )

        # Validate the query
        is_valid = await self.query_handler.validate_query(query)
        if not is_valid:
            return {
                "response": "Please provide a valid question (at least 3 characters).",
                "sources": [],
                "follow_up_questions": [],
                "tone_analysis": {},
                "query_id": query.query_id,
                "response_time_ms": 0
            }

        # Handle the query using the orchestration agent
        start_time = datetime.now()
        result = await self.query_handler.handle_query(query)
        response_time = (datetime.now() - start_time).total_seconds() * 1000

        # Update session last interaction
        if query.session_id and query.session_id in self.sessions:
            session = self.sessions[query.session_id]
            session.last_interaction = datetime.now()

        # Log the interaction with quality metrics
        chat_log = ChatLogCreate(
            query_id=result.get("query_id", ""),
            response_text=result.get("response", ""),
            relevance_score=None  # Could be added later based on user feedback
        )
        tone_analysis = result.get("tone_analysis", {})
        await self.log_interaction(chat_log, tone_analysis)

        logger.log_response_time("/api/chat", response_time)

        # Ensure the result has all required fields for the API response
        if "follow_up_questions" not in result:
            result["follow_up_questions"] = []
        if "tone_analysis" not in result:
            result["tone_analysis"] = {}

        return result

    async def process_educational_query(self, query_data: QueryCreate) -> Dict[str, Any]:
        """Process a user query with educational focus"""
        # Create a query object
        query = Query(
            question_text=query_data.question_text,
            query_mode=query_data.query_mode,
            selected_text=query_data.selected_text,
            session_id=query_data.session_id,
            user_id=query_data.user_id
        )

        # Validate the query
        is_valid = await self.query_handler.validate_query(query)
        if not is_valid:
            return {
                "response": "Please provide a valid question (at least 3 characters).",
                "sources": [],
                "follow_up_questions": [],
                "tone_analysis": {},
                "query_id": query.query_id,
                "response_time_ms": 0
            }

        # Handle the query using the orchestration agent with educational focus
        start_time = datetime.now()
        result = await self.query_handler.handle_educational_query(query)
        response_time = (datetime.now() - start_time).total_seconds() * 1000

        # Update session last interaction
        if query.session_id and query.session_id in self.sessions:
            session = self.sessions[query.session_id]
            session.last_interaction = datetime.now()

        # Log the interaction with quality metrics
        chat_log = ChatLogCreate(
            query_id=result.get("query_id", ""),
            response_text=result.get("response", ""),
            relevance_score=None  # Could be added later based on user feedback
        )
        tone_analysis = result.get("tone_analysis", {})
        await self.log_interaction(chat_log, tone_analysis)

        logger.log_response_time("/api/chat", response_time)

        # Ensure the result has all required fields for the API response
        if "follow_up_questions" not in result:
            result["follow_up_questions"] = []
        if "tone_analysis" not in result:
            result["tone_analysis"] = {}

        return result

    async def log_interaction(self, chat_log_data: ChatLogCreate, tone_analysis: Dict[str, Any] = None):
        """Log a chat interaction"""
        chat_log = ChatLog(
            query_id=chat_log_data.query_id,
            response_text=chat_log_data.response_text,
            relevance_score=chat_log_data.relevance_score,
            user_feedback=chat_log_data.user_feedback
        )
        self.chat_logs.append(chat_log)

        # Log quality metrics if available
        if tone_analysis:
            educational_quality = tone_analysis.get('educational_quality', 0.0)
            logger.info(f"Response quality metrics for query {chat_log.query_id}: "
                       f"educational_quality={educational_quality:.2f}, "
                       f"technical_accuracy={tone_analysis.get('technical_accuracy', 0.0):.2f}, "
                       f"readability={tone_analysis.get('readability_score', 0.0):.2f}")

        logger.info(f"Logged interaction for query {chat_log.query_id}")

    async def set_query_mode(self, session_id: str, mode: str) -> Dict[str, Any]:
        """Set the query mode for a session"""
        result = await self.query_handler.set_query_mode(session_id, mode)
        return result

    async def health_check(self) -> bool:
        """Health check for the chat service"""
        try:
            # Check if query handler is healthy
            handler_healthy = await self.query_handler.health_check()
            return handler_healthy
        except Exception as e:
            logger.error(f"Chat service health check failed: {str(e)}")
            return False


# Global chat service instance
chat_service = ChatService()