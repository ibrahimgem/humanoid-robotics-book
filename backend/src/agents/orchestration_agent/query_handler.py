"""
Query handler for the Orchestration Agent
Handles coordinating the other agents and managing query flow
"""
from typing import Dict, Any, List
import uuid
import asyncio
from datetime import datetime
from ...agents.retrieval_agent.vector_search import VectorSearch
from ...agents.answer_generation_agent.response_generator import ResponseGenerator
from ...models.query import Query, QueryMode
from ...utils.logger import logger


class QueryHandler:
    """Query handler for the orchestration agent"""

    def __init__(self, top_k: int = 5):
        """Initialize the query handler"""
        self.vector_search = VectorSearch(top_k=top_k)
        self.response_generator = ResponseGenerator()
        self.top_k = top_k

    async def handle_query(self, query_data: Query) -> Dict[str, Any]:
        """Handle a query by coordinating the other agents"""
        start_time = datetime.now()

        try:
            # Log the incoming query
            logger.info(f"Processing query: {query_data.question_text[:50]}...")

            # Get relevant context chunks based on query mode
            if query_data.query_mode == QueryMode.SELECTED_TEXT and query_data.selected_text:
                # Use selected text mode
                context_chunks = await self.vector_search.get_context_chunks(
                    query_data.question_text,
                    query_data.selected_text
                )
            else:
                # Use global search mode
                context_chunks = await self.vector_search.get_context_chunks(
                    query_data.question_text
                )

            # Generate response using the context
            response_data = await self.response_generator.generate_response(
                query_data.question_text,
                context_chunks,
                query_data.query_mode.value
            )

            # Calculate response time
            response_time = (datetime.now() - start_time).total_seconds() * 1000  # Convert to milliseconds

            # Update response data with query ID and response time
            response_data["query_id"] = query_data.query_id
            response_data["response_time_ms"] = int(response_time)

            # Log successful response
            logger.info(f"Query {query_data.query_id} processed in {response_time}ms")

            return response_data

        except Exception as e:
            logger.error(f"Error handling query: {str(e)}")
            response_time = (datetime.now() - start_time).total_seconds() * 1000
            return {
                "response": "Sorry, I encountered an error while processing your request.",
                "sources": [],
                "query_id": query_data.query_id,
                "response_time_ms": int(response_time)
            }

    async def handle_educational_query(self, query_data: Query) -> Dict[str, Any]:
        """Handle a query with educational focus"""
        start_time = datetime.now()

        try:
            # Log the incoming query
            logger.info(f"Processing educational query: {query_data.question_text[:50]}...")

            # Get relevant context chunks based on query mode
            if query_data.query_mode == QueryMode.SELECTED_TEXT and query_data.selected_text:
                # Use selected text mode
                context_chunks = await self.vector_search.get_context_chunks(
                    query_data.question_text,
                    query_data.selected_text
                )
            else:
                # Use global search mode
                context_chunks = await self.vector_search.get_context_chunks(
                    query_data.question_text
                )

            # Generate educational response using the context
            response_data = await self.response_generator.generate_educational_response(
                query_data.question_text,
                context_chunks
            )

            # Calculate response time
            response_time = (datetime.now() - start_time).total_seconds() * 1000  # Convert to milliseconds

            # Update response data with query ID and response time
            response_data["query_id"] = query_data.query_id
            response_data["response_time_ms"] = int(response_time)

            # Log successful response
            logger.info(f"Educational query {query_data.query_id} processed in {response_time}ms")

            return response_data

        except Exception as e:
            logger.error(f"Error handling educational query: {str(e)}")
            response_time = (datetime.now() - start_time).total_seconds() * 1000
            return {
                "response": "Sorry, I encountered an error while processing your request.",
                "sources": [],
                "query_id": query_data.query_id,
                "response_time_ms": int(response_time)
            }

    async def validate_query(self, query_data: Query) -> bool:
        """Validate that a query is appropriate for processing"""
        if not query_data.question_text or len(query_data.question_text.strip()) == 0:
            return False

        # Check for minimum length
        if len(query_data.question_text.strip()) < 3:
            return False

        # Check for maximum length to prevent overly long queries
        if len(query_data.question_text) > 1000:
            return False

        return True

    async def set_query_mode(self, session_id: str, mode: str) -> Dict[str, Any]:
        """Set the query mode for a session"""
        try:
            query_mode = QueryMode(mode)
            return {
                "success": True,
                "mode": query_mode.value
            }
        except ValueError:
            return {
                "success": False,
                "error": f"Invalid query mode: {mode}"
            }

    async def health_check(self) -> bool:
        """Health check for the query handler"""
        # Check if dependent services are available
        try:
            # Test vector search
            test_results = await self.vector_search.search_by_text("test", limit=1)
            # Test response generation
            test_response = await self.response_generator.generate_response(
                "test", [], "global"
            )
            return True
        except Exception as e:
            logger.error(f"Query handler health check failed: {str(e)}")
            return False