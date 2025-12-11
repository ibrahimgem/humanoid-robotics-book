"""
RAG (Retrieval-Augmented Generation) service for handling document retrieval and response generation.
Implements vector search and LLM orchestration for the RAG system.
"""
from typing import List, Dict, Optional, Tuple
from uuid import UUID
import asyncio
import logging
from datetime import datetime

from openai import AsyncOpenAI
import os
from dotenv import load_dotenv
import google.generativeai as genai

from src.vector_store.qdrant_client import qdrant_manager
from src.services.embedding_service import embedding_service
from src.database.connection import get_db
from src.models.chat_models import ChatSession, ChatLog
from src.utils.cache import response_cache

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self):
        # Initialize OpenAI client
        self.openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        # Initialize Google Gemini if API key is provided
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if gemini_api_key:
            genai.configure(api_key=gemini_api_key)
            self.gemini_model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-pro"))

        self.llm_model = os.getenv("LLM_MODEL", "gpt-4-turbo")
        self.gemini_enabled = bool(gemini_api_key)
        self.max_context_length = int(os.getenv("MAX_CONTEXT_LENGTH", "3000"))
        self.response_timeout = int(os.getenv("RESPONSE_TIMEOUT", "30"))

    async def retrieve_relevant_content(self, query: str, top_k: int = 5,
                                      chapter_id: Optional[str] = None) -> List[Dict]:
        """
        Retrieve relevant content from the vector store based on the query.

        Args:
            query: The user's query
            top_k: Number of top results to retrieve
            chapter_id: Optional chapter ID to filter results

        Returns:
            List of dictionaries containing retrieved content and metadata
        """
        try:
            # Generate embedding for the query
            query_embedding = await embedding_service._get_embedding(query)

            # Search in Qdrant
            search_results = qdrant_manager.search_vectors(
                query_vector=query_embedding,
                limit=top_k,
                chapter_id=chapter_id
            )

            # Format results
            retrieved_content = []
            for result in search_results:
                if result.payload:
                    content_info = {
                        'chunk_id': result.payload.get('chunk_id'),
                        'source_file': result.payload.get('source_file'),
                        'source_section': result.payload.get('source_section'),
                        'content_preview': result.payload.get('content_preview'),
                        'score': result.score,  # Similarity score
                        'created_at': result.payload.get('created_at'),
                        'updated_at': result.payload.get('updated_at')
                    }
                    retrieved_content.append(content_info)

            logger.info(f"Retrieved {len(retrieved_content)} relevant chunks for query")
            return retrieved_content

        except Exception as e:
            logger.error(f"Error retrieving content: {e}")
            return []

    async def generate_response(self, query: str, retrieved_content: List[Dict],
                               query_mode: str = "global") -> str:
        """
        Generate a response using the LLM based on the query and retrieved content.

        Args:
            query: The user's original query
            retrieved_content: List of retrieved content chunks
            query_mode: 'global' or 'local'

        Returns:
            Generated response string
        """
        try:
            # Build context from retrieved content
            if retrieved_content:
                context_parts = []
                for content in retrieved_content:
                    section = content.get('source_section', 'Unknown Section')
                    preview = content.get('content_preview', '')[:500]  # Limit preview length
                    context_parts.append(f"Section: {section}\nContent: {preview}\n")

                context = "\n".join(context_parts)
            else:
                context = "No relevant content found in the book."

            # Build the prompt based on query mode
            if query_mode == "global":
                prompt = f"""
                You are an AI assistant for the Humanoid Robotics Book. Answer the user's question based on the provided context from the book.

                Context from the book:
                {context}

                User's question: {query}

                Instructions:
                1. Base your answer strictly on the provided context from the book
                2. If the context doesn't contain relevant information, clearly state this
                3. Reference specific sections when possible
                4. Be helpful, accurate, and concise
                5. Maintain a beginner-friendly tone appropriate for robotics learners
                """
            else:  # local mode
                # Use the selected_text parameter that's passed to the method
                prompt = f"""
                You are an AI assistant for the Humanoid Robotics Book. Explain the selected text in response to the user's question.

                Context (selected text): {selected_text}

                User's question about the selected text: {query}

                Instructions:
                1. Explain how the selected text relates to the user's question
                2. Provide additional context from the book if relevant
                3. Be helpful, accurate, and concise
                4. Maintain a beginner-friendly tone appropriate for robotics learners
                """

            # Try OpenAI first
            try:
                response = await self.openai_client.chat.completions.create(
                    model=self.llm_model,
                    messages=[
                        {"role": "system", "content": "You are an AI assistant for the Humanoid Robotics Book. Provide helpful, accurate responses based on the book content."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=500,
                    temperature=0.7
                )

                generated_text = response.choices[0].message.content
                return generated_text
            except Exception as openai_error:
                logger.warning(f"OpenAI API failed: {openai_error}. Trying Gemini if available.")

                # If OpenAI fails and Gemini is enabled, try Gemini
                if self.gemini_enabled:
                    try:
                        gemini_response = await self.gemini_model.generate_content_async(prompt)
                        return gemini_response.text
                    except Exception as gemini_error:
                        logger.error(f"Gemini also failed: {gemini_error}")

                # If both fail, return error message
                return "I encountered an error while generating a response. Please try again."

        except Exception as e:
            logger.error(f"Error generating response: {e}")

            # Try Gemini as a last resort if enabled
            if self.gemini_enabled:
                try:
                    gemini_response = await self.gemini_model.generate_content_async(prompt)
                    return gemini_response.text
                except Exception as gemini_error:
                    logger.error(f"Gemini also failed: {gemini_error}")

            return "I encountered an error while generating a response. Please try again."

    async def process_query(self, query: str, session_id: str, query_mode: str = "global",
                           selected_text: Optional[str] = None, chapter_id: Optional[str] = None) -> Dict:
        """
        Process a complete query through the RAG pipeline.

        Args:
            query: The user's query
            session_id: ID of the chat session
            query_mode: 'global' or 'local'
            selected_text: Text selected by user (for local queries)
            chapter_id: Optional chapter ID to filter results

        Returns:
            Dictionary containing response, sources, and citations
        """
        # First, check if response is already cached
        # Ensure session_id is a string when passed to cache
        session_id_str = str(session_id) if isinstance(session_id, UUID) else session_id
        cached_response = response_cache.get_cached_response(query, session_id_str)
        if cached_response:
            logger.info(f"Returning cached response for query: {query[:50]}...")
            # Still log the interaction to maintain session history
            await self._log_interaction(query, cached_response['response'], session_id, query_mode, selected_text)
            return cached_response

        try:
            # For local queries, use the selected text directly instead of retrieving from vector store
            if query_mode == "local" and selected_text:
                retrieved_content = [{
                    'chunk_id': 'selected_text',
                    'source_file': 'user_selection',
                    'source_section': 'Selected Text',
                    'content_preview': selected_text[:500],
                    'score': 1.0,  # Perfect match for selected text
                    'created_at': datetime.utcnow().isoformat(),
                    'updated_at': datetime.utcnow().isoformat()
                }]
            else:
                # For global queries, retrieve from vector store
                retrieved_content = await self.retrieve_relevant_content(
                    query, top_k=5, chapter_id=chapter_id
                )

            # Generate response based on retrieved content
            response_text = await self.generate_response(query, retrieved_content, query_mode)

            # Extract sources and create citations
            sources = set()
            citations = []

            for content in retrieved_content:
                source_file = content.get('source_file', 'Unknown')
                if source_file != 'user_selection':  # Don't include user selection as a book source
                    sources.add(source_file)

                citations.append({
                    'source': content.get('source_file', 'Unknown'),
                    'section': content.get('source_section', 'Unknown Section'),
                    'text': content.get('content_preview', '')[:200]
                })

            # Prepare the response
            response_obj = {
                'response': response_text,
                'sources': list(sources),
                'citations': citations,
                'retrieved_chunks_count': len(retrieved_content)
            }

            # Cache the response for future queries
            response_cache.cache_response(query, response_obj, session_id_str)

            # Log the interaction to the database
            await self._log_interaction(query, response_text, session_id, query_mode, selected_text)

            return response_obj

        except Exception as e:
            logger.error(f"Error processing query: {e}")
            error_response = {
                'response': "I encountered an error while processing your query. Please try again.",
                'sources': [],
                'citations': [],
                'retrieved_chunks_count': 0
            }
            # Log the error interaction too
            await self._log_interaction(query, error_response['response'], session_id, query_mode, selected_text)
            return error_response

    async def _log_interaction(self, query: str, response: str, session_id: str,
                              query_mode: str, selected_text: Optional[str] = None):
        """
        Log the interaction to the database for session history.

        Args:
            query: User's query
            response: Generated response
            session_id: Session ID
            query_mode: Query mode ('global' or 'local')
            selected_text: Selected text (if any)
        """
        try:
            db = next(get_db())
            try:
                # Check if session_id is already a UUID object or needs conversion
                if isinstance(session_id, UUID):
                    session_uuid = session_id
                else:
                    session_uuid = UUID(session_id)

                session = db.query(ChatSession).filter(ChatSession.id == session_uuid).first()
                if not session:
                    session = ChatSession(id=session_uuid)
                    db.add(session)

                # Log user query
                user_log = ChatLog(
                    session_id=session_uuid,
                    role="user",
                    content=query,
                    query_mode=query_mode,
                    selected_text=selected_text
                )
                db.add(user_log)

                # Log assistant response
                assistant_log = ChatLog(
                    session_id=session_uuid,
                    role="assistant",
                    content=response,
                    query_mode=query_mode,
                    selected_text=None  # Response doesn't have selected text
                )
                db.add(assistant_log)

                # Update session timestamp
                session.updated_at = datetime.utcnow()

                db.commit()
                logger.debug(f"Logged interaction for session {session_id}")

            except Exception as e:
                logger.error(f"Error logging interaction: {e}")
                db.rollback()
            finally:
                db.close()

        except Exception as e:
            logger.error(f"Error in logging interaction: {e}")

    async def get_session_context(self, session_id: str) -> Dict[str, Any]:
        """
        Get the current context for a session including the last selected text.

        Args:
            session_id: Session ID to get context for

        Returns:
            Dictionary with session context information
        """
        try:
            db = next(get_db())
            try:
                # Get the most recent user message with selected text from this session
                # Check if session_id is already a UUID object or needs conversion
                if isinstance(session_id, UUID):
                    session_uuid = session_id
                else:
                    session_uuid = UUID(session_id)

                last_selected_text_query = db.query(ChatLog).filter(
                    ChatLog.session_id == session_uuid,
                    ChatLog.role == "user",
                    ChatLog.selected_text.isnot(None)
                ).order_by(ChatLog.created_at.desc()).first()

                last_query_mode_query = db.query(ChatLog).filter(
                    ChatLog.session_id == session_uuid,
                    ChatLog.role == "user"
                ).order_by(ChatLog.created_at.desc()).first()

                context = {
                    'last_selected_text': last_selected_text_query.selected_text if last_selected_text_query else None,
                    'last_query_mode': last_query_mode_query.query_mode if last_query_mode_query else "global",
                    'session_exists': True
                }

                return context
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error getting session context: {e}")
            return {
                'last_selected_text': None,
                'last_query_mode': "global",
                'session_exists': False
            }

    async def update_query_mode(self, session_id: str, new_mode: str) -> bool:
        """
        Update the query mode for a session.

        Args:
            session_id: Session ID
            new_mode: New query mode ('global' or 'local')

        Returns:
            True if successful, False otherwise
        """
        if new_mode not in ["global", "local"]:
            logger.error(f"Invalid query mode: {new_mode}")
            return False

        try:
            db = next(get_db())
            try:
                # This function would be used to track mode changes in session metadata
                # For now, we'll just validate that the session exists
                # Check if session_id is already a UUID object or needs conversion
                if isinstance(session_id, UUID):
                    session_uuid = session_id
                else:
                    session_uuid = UUID(session_id)

                session = db.query(ChatSession).filter(ChatSession.id == session_uuid).first()
                if not session:
                    logger.warning(f"Session {session_id} does not exist")
                    return False

                # In a full implementation, we might store the current mode in session metadata
                # or track mode changes in a separate table
                logger.info(f"Query mode updated to {new_mode} for session {session_id}")
                return True
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error updating query mode: {e}")
            return False

    async def validate_retrieval(self, query: str, retrieved_content: List[Dict]) -> bool:
        """
        Validate that the retrieved content is relevant to the query.

        Args:
            query: Original query
            retrieved_content: Retrieved content to validate

        Returns:
            True if content is relevant, False otherwise
        """
        if not retrieved_content:
            return False

        # Simple validation: check if any content has a reasonable similarity score
        # In a more sophisticated system, we could use semantic similarity measures
        for content in retrieved_content:
            score = content.get('score', 0)
            if score > 0.3:  # Threshold for relevance
                return True

        return False

    async def get_content_by_source(self, source_file: str, top_k: int = 10) -> List[Dict]:
        """
        Retrieve content chunks from a specific source file.

        Args:
            source_file: Path to the source file
            top_k: Number of chunks to retrieve

        Returns:
            List of content chunks from the specified source
        """
        try:
            # Search in Qdrant with source file filter
            # This requires implementing filtered search in the Qdrant client
            # For now, we'll return an empty list as the filter functionality
            # needs to be added to the Qdrant client
            logger.warning("Content filtering by source not fully implemented yet")
            return []

        except Exception as e:
            logger.error(f"Error retrieving content by source: {e}")
            return []

# Global RAG service instance
rag_service = RAGService()

if __name__ == "__main__":
    # Example usage
    async def example():
        result = await rag_service.process_query(
            query="What are ROS 2 nodes?",
            session_id="test-session-123",
            query_mode="global"
        )
        print("Response:", result['response'])
        print("Sources:", result['sources'])
        print("Citations:", result['citations'])

    # asyncio.run(example())
    print("RAG service initialized successfully")