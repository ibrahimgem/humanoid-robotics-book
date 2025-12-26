"""
Qdrant vector storage service for the RAG AI Chatbot
Handles vector storage and retrieval operations
"""
import os
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class VectorStorageService:
    """Service class for vector storage operations"""

    def __init__(self):
        """Initialize Qdrant client"""
        self.qdrant_url = os.getenv("QDRANT_URL")
        self.qdrant_api_key = os.getenv("QDRANT_API_KEY")

        if self.qdrant_url:
            self.client = QdrantClient(
                url=self.qdrant_url,
                api_key=self.qdrant_api_key
            )
        else:
            # For development, could use local instance
            self.client = QdrantClient(":memory:")  # In-memory for testing

        self.collection_name = "book_content_chunks"
        self._collection_initialized = False

    async def init_collection(self):
        """Initialize the vector collection"""
        try:
            # Check if collection exists
            collections = self.client.get_collections()
            collection_exists = any(col.name == self.collection_name for col in collections.collections)

            if not collection_exists:
                # Create collection with appropriate vector size (for Gemini embeddings)
                self.client.recreate_collection(
                    collection_name=self.collection_name,
                    vectors_config=models.VectorParams(size=768, distance=models.Distance.COSINE),
                )
            print(f"Collection '{self.collection_name}' is ready")
        except Exception as e:
            print(f"Error initializing collection: {e}")

    async def store_embedding(self, chunk_id: str, content: str, embedding: List[float], metadata: Dict[str, Any] = None):
        """Store an embedding in Qdrant"""
        # Ensure collection exists
        if not self._collection_initialized:
            await self.init_collection()
            self._collection_initialized = True

        try:
            points = [
                models.PointStruct(
                    id=chunk_id,
                    vector=embedding,
                    payload={
                        "content": content,
                        "chunk_id": chunk_id,
                        **(metadata or {})
                    }
                )
            ]

            self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )
            return True
        except Exception as e:
            print(f"Error storing embedding: {e}")
            return False

    async def search_similar(self, query_embedding: List[float], limit: int = 5) -> List[Dict[str, Any]]:
        """Search for similar content based on embedding"""
        # Ensure collection exists
        if not self._collection_initialized:
            await self.init_collection()
            self._collection_initialized = True

        try:
            # Check available search methods based on the Qdrant client version
            if hasattr(self.client, 'search'):
                # For newer versions of qdrant-client
                search_results = self.client.search(
                    collection_name=self.collection_name,
                    query_vector=query_embedding,
                    limit=limit
                )
            elif hasattr(self.client, 'search_points'):
                # For some versions of qdrant-client
                search_results = self.client.search_points(
                    collection_name=self.collection_name,
                    query=query_embedding,
                    limit=limit
                )
            elif hasattr(self.client, 'query_points'):
                # For newer versions of qdrant-client, query_points is the method to use
                search_results = self.client.query_points(
                    collection_name=self.collection_name,
                    query=query_embedding,
                    limit=limit
                )
            elif hasattr(self.client, 'query'):
                # For some versions of qdrant-client
                search_results = self.client.query(
                    collection_name=self.collection_name,
                    query=query_embedding,
                    limit=limit
                )
            else:
                # For older versions, might need to use a different approach
                # Let's try to handle this gracefully
                print("No search method found in Qdrant client")
                return []

            results = []
            for result in search_results:
                # Handle different result formats depending on the method used
                if isinstance(result, tuple):  # Handle tuple results
                    # If it's a tuple, we need to extract based on the format
                    # The exact format depends on which method was used
                    if len(result) >= 2:  # At least (payload, score) or similar
                        if hasattr(result[0], 'payload'):
                            # Standard search result object in tuple
                            item = result[0]
                            chunk_id = item.payload.get("chunk_id")
                            content = item.payload.get("content")
                            score = item.score
                            metadata = {k: v for k, v in item.payload.items() if k not in ["content", "chunk_id"]}
                        else:
                            # Handle raw tuple format
                            chunk_id = getattr(result[0], 'id', '') if hasattr(result[0], 'id') else ''
                            content = getattr(result[0], 'payload', {}).get("content", '') if hasattr(result[0], 'payload') else ''
                            score = result[1] if len(result) > 1 else 0.0
                            metadata = getattr(result[0], 'payload', {}) if hasattr(result[0], 'payload') else {}
                    else:
                        continue  # Skip malformed results
                elif hasattr(result, 'payload'):  # Standard search result
                    chunk_id = result.payload.get("chunk_id")
                    content = result.payload.get("content")
                    score = result.score
                    metadata = {k: v for k, v in result.payload.items() if k not in ["content", "chunk_id"]}
                elif hasattr(result, 'id'):  # Some search result formats
                    chunk_id = result.id
                    content = getattr(result, 'payload', {}).get("content", "")
                    score = getattr(result, 'score', 0.0)
                    metadata = getattr(result, 'payload', {})
                else:  # Fallback
                    chunk_id = getattr(result, 'id', '')
                    content = getattr(result, 'content', '')
                    score = getattr(result, 'score', 0.0)
                    metadata = getattr(result, 'payload', {})

                results.append({
                    "chunk_id": chunk_id,
                    "content": content,
                    "score": score,
                    "metadata": metadata
                })

            return results
        except AttributeError as e:
            # Handle case where search method name is different
            if "'search'" in str(e):
                # Try the older method name or different approach
                print(f"Search method not found: {e}")
                # Return empty results instead of failing completely
                return []
            else:
                print(f"AttributeError in search: {e}")
                return []
        except Exception as e:
            print(f"Error searching similar content: {e}")
            return []

    async def delete_embedding(self, chunk_id: str):
        """Delete an embedding by ID"""
        # Ensure collection exists
        if not self._collection_initialized:
            await self.init_collection()
            self._collection_initialized = True

        try:
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=models.PointIdsList(
                    points=[chunk_id]
                )
            )
            return True
        except Exception as e:
            print(f"Error deleting embedding: {e}")
            return False

# Global vector storage service instance
vector_storage_service = VectorStorageService()