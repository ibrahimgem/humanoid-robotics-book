from typing import Optional, Dict, Any
import json
from datetime import datetime, timedelta
from qdrant_client import QdrantClient
from qdrant_client.http import models
import os

class CacheService:
    """
    Service to handle caching of personalized content in Qdrant.
    """
    def __init__(self):
        # Initialize Qdrant client
        self.qdrant_client = QdrantClient(
            url=os.getenv("QDRANT_URL", "http://localhost:6333")
        )

        # Create collection for caching if it doesn't exist
        try:
            self.qdrant_client.get_collection("personalized_content_cache")
        except:
            # Create the collection if it doesn't exist
            self.qdrant_client.create_collection(
                collection_name="personalized_content_cache",
                vectors_config=models.VectorParams(size=1, distance=models.Distance.COSINE)
            )

    def cache_personalized_content(self, cache_key: str, content: str, user_id: int) -> bool:
        """
        Cache personalized content with user-specific keys.
        """
        try:
            # Prepare payload
            payload = {
                "cache_key": cache_key,
                "content": content,
                "user_id": user_id,
                "created_at": datetime.utcnow().isoformat(),
                "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat()  # 24 hour expiration
            }

            # In Qdrant, we need to create a vector. For caching, we'll use a simple approach
            # where we create a vector based on the content length or other metrics
            vector = [len(content) / 1000.0]  # Simple vector based on content length

            # Upsert the record
            self.qdrant_client.upsert(
                collection_name="personalized_content_cache",
                points=[
                    models.PointStruct(
                        id=hash(cache_key) % (10**9),  # Create a point ID from the cache key
                        vector=vector,
                        payload=payload
                    )
                ]
            )

            return True
        except Exception as e:
            print(f"Error caching content: {e}")
            return False

    def get_cached_content(self, cache_key: str) -> Optional[str]:
        """
        Get cached content by cache key.
        """
        try:
            # Search for the point with the given cache key
            results = self.qdrant_client.scroll(
                collection_name="personalized_content_cache",
                scroll_filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="cache_key",
                            match=models.MatchValue(value=cache_key)
                        )
                    ]
                ),
                limit=1
            )

            if results[0]:  # If we found a result
                point = results[0]
                payload = point.payload

                # Check if cache has expired
                expires_at = datetime.fromisoformat(payload["expires_at"])
                if datetime.utcnow() > expires_at:
                    # Cache has expired, delete it and return None
                    self.delete_cache(cache_key)
                    return None

                return payload["content"]

            return None
        except Exception as e:
            print(f"Error retrieving cached content: {e}")
            return None

    def delete_cache(self, cache_key: str) -> bool:
        """
        Delete cache entry by cache key.
        """
        try:
            # Find the point ID for this cache key
            results = self.qdrant_client.scroll(
                collection_name="personalized_content_cache",
                scroll_filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="cache_key",
                            match=models.MatchValue(value=cache_key)
                        )
                    ]
                ),
                limit=1
            )

            if results[0]:
                point_id = results[0].id
                self.qdrant_client.delete(
                    collection_name="personalized_content_cache",
                    points_selector=models.PointIdsList(
                        points=[point_id]
                    )
                )
                return True

            return False
        except Exception as e:
            print(f"Error deleting cached content: {e}")
            return False

    def add_user_specific_cache_keys(self, cache_key: str, user_id: int) -> str:
        """
        Add user-specific cache keys.
        """
        # This method ensures the cache key includes user-specific information
        user_specific_key = f"{cache_key}_user_{user_id}"
        return user_specific_key

    def implement_cache_expiration(self, hours: int = 24) -> timedelta:
        """
        Implement cache expiration (24 hours).
        """
        return timedelta(hours=hours)

    def implement_cache_invalidation(self, cache_key: str) -> bool:
        """
        Implement cache invalidation mechanism.
        """
        return self.delete_cache(cache_key)