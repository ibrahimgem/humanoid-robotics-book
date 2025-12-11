"""
Semantic chunking algorithm for book content.
Implements intelligent text chunking for RAG system.
"""
import re
from typing import List, Dict, Tuple
import hashlib
from uuid import uuid4
from .content_parser import ContentParser

class SemanticChunker:
    def __init__(self, max_chunk_size: int = 1000, overlap: int = 200):
        self.max_chunk_size = max_chunk_size
        self.overlap = overlap

    def chunk_document(self, parsed_doc: Dict) -> List[Dict]:
        """
        Chunk a parsed document into semantic units.

        Args:
            parsed_doc: Dictionary containing parsed document information

        Returns:
            List of chunk dictionaries with content and metadata
        """
        content = parsed_doc['content']
        source_file = parsed_doc['source_file']
        title = parsed_doc.get('title', '')
        headings = parsed_doc.get('headings', [])

        # Split content into potential chunks based on semantic boundaries
        potential_chunks = self._split_by_semantic_boundaries(content, headings)

        # Further refine chunks to ensure they're within size limits
        final_chunks = []
        for chunk_text in potential_chunks:
            sub_chunks = self._ensure_size_limits(chunk_text)
            for i, sub_chunk in enumerate(sub_chunks):
                chunk_id = str(uuid4())
                content_hash = hashlib.sha256(sub_chunk.encode()).hexdigest()

                # Determine the most relevant heading for this chunk
                relevant_heading = self._find_relevant_heading(sub_chunk, headings)

                chunk_info = {
                    'chunk_id': chunk_id,
                    'content_hash': content_hash,
                    'source_file': source_file,
                    'source_section': relevant_heading or title,
                    'content_preview': sub_chunk[:200],  # First 200 chars
                    'content': sub_chunk,
                    'embedding_status': 'pending',  # Will be updated after embedding
                    'metadata': {
                        'original_title': title,
                        'headings_context': relevant_heading,
                        'chunk_index': len(final_chunks) + i
                    }
                }
                final_chunks.append(chunk_info)

        return final_chunks

    def _split_by_semantic_boundaries(self, content: str, headings: List[Dict]) -> List[str]:
        """
        Split content based on semantic boundaries like headings, paragraphs, etc.
        """
        # First, try to split by headings if available
        if headings:
            return self._split_by_headings(content, headings)
        else:
            # Fallback to paragraph-based splitting
            return self._split_by_paragraphs(content)

    def _split_by_headings(self, content: str, headings: List[Dict]) -> List[str]:
        """
        Split content based on headings structure.
        """
        # For now, we'll use a simple approach - split content into paragraphs
        # and group them sensibly. In a full implementation, we would use
        # the heading structure to create more meaningful chunks.

        # Split by double newlines (paragraphs)
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]

        # Group paragraphs into chunks that don't exceed max_chunk_size
        chunks = []
        current_chunk = ""

        for paragraph in paragraphs:
            # Check if adding this paragraph would exceed the limit
            if len(current_chunk) + len(paragraph) <= self.max_chunk_size:
                if current_chunk:
                    current_chunk += "\n\n" + paragraph
                else:
                    current_chunk = paragraph
            else:
                # If the current chunk is not empty, save it
                if current_chunk:
                    chunks.append(current_chunk)

                # If the paragraph itself is too long, split it
                if len(paragraph) > self.max_chunk_size:
                    sub_chunks = self._split_large_paragraph(paragraph)
                    chunks.extend(sub_chunks[:-1])  # Add all but the last one
                    current_chunk = sub_chunks[-1]  # Keep the last one for next iteration
                else:
                    current_chunk = paragraph

        # Don't forget the last chunk
        if current_chunk:
            chunks.append(current_chunk)

        return chunks

    def _split_by_paragraphs(self, content: str) -> List[str]:
        """
        Split content by paragraphs.
        """
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
        chunks = []
        current_chunk = ""

        for paragraph in paragraphs:
            # Check if adding this paragraph would exceed the limit
            if len(current_chunk) + len(paragraph) <= self.max_chunk_size:
                if current_chunk:
                    current_chunk += "\n\n" + paragraph
                else:
                    current_chunk = paragraph
            else:
                # If the current chunk is not empty, save it
                if current_chunk:
                    chunks.append(current_chunk)

                # If the paragraph itself is too long, split it
                if len(paragraph) > self.max_chunk_size:
                    sub_chunks = self._split_large_paragraph(paragraph)
                    chunks.extend(sub_chunks[:-1])  # Add all but the last one
                    current_chunk = sub_chunks[-1]  # Keep the last one for next iteration
                else:
                    current_chunk = paragraph

        # Don't forget the last chunk
        if current_chunk:
            chunks.append(current_chunk)

        return chunks

    def _split_large_paragraph(self, text: str) -> List[str]:
        """
        Split a paragraph that is too large into smaller chunks.
        """
        if len(text) <= self.max_chunk_size:
            return [text]

        chunks = []
        start = 0

        while start < len(text):
            end = start + self.max_chunk_size

            # If we're not at the end, try to break at a sentence boundary
            if end < len(text):
                # Look for a good breaking point (sentence or paragraph boundary)
                break_point = self._find_break_point(text, start, end)
                if break_point != -1:
                    end = break_point

            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)

            # Move start forward, with overlap if possible
            if end < len(text):
                start = end - self.overlap if self.overlap < end else end
            else:
                break

        return chunks

    def _find_break_point(self, text: str, start: int, end: int) -> int:
        """
        Find a good breaking point within the specified range.
        """
        # Look for sentence endings first
        for i in range(end, start, -1):
            if text[i] in '.!?' and i + 2 < len(text) and text[i + 1] == ' ':
                return i + 1

        # If no sentence ending found, look for word boundaries
        for i in range(end, start, -1):
            if text[i] == ' ':
                return i

        # If no good break point found, just break at the limit
        return end

    def _ensure_size_limits(self, text: str) -> List[str]:
        """
        Ensure that chunks don't exceed the maximum size.
        """
        if len(text) <= self.max_chunk_size:
            return [text]

        return self._split_large_paragraph(text)

    def _find_relevant_heading(self, chunk: str, headings: List[Dict]) -> str:
        """
        Find the most relevant heading for a given chunk.
        This is a simplified implementation - in a full system, we'd use more sophisticated
        NLP techniques or look at the document structure.
        """
        if not headings:
            return ""

        # For now, return the first heading as a placeholder
        # In a real implementation, we'd determine which heading is most contextually
        # relevant to the chunk
        return headings[0]['title'] if headings else ""

    def chunk_all_documents(self, parsed_docs: List[Dict]) -> List[Dict]:
        """
        Chunk all parsed documents.

        Args:
            parsed_docs: List of parsed document dictionaries

        Returns:
            List of all chunks from all documents
        """
        all_chunks = []
        for doc in parsed_docs:
            chunks = self.chunk_document(doc)
            all_chunks.extend(chunks)
        return all_chunks

# Example usage
if __name__ == "__main__":
    # Example of how to use the chunker
    content_parser = ContentParser()
    parsed_docs = content_parser.parse_all_docs()

    chunker = SemanticChunker()
    all_chunks = chunker.chunk_all_documents(parsed_docs)

    print(f"Chunked {len(parsed_docs)} documents into {len(all_chunks)} chunks")

    # Print info about the first few chunks
    for i, chunk in enumerate(all_chunks[:3]):
        print(f"\nChunk {i+1}:")
        print(f"  Source: {chunk['source_file']}")
        print(f"  Section: {chunk['source_section']}")
        print(f"  Preview: {chunk['content_preview'][:100]}...")
        print(f"  Size: {len(chunk['content'])} chars")