"""
Ingestion service for the RAG AI Chatbot
Handles the ingestion and processing of book content
"""
from typing import Dict, Any, List
import asyncio
import uuid
from datetime import datetime
from ..agents.ingestion_agent.content_parser import IngestionContentParser
from ..agents.ingestion_agent.text_chunker import IngestionTextChunker
from ..agents.ingestion_agent.embedding_generator import IngestionEmbeddingGenerator
from ..services.vector_storage_service import vector_storage_service
from ..models.book_content import BookContent, BookContentCreate
from ..utils.logger import logger


class IngestionService:
    """Service class for content ingestion and processing"""

    def __init__(self):
        """Initialize the ingestion service"""
        self.content_parser = IngestionContentParser()
        self.text_chunker = IngestionTextChunker()
        self.embedding_generator = IngestionEmbeddingGenerator()
        self.vector_storage = vector_storage_service
        self.jobs: Dict[str, Dict[str, Any]] = {}

    async def process_content(self, content_data: BookContentCreate, job_id: str = None):
        """Process content by parsing, chunking, and generating embeddings"""
        if not job_id:
            job_id = str(uuid.uuid4())

        # Initialize job status
        self.jobs[job_id] = {
            "status": "processing",
            "progress": 0,
            "details": "Starting content processing",
            "timestamp": datetime.now()
        }

        try:
            # Update job status
            self.jobs[job_id].update({
                "status": "processing",
                "progress": 10,
                "details": "Parsing content"
            })

            # Parse the content
            parsed_content = await self.content_parser.parse_content(
                content_data.content_text,
                content_data.document_path
            )

            # Update job status
            self.jobs[job_id].update({
                "progress": 30,
                "details": "Chunking content"
            })

            # Chunk the content
            chunks = await self.text_chunker.process_content(
                parsed_content['content'],
                content_data.document_path,
                parsed_content['title']
            )

            # Update job status
            self.jobs[job_id].update({
                "progress": 50,
                "details": f"Generating embeddings for {len(chunks)} chunks"
            })

            # Process chunks to generate embeddings
            processed_chunks = await self.embedding_generator.process_chunks(chunks)

            # Update job status
            self.jobs[job_id].update({
                "progress": 80,
                "details": f"Storing {len(processed_chunks)} chunks in vector storage"
            })

            # Store chunks in vector storage
            stored_count = 0
            for chunk_data in processed_chunks:
                chunk_id = str(uuid.uuid4())
                content = chunk_data['content']
                embedding = chunk_data['embedding']
                metadata = {
                    "source_document": chunk_data['source_document'],
                    "source_section": chunk_data['source_section'],
                    "original_title": parsed_content['title']
                }

                success = await self.vector_storage.store_embedding(
                    chunk_id, content, embedding, metadata
                )

                if success:
                    stored_count += 1

            # Update job status
            self.jobs[job_id].update({
                "status": "completed",
                "progress": 100,
                "details": f"Successfully processed and stored {stored_count} of {len(processed_chunks)} chunks"
            })

            logger.info(f"Ingestion job {job_id} completed: {stored_count} chunks stored")

        except Exception as e:
            self.jobs[job_id].update({
                "status": "failed",
                "progress": 100,
                "details": f"Error during processing: {str(e)}"
            })
            logger.error(f"Ingestion job {job_id} failed: {str(e)}")

    async def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """Get the status of an ingestion job"""
        return self.jobs.get(job_id)

    async def sync_content(self, content_paths: List[str]) -> Dict[str, Any]:
        """Synchronize content changes by re-ingesting updated content"""
        results = {
            "documents_synced": 0,
            "documents_failed": 0,
            "details": []
        }

        for path in content_paths:
            try:
                # For now, just simulate successful sync
                # In a real implementation, we would check if the content has changed
                # and reprocess only the changed content
                results["documents_synced"] += 1
                results["details"].append(f"Synced {path}")
            except Exception as e:
                results["documents_failed"] += 1
                results["details"].append(f"Failed to sync {path}: {str(e)}")

        return results

    async def health_check(self) -> bool:
        """Health check for the ingestion service"""
        # Check if we can access the vector storage
        try:
            # Try to initialize the collection to verify connection
            await self.vector_storage.init_collection()
            return True
        except Exception as e:
            logger.error(f"Ingestion service health check failed: {str(e)}")
            return False


# Global ingestion service instance
ingestion_service = IngestionService()