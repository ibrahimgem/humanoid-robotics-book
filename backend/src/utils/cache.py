"""
Simple in-memory cache for storing frequently asked questions and their responses.
Provides response caching to improve performance for repeated queries.
"""
import hashlib
import time
from typing import Any, Optional, Dict
from datetime import datetime, timedelta
import asyncio
import threading

class SimpleCache:
    """
    A simple in-memory cache with TTL (Time To Live) expiration.
    """
    def __init__(self, default_ttl: int = 3600):  # 1 hour default TTL
        self.cache = {}
        self.default_ttl = default_ttl
        self.lock = threading.Lock()

    def _generate_key(self, query: str, session_id: str = "") -> str:
        """
        Generate a unique cache key for a query.

        Args:
            query: The query string
            session_id: Optional session ID to differentiate between users

        Returns:
            Hashed key string
        """
        combined = f"{query}::{session_id}"
        return hashlib.sha256(combined.encode()).hexdigest()

    def get(self, key: str) -> Optional[Any]:
        """
        Get a value from the cache if it exists and hasn't expired.

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found or expired
        """
        with self.lock:
            if key in self.cache:
                value, expiry = self.cache[key]
                if time.time() < expiry:
                    return value
                else:
                    # Remove expired entry
                    del self.cache[key]
        return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        Set a value in the cache with optional TTL.

        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds (uses default if not provided)
        """
        if ttl is None:
            ttl = self.default_ttl

        expiry = time.time() + ttl
        with self.lock:
            self.cache[key] = (value, expiry)

    def delete(self, key: str) -> bool:
        """
        Delete a key from the cache.

        Args:
            key: Cache key to delete

        Returns:
            True if key existed and was deleted, False otherwise
        """
        with self.lock:
            if key in self.cache:
                del self.cache[key]
                return True
        return False

    def clear(self) -> None:
        """Clear all entries from the cache."""
        with self.lock:
            self.cache.clear()

    def cleanup_expired(self) -> int:
        """
        Remove all expired entries from the cache.

        Returns:
            Number of expired entries removed
        """
        current_time = time.time()
        expired_keys = []

        with self.lock:
            for key, (_, expiry) in self.cache.items():
                if current_time >= expiry:
                    expired_keys.append(key)

            for key in expired_keys:
                del self.cache[key]

        return len(expired_keys)

# Global cache instance
cache = SimpleCache(default_ttl=7200)  # 2 hour TTL for responses

class ResponseCache:
    """
    Specialized cache for storing chatbot responses.
    """
    def __init__(self):
        self.cache = cache

    def get_cached_response(self, query: str, session_id: str = "") -> Optional[Dict]:
        """
        Get a cached response for a query.

        Args:
            query: The query string
            session_id: Optional session ID

        Returns:
            Cached response dictionary or None
        """
        # For session-specific caching, include session_id in key
        # For general caching (frequently asked questions), don't include session_id
        general_key = self.cache._generate_key(query, "")
        session_key = self.cache._generate_key(query, session_id)

        # First try session-specific cache
        response = self.cache.get(session_key)
        if response:
            return response

        # Then try general cache
        response = self.cache.get(general_key)
        if response:
            return response

        return None

    def cache_response(self, query: str, response: Dict, session_id: str = "",
                      ttl: Optional[int] = None) -> None:
        """
        Cache a response for a query.

        Args:
            query: The original query
            response: The response dictionary to cache
            session_id: Optional session ID
            ttl: Optional TTL for this specific entry
        """
        # Cache both session-specific and general versions
        session_key = self.cache._generate_key(query, session_id)
        general_key = self.cache._generate_key(query, "")

        # Cache with the provided TTL or default
        self.cache.set(session_key, response, ttl)
        # For general cache, use longer TTL since it's shared
        general_ttl = ttl if ttl else 86400  # 24 hours for general cache
        self.cache.set(general_key, response, general_ttl)

    def invalidate_query(self, query: str) -> int:
        """
        Invalidate all cached responses for a specific query.

        Args:
            query: The query to invalidate
        """
        invalidated = 0

        # We'd need to iterate through all keys to find those matching the query
        # For simplicity in this implementation, we'll just return 0
        # A production implementation would maintain an index of query -> keys
        return invalidated

    def get_cache_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the cache.

        Returns:
            Dictionary with cache statistics
        """
        with self.cache.lock:
            total_entries = len(self.cache.cache)

        # Clean up expired entries and get count
        expired_count = self.cache.cleanup_expired()

        return {
            'total_entries': total_entries,
            'expired_entries_removed': expired_count,
            'default_ttl': self.cache.default_ttl
        }

# Global response cache instance
response_cache = ResponseCache()

if __name__ == "__main__":
    # Example usage
    print("Cache initialized")

    # Test caching
    test_query = "What are ROS 2 nodes?"
    test_response = {
        "response": "ROS 2 nodes are the fundamental unit of a ROS system...",
        "sources": ["/docs/ros2/nodes"],
        "citations": []
    }

    # Cache the response
    response_cache.cache_response(test_query, test_response, "session-123")

    # Retrieve from cache
    cached = response_cache.get_cached_response(test_query, "session-123")
    print(f"Cached response: {cached is not None}")

    # Check stats
    stats = response_cache.get_cache_stats()
    print(f"Cache stats: {stats}")