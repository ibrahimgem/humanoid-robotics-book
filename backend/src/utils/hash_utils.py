"""
Content hash generation and duplicate detection utilities for KnowledgeChunk management.
"""
import hashlib
from typing import List, Dict, Set
from uuid import uuid4
from datetime import datetime

class ContentHasher:
    """
    Utility class for generating content hashes and detecting duplicates.
    """

    @staticmethod
    def generate_content_hash(content: str, source_file: str = "", source_section: str = "") -> str:
        """
        Generate a unique hash for content combined with source information.

        Args:
            content: The content to hash
            source_file: The source file path
            source_section: The section within the source

        Returns:
            SHA-256 hash string of the combined content
        """
        # Combine content with source information to create a unique identifier
        combined_content = f"{content}::{source_file}::{source_section}"
        return hashlib.sha256(combined_content.encode('utf-8')).hexdigest()

    @staticmethod
    def generate_chunk_id() -> str:
        """
        Generate a unique chunk ID.

        Returns:
            UUID string for the chunk
        """
        return str(uuid4())

    @staticmethod
    def detect_duplicates(chunks: List[Dict]) -> List[Dict]:
        """
        Detect duplicate chunks based on content hash.

        Args:
            chunks: List of chunk dictionaries with 'content_hash' field

        Returns:
            List of duplicate chunk dictionaries with duplicate info
        """
        seen_hashes = set()
        duplicates = []

        for chunk in chunks:
            content_hash = chunk.get('content_hash')
            if content_hash in seen_hashes:
                # This is a duplicate
                duplicate_info = chunk.copy()
                duplicate_info['is_duplicate'] = True
                duplicates.append(duplicate_info)
            else:
                seen_hashes.add(content_hash)

        return duplicates

    @staticmethod
    def filter_unique_chunks(chunks: List[Dict]) -> List[Dict]:
        """
        Filter chunks to keep only unique ones based on content hash.

        Args:
            chunks: List of chunk dictionaries with 'content_hash' field

        Returns:
            List of unique chunk dictionaries
        """
        seen_hashes = set()
        unique_chunks = []

        for chunk in chunks:
            content_hash = chunk.get('content_hash')
            if content_hash not in seen_hashes:
                seen_hashes.add(content_hash)
                unique_chunks.append(chunk)

        return unique_chunks

    @staticmethod
    def update_chunk_with_hash(chunk: Dict) -> Dict:
        """
        Update a chunk dictionary with a generated hash.

        Args:
            chunk: Chunk dictionary with 'content', 'source_file', 'source_section'

        Returns:
            Updated chunk dictionary with 'content_hash' and 'chunk_id' fields
        """
        updated_chunk = chunk.copy()

        # Generate content hash if not already present
        if 'content_hash' not in updated_chunk:
            updated_chunk['content_hash'] = ContentHasher.generate_content_hash(
                updated_chunk.get('content', ''),
                updated_chunk.get('source_file', ''),
                updated_chunk.get('source_section', '')
            )

        # Generate chunk ID if not already present
        if 'chunk_id' not in updated_chunk:
            updated_chunk['chunk_id'] = ContentHasher.generate_chunk_id()

        # Set embedding status to pending if not already set
        if 'embedding_status' not in updated_chunk:
            updated_chunk['embedding_status'] = 'pending'

        # Set creation timestamp if not already set
        if 'created_at' not in updated_chunk:
            updated_chunk['created_at'] = datetime.utcnow().isoformat()

        return updated_chunk

    @staticmethod
    def batch_update_chunks_with_hashes(chunks: List[Dict]) -> List[Dict]:
        """
        Update a batch of chunks with generated hashes and IDs.

        Args:
            chunks: List of chunk dictionaries

        Returns:
            List of updated chunk dictionaries
        """
        updated_chunks = []
        for chunk in chunks:
            updated_chunk = ContentHasher.update_chunk_with_hash(chunk)
            updated_chunks.append(updated_chunk)
        return updated_chunks

    @staticmethod
    def validate_chunk_structure(chunk: Dict) -> bool:
        """
        Validate that a chunk has the required structure.

        Args:
            chunk: Chunk dictionary to validate

        Returns:
            True if chunk has required fields, False otherwise
        """
        required_fields = ['content', 'source_file', 'source_section']
        for field in required_fields:
            if field not in chunk:
                return False
        return True

    @staticmethod
    def validate_chunks(chunks: List[Dict]) -> Dict[str, List]:
        """
        Validate a list of chunks and return validation results.

        Args:
            chunks: List of chunk dictionaries to validate

        Returns:
            Dictionary with 'valid', 'invalid', and 'missing_fields' lists
        """
        valid_chunks = []
        invalid_chunks = []
        missing_fields_list = []

        for i, chunk in enumerate(chunks):
            if ContentHasher.validate_chunk_structure(chunk):
                valid_chunks.append(chunk)
            else:
                invalid_chunks.append(chunk)
                # Determine which fields are missing
                required_fields = ['content', 'source_file', 'source_section']
                missing_fields = [field for field in required_fields if field not in chunk]
                missing_fields_list.append({
                    'index': i,
                    'chunk': chunk,
                    'missing_fields': missing_fields
                })

        return {
            'valid': valid_chunks,
            'invalid': invalid_chunks,
            'missing_fields': missing_fields_list
        }

# Example usage
if __name__ == "__main__":
    hasher = ContentHasher()

    # Example chunks
    chunks = [
        {
            'content': 'This is the first piece of content for testing',
            'source_file': '/docs/ros2/introduction.mdx',
            'source_section': 'Introduction to ROS 2'
        },
        {
            'content': 'This is another piece of content',
            'source_file': '/docs/ros2/nodes.mdx',
            'source_section': 'Understanding Nodes'
        },
        {
            'content': 'This is the first piece of content for testing',  # Duplicate
            'source_file': '/docs/ros2/introduction.mdx',
            'source_section': 'Introduction to ROS 2'
        }
    ]

    # Update chunks with hashes
    updated_chunks = hasher.batch_update_chunks_with_hashes(chunks)

    print("Updated chunks with hashes:")
    for i, chunk in enumerate(updated_chunks):
        print(f"Chunk {i+1}: hash={chunk['content_hash'][:10]}..., id={chunk['chunk_id'][:8]}...")

    # Detect duplicates
    duplicates = hasher.detect_duplicates(updated_chunks)
    print(f"\nFound {len(duplicates)} duplicates")

    # Filter unique chunks
    unique_chunks = hasher.filter_unique_chunks(updated_chunks)
    print(f"Kept {len(unique_chunks)} unique chunks")