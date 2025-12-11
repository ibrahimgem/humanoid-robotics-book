"""
Embedding service for generating vector embeddings asynchronously.
Uses OpenAI's embedding API to create vector representations of content.
"""
import asyncio
import logging
from typing import List, Dict, Optional
from openai import AsyncOpenAI
from uuid import uuid4
import os
from dotenv import load_dotenv
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

from src.database.connection import get_db
from src.models.chat_models import KnowledgeChunk
from src.vector_store.qdrant_client import qdrant_manager
from src.utils.hash_utils import ContentHasher

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.embedding_model = os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")
        self.max_retries = 3
        self.rate_limit_delay = 1.0  # seconds between requests to respect rate limits
        self.executor = ThreadPoolExecutor(max_workers=4)

    async def generate_embeddings(self, chunks: List[Dict]) -> List[Dict]:
        """
        Generate embeddings for a list of content chunks.

        Args:
            chunks: List of chunk dictionaries with content to embed

        Returns:
            List of dictionaries with chunk_id and embedding vectors
        """
        embeddings = []

        for i, chunk in enumerate(chunks):
            try:
                # Add a small delay to respect rate limits
                if i > 0:
                    await asyncio.sleep(self.rate_limit_delay)

                # Generate embedding for the content
                embedding = await self._get_embedding(chunk['content'])

                embedding_result = {
                    'id': chunk['chunk_id'],
                    'vector': embedding,
                    'payload': {
                        'chunk_id': chunk['chunk_id'],
                        'chapter_id': self._extract_chapter_id(chunk['source_file']),
                        'source_file': chunk['source_file'],
                        'source_section': chunk['source_section'],
                        'content_preview': chunk['content_preview'],
                        'created_at': datetime.utcnow().isoformat(),
                        'updated_at': datetime.utcnow().isoformat()
                    }
                }

                embeddings.append(embedding_result)

                # Update the chunk's embedding status in the database
                await self._update_chunk_status(chunk['chunk_id'], 'processed')

                logger.info(f"Processed embedding for chunk {chunk['chunk_id'][:8]}...")

            except Exception as e:
                logger.error(f"Error generating embedding for chunk {chunk['chunk_id']}: {e}")
                await self._update_chunk_status(chunk['chunk_id'], 'failed')

        return embeddings

    async def _get_embedding(self, text: str) -> List[float]:
        """
        Get embedding vector for a text using OpenAI API.

        Args:
            text: Text to generate embedding for

        Returns:
            List of floats representing the embedding vector
        """
        # Truncate text if it's too long (OpenAI has token limits)
        max_length = 8191  # Conservative limit for OpenAI's text-embedding-ada-002
        if len(text) > max_length:
            text = text[:max_length]
            logger.warning(f"Truncated text from {len(text)} to {max_length} characters for embedding")

        for attempt in range(self.max_retries):
            try:
                response = await self.openai_client.embeddings.create(
                    input=text,
                    model=self.embedding_model
                )

                embedding = response.data[0].embedding
                return embedding

            except Exception as e:
                logger.warning(f"Attempt {attempt + 1} failed to get embedding: {e}")
                if attempt == self.max_retries - 1:
                    raise
                await asyncio.sleep(2 ** attempt)  # Exponential backoff

    def _extract_chapter_id(self, source_file: str) -> str:
        """
        Extract chapter ID from source file path.

        Args:
            source_file: Source file path like '/docs/ros2/nodes-topics-services.mdx'

        Returns:
            Chapter ID like 'ros2'
        """
        # Extract the chapter from the path (second directory in the path)
        parts = source_file.strip('/').split('/')
        if len(parts) >= 2:
            return parts[1]  # e.g., 'ros2' from '/docs/ros2/nodes-topics-services.mdx'
        return 'general'  # default chapter ID

    async def _update_chunk_status(self, chunk_id: str, status: str):
        """
        Update the embedding status of a chunk in the database.

        Args:
            chunk_id: ID of the chunk to update
            status: New status ('processed', 'failed', etc.)
        """
        from sqlalchemy.orm import Session
        from sqlalchemy import create_engine
        from src.models.chat_models import KnowledgeChunk

        # Get a fresh database session
        db = next(get_db())
        try:
            # Update the knowledge chunk status
            chunk = db.query(KnowledgeChunk).filter(KnowledgeChunk.id == chunk_id).first()
            if chunk:
                chunk.embedding_status = status
                chunk.updated_at = datetime.utcnow()
                db.commit()
                logger.debug(f"Updated chunk {chunk_id} status to {status}")
        except Exception as e:
            logger.error(f"Error updating chunk {chunk_id} status: {e}")
            db.rollback()
        finally:
            db.close()

    async def process_and_store_embeddings(self, chunks: List[Dict]):
        """
        Process chunks to generate embeddings and store them in vector database.

        Args:
            chunks: List of chunk dictionaries to process

        Returns:
            Boolean indicating success or failure
        """
        try:
            logger.info(f"Starting embedding generation for {len(chunks)} chunks")

            # First, update all chunks to 'in_progress' status
            for chunk in chunks:
                await self._update_chunk_status(chunk['chunk_id'], 'in_progress')

            # Generate embeddings
            embeddings = await self.generate_embeddings(chunks)

            # Store embeddings in Qdrant
            success = qdrant_manager.upsert_vectors(embeddings)

            if success:
                logger.info(f"Successfully stored {len(embeddings)} embeddings in Qdrant")
                return True
            else:
                logger.error("Failed to store embeddings in Qdrant")
                # Mark failed chunks
                for chunk in chunks:
                    if chunk.get('embedding_status') != 'processed':
                        await self._update_chunk_status(chunk['chunk_id'], 'failed')
                return False

        except Exception as e:
            logger.error(f"Error in process_and_store_embeddings: {e}")
            # Mark all chunks as failed
            for chunk in chunks:
                await self._update_chunk_status(chunk['chunk_id'], 'failed')
            return False

    async def process_single_chunk(self, chunk: Dict):
        """
        Process a single chunk to generate and store its embedding.

        Args:
            chunk: Single chunk dictionary to process

        Returns:
            Boolean indicating success or failure
        """
        try:
            # Update status to in_progress
            await self._update_chunk_status(chunk['chunk_id'], 'in_progress')

            # Generate embedding
            embeddings_data = await self.generate_embeddings([chunk])

            # Store in Qdrant
            success = qdrant_manager.upsert_vectors(embeddings_data)

            if success:
                logger.info(f"Successfully processed single chunk {chunk['chunk_id']}")
                return True
            else:
                logger.error(f"Failed to store embedding for chunk {chunk['chunk_id']}")
                await self._update_chunk_status(chunk['chunk_id'], 'failed')
                return False

        except Exception as e:
            logger.error(f"Error processing single chunk {chunk['chunk_id']}: {e}")
            await self._update_chunk_status(chunk['chunk_id'], 'failed')
            return False

# Global embedding service instance
embedding_service = EmbeddingService()

# Example usage in a background task
async def background_embedding_task(chunks: List[Dict]):
    """
    Example background task function for processing embeddings.
    This could be called by a scheduler or message queue.
    """
    logger.info(f"Starting background embedding task for {len(chunks)} chunks")
    success = await embedding_service.process_and_store_embeddings(chunks)
    if success:
        logger.info("Background embedding task completed successfully")
    else:
        logger.error("Background embedding task failed")
    return success

if __name__ == "__main__":
    # Example usage
    sample_chunks = [
        {
            'chunk_id': str(uuid4()),
            'content': 'ROS 2 is a flexible framework for writing robot software. It is a collection of software libraries and tools that help you build robot applications.',
            'source_file': '/docs/ros2/introduction.mdx',
            'source_section': 'Introduction to ROS 2',
            'content_preview': 'ROS 2 is a flexible framework for writing robot software...',
            'embedding_status': 'pending'
        }
    ]

    # Process the sample chunks
    # asyncio.run(background_embedding_task(sample_chunks))
    print("Embedding service module loaded successfully")