"""
Text chunker for the Ingestion Agent
Handles chunking of content for embedding
"""
from typing import List, Dict, Any
import asyncio
from ...utils.text_chunker import text_chunker


class IngestionTextChunker:
    """Text chunker specifically for the ingestion agent"""

    def __init__(self, chunk_size: int = 1000, overlap: int = 100):
        """Initialize the ingestion text chunker"""
        self.chunk_size = chunk_size
        self.overlap = overlap
        self.chunker = text_chunker

    async def chunk_content(self, content: str, source_document: str = "", source_section: str = "") -> List[Dict[str, Any]]:
        """Chunk content for ingestion"""
        chunks = self.chunker.chunk_text(content, source_document, source_section)
        return chunks

    async def chunk_by_sections(self, parsed_content: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Chunk content based on document sections"""
        chunks = self.chunker.chunk_by_sections(parsed_content)
        return chunks

    async def validate_chunk(self, chunk: str) -> bool:
        """Validate that a chunk is appropriate for embedding"""
        if not chunk or len(chunk.strip()) == 0:
            return False

        # Check for minimum length
        if len(chunk) < 10:
            return False

        # Check for maximum length to avoid oversized embeddings
        if len(chunk) > 2000:  # Adjust as needed
            return False

        return True

    async def process_content(self, content: str, source_document: str = "", source_section: str = "") -> List[Dict[str, Any]]:
        """Process content by chunking and validating"""
        chunks = await self.chunk_content(content, source_document, source_section)

        # Validate each chunk
        valid_chunks = []
        for chunk in chunks:
            if await self.validate_chunk(chunk['content']):
                valid_chunks.append(chunk)

        return valid_chunks