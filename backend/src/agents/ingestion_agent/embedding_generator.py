"""
Embedding generator for the Ingestion Agent
Handles generation of embeddings for content chunks
"""
from typing import List, Dict, Any
import asyncio
from ...services.embedding_service import embedding_service


class IngestionEmbeddingGenerator:
    """Embedding generator specifically for the ingestion agent"""

    def __init__(self):
        """Initialize the ingestion embedding generator"""
        self.embedding_service = embedding_service

    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for a text chunk"""
        embedding = await self.embedding_service.generate_embedding(text)
        return embedding

    async def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a batch of text chunks"""
        embeddings = await self.embedding_service.generate_embeddings_batch(texts)
        return embeddings

    async def process_chunk(self, chunk: Dict[str, Any]) -> Dict[str, Any]:
        """Process a chunk by generating its embedding"""
        content = chunk.get('content', '')
        embedding = await self.generate_embedding(content)

        # Add embedding to the chunk
        processed_chunk = chunk.copy()
        processed_chunk['embedding'] = embedding
        processed_chunk['embedding_model'] = 'gemini-embedding-001'  # Placeholder

        return processed_chunk

    async def process_chunks(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process multiple chunks by generating their embeddings"""
        processed_chunks = []
        for chunk in chunks:
            processed_chunk = await self.process_chunk(chunk)
            processed_chunks.append(processed_chunk)

        return processed_chunks

    async def validate_embedding(self, embedding: List[float]) -> bool:
        """Validate that an embedding is appropriate"""
        if not embedding or len(embedding) == 0:
            return False

        # Check for embedding size consistency (768 for Gemini)
        if len(embedding) != 768:
            return False

        # Check for valid float values
        if any(not isinstance(val, (int, float)) or val != val for val in embedding):  # Check for NaN
            return False

        return True