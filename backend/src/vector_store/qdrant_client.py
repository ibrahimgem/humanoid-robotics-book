"""
Qdrant client for vector storage operations.
Implements the vector store schema for book_content with proper payload structure.
"""
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.models import Distance, VectorParams, PayloadSchemaType
import os
from dotenv import load_dotenv
from typing import List, Dict, Optional
import uuid
from datetime import datetime

# Load environment variables
load_dotenv()

class QdrantManager:
    def __init__(self):
        # Get Qdrant configuration from environment
        self.qdrant_url = os.getenv("QDRANT_URL")
        self.qdrant_api_key = os.getenv("QDRANT_API_KEY")

        # Check if Qdrant is properly configured
        if not self.qdrant_url or self.qdrant_url.startswith('https://your-'):
            print("Qdrant not configured - using mock mode for development")
            self.client = None
            self.collection_name = "book_content"
            self.vector_size = 1536
            self.distance = Distance.COSINE
            return

        # Initialize Qdrant client
        try:
            if self.qdrant_api_key:
                self.client = QdrantClient(
                    url=self.qdrant_url,
                    api_key=self.qdrant_api_key,
                    prefer_grpc=False  # Using HTTP for better compatibility
                )
            else:
                # For local development without API key
                self.client = QdrantClient(url=self.qdrant_url)

            # Collection name
            self.collection_name = "book_content"

            # Vector size for OpenAI ada-002 embeddings
            self.vector_size = 1536
            self.distance = Distance.COSINE

            # Initialize the collection if it doesn't exist
            self._init_collection()
        except Exception as e:
            print(f"Error initializing Qdrant: {e}")
            print("Qdrant not available - using mock mode for development")
            self.client = None
            self.collection_name = "book_content"
            self.vector_size = 1536
            self.distance = Distance.COSINE

    def _init_collection(self):
        """
        Initialize the Qdrant collection with proper schema.
        """
        if not self.client:
            # In mock mode, just return
            return

        try:
            # Check if collection exists
            collections = self.client.get_collections()
            collection_exists = any(col.name == self.collection_name for col in collections.collections)

            if not collection_exists:
                # Create collection with specified vector configuration
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=self.vector_size,
                        distance=self.distance
                    )
                )

                # Create payload indices for efficient filtering
                self.client.create_payload_index(
                    collection_name=self.collection_name,
                    field_name="chapter_id",
                    field_schema=PayloadSchemaType.KEYWORD
                )

                self.client.create_payload_index(
                    collection_name=self.collection_name,
                    field_name="source_file",
                    field_schema=PayloadSchemaType.KEYWORD
                )

                print(f"Created Qdrant collection: {self.collection_name}")
            else:
                print(f"Qdrant collection {self.collection_name} already exists")

        except Exception as e:
            print(f"Error initializing Qdrant collection: {e}")
            raise

    def upsert_vectors(self, vectors_data: List[Dict]):
        """
        Upsert vectors with payloads to the collection.

        Args:
            vectors_data: List of dictionaries with keys:
                - 'id': UUID for the vector point
                - 'vector': List of floats (1536 dimensions for ada-002)
                - 'payload': Dictionary with chunk_id, chapter_id, source_file, etc.
        """
        if not self.client:
            # In mock mode, just return success
            print("Qdrant mock mode: Skipping vector upsert")
            return True

        try:
            points = []
            for data in vectors_data:
                point = models.PointStruct(
                    id=str(data['id']),
                    vector=data['vector'],
                    payload=data['payload']
                )
                points.append(point)

            self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )

            return True
        except Exception as e:
            print(f"Error upserting vectors: {e}")
            return False

    def search_vectors(self, query_vector: List[float], limit: int = 10,
                      chapter_id: Optional[str] = None, filters: Optional[Dict] = None):
        """
        Search for similar vectors in the collection.

        Args:
            query_vector: List of floats (1536 dimensions) representing the query
            limit: Number of results to return
            chapter_id: Optional chapter ID to filter results
            filters: Optional additional filters

        Returns:
            List of search results with payloads
        """
        if not self.client:
            # In mock mode, return empty results
            print("Qdrant mock mode: Returning empty search results")
            # Return a mock result that has the same structure as a real result
            from qdrant_client.http import models
            # In mock mode, return empty list
            return []

        try:
            # Build filter conditions
            filter_conditions = []

            if chapter_id:
                filter_conditions.append(
                    models.FieldCondition(
                        key="chapter_id",
                        match=models.MatchValue(value=chapter_id)
                    )
                )

            # Add any additional filters
            if filters:
                for key, value in filters.items():
                    filter_conditions.append(
                        models.FieldCondition(
                            key=key,
                            match=models.MatchValue(value=value)
                        )
                    )

            # Create the filter if we have conditions
            search_filter = None
            if filter_conditions:
                search_filter = models.Filter(
                    must=filter_conditions
                )

            # Perform the search
            search_results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                query_filter=search_filter,
                limit=limit
            )

            return search_results

        except Exception as e:
            print(f"Error searching vectors: {e}")
            return []

    def delete_vectors(self, point_ids: List[str]):
        """
        Delete vectors by their IDs.

        Args:
            point_ids: List of point IDs to delete
        """
        if not self.client:
            # In mock mode, just return success
            print("Qdrant mock mode: Skipping vector deletion")
            return True

        try:
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=models.PointIdsList(
                    points=point_ids
                )
            )
            return True
        except Exception as e:
            print(f"Error deleting vectors: {e}")
            return False

    def get_vector_count(self) -> int:
        """
        Get the total number of vectors in the collection.
        """
        if not self.client:
            # In mock mode, return 0
            print("Qdrant mock mode: Returning 0 vector count")
            return 0

        try:
            count_result = self.client.count(
                collection_name=self.collection_name
            )
            return count_result.count
        except Exception as e:
            print(f"Error getting vector count: {e}")
            return 0

# Global instance for use throughout the application
qdrant_manager = QdrantManager()