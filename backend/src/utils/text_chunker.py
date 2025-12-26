"""
Text chunker utility for the RAG AI Chatbot
Chunks content into smaller pieces for embedding and retrieval
"""
from typing import List, Dict, Optional
import re


class TextChunker:
    """Utility class for chunking text content into smaller pieces"""

    def __init__(self, chunk_size: int = 1000, overlap: int = 100):
        """Initialize the text chunker with default parameters"""
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk_text(self, text: str, source_document: str = "", source_section: str = "") -> List[Dict]:
        """Chunk text into smaller pieces with overlap"""
        if not text:
            return []

        # Split text into sentences to avoid breaking them
        sentences = re.split(r'(?<=[.!?])\s+', text)

        chunks = []
        current_chunk = ""
        current_start_idx = 0

        for sentence in sentences:
            # Check if adding this sentence would exceed chunk size
            if len(current_chunk) + len(sentence) <= self.chunk_size:
                current_chunk += sentence + " "
            else:
                # If current chunk is too small and we have more content, try to add more
                if len(current_chunk) < self.chunk_size * 0.5 and len(sentence) < self.chunk_size:
                    current_chunk += sentence + " "
                    continue

                # Save current chunk
                if current_chunk.strip():
                    chunks.append({
                        'content': current_chunk.strip(),
                        'source_document': source_document,
                        'source_section': source_section,
                        'start_idx': current_start_idx,
                        'end_idx': current_start_idx + len(current_chunk)
                    })

                # Start new chunk with overlap
                if self.overlap > 0 and len(sentence) > self.overlap:
                    # If sentence is longer than overlap, just take the sentence
                    current_chunk = sentence + " "
                    current_start_idx = current_start_idx + len(current_chunk) - len(sentence) - 1
                else:
                    # Take overlapping text from the end of the previous chunk
                    overlap_text = current_chunk[-self.overlap:] if len(current_chunk) >= self.overlap else current_chunk
                    current_chunk = overlap_text + sentence + " "
                    current_start_idx = current_start_idx + len(current_chunk) - len(overlap_text) - len(sentence) - 1

        # Add the last chunk if it has content
        if current_chunk.strip():
            chunks.append({
                'content': current_chunk.strip(),
                'source_document': source_document,
                'source_section': source_section,
                'start_idx': current_start_idx,
                'end_idx': current_start_idx + len(current_chunk)
            })

        return chunks

    def chunk_by_paragraph(self, text: str, source_document: str = "", source_section: str = "") -> List[Dict]:
        """Chunk text by paragraphs"""
        paragraphs = text.split('\n\n')
        chunks = []

        for i, paragraph in enumerate(paragraphs):
            if paragraph.strip():
                chunks.append({
                    'content': paragraph.strip(),
                    'source_document': f"{source_document}_para_{i}",
                    'source_section': source_section,
                    'start_idx': i,
                    'end_idx': i + 1
                })

        return chunks

    def chunk_by_sections(self, parsed_content: Dict) -> List[Dict]:
        """Chunk content based on document sections (headers)"""
        content = parsed_content.get('content', '')
        source_path = parsed_content.get('source_path', '')
        headers = parsed_content.get('headers', [])

        if not headers:
            # If no headers, just chunk the entire content
            return self.chunk_text(content, source_path, "main")

        chunks = []
        start = 0

        for i, header in enumerate(headers):
            header_pos = header['position']

            # Get content from previous header to this header
            if i == 0:
                section_content = content[:header_pos]
                if section_content.strip():
                    chunks.append({
                        'content': section_content.strip(),
                        'source_document': source_path,
                        'source_section': 'Introduction',
                        'start_idx': 0,
                        'end_idx': header_pos
                    })
            else:
                prev_header_pos = headers[i-1]['position']
                section_content = content[prev_header_pos:header_pos]
                if section_content.strip():
                    chunks.append({
                        'content': section_content.strip(),
                        'source_document': source_path,
                        'source_section': headers[i-1]['text'],
                        'start_idx': prev_header_pos,
                        'end_idx': header_pos
                    })

        # Add content after the last header
        if headers:
            last_pos = headers[-1]['position']
            remaining_content = content[last_pos:]
            if remaining_content.strip():
                chunks.append({
                    'content': remaining_content.strip(),
                    'source_document': source_path,
                    'source_section': headers[-1]['text'],
                    'start_idx': last_pos,
                    'end_idx': len(content)
                })

        return chunks


# Global text chunker instance
text_chunker = TextChunker()