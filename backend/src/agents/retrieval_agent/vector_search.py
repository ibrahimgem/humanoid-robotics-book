"""
Vector search functionality for the Retrieval Agent
Handles searching for similar content in vector storage
"""
from typing import List, Dict, Any, Optional
import asyncio
from ...services.vector_storage_service import vector_storage_service
from ...services.embedding_service import embedding_service
from ...utils.logger import logger


class VectorSearch:
    """Vector search functionality for the retrieval agent"""

    def __init__(self, top_k: int = 5):
        """Initialize the vector search"""
        self.top_k = top_k
        self.vector_storage = vector_storage_service
        self.embedding_service = embedding_service

    async def search_by_text(self, query_text: str, limit: int = None) -> List[Dict[str, Any]]:
        """Search for similar content based on text query"""
        if not limit:
            limit = self.top_k

        # Generate embedding for the query text
        query_embedding = await self.embedding_service.generate_embedding(query_text)

        # Search in vector storage
        results = await self.vector_storage.search_similar(query_embedding, limit=limit)

        return results

    async def search_by_embedding(self, query_embedding: List[float], limit: int = None) -> List[Dict[str, Any]]:
        """Search for similar content based on embedding"""
        if not limit:
            limit = self.top_k

        # Search in vector storage
        results = await self.vector_storage.search_similar(query_embedding, limit=limit)

        return results

    async def search_by_selected_text(self, selected_text: str, query_text: str, limit: int = None) -> List[Dict[str, Any]]:
        """Search for relevant content based on selected text context"""
        if not limit:
            limit = self.top_k

        # For selected text mode, we want to find content that's relevant to both
        # the selected text and the query
        combined_query = f"{selected_text} {query_text}"

        # Generate embedding for the combined query
        query_embedding = await self.embedding_service.generate_embedding(combined_query)

        # Search in vector storage
        results = await self.vector_storage.search_similar(query_embedding, limit=limit)

        # Filter results to ensure they're relevant to the selected text context
        filtered_results = []
        for result in results:
            # Check if the content is relevant to the selected text
            # This could involve additional checks in a real implementation
            filtered_results.append(result)

        return filtered_results

    async def validate_search_results(self, results: List[Dict[str, Any]]) -> bool:
        """Validate that search results are appropriate"""
        if not results:
            return True  # Empty results are valid

        # Check that each result has required fields
        for result in results:
            if not all(key in result for key in ['chunk_id', 'content', 'score']):
                return False

        return True

    async def rank_results(self, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Rank results by relevance score"""
        # Sort by score in descending order
        ranked_results = sorted(results, key=lambda x: x.get('score', 0), reverse=True)
        return ranked_results

    async def filter_by_source(self, results: List[Dict[str, Any]], source_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """Filter results by source document if needed"""
        if not source_filter:
            return results

        filtered_results = [
            result for result in results
            if source_filter in result.get('metadata', {}).get('source_document', '')
        ]

        return filtered_results

    async def get_context_chunks(self, query: str, selected_text: Optional[str] = None, limit: int = None) -> List[Dict[str, Any]]:
        """Get relevant context chunks for a query"""
        if not limit:
            limit = self.top_k

        if selected_text:
            # Use selected text mode
            results = await self.search_by_selected_text(selected_text, query, limit)
        else:
            # Use global search mode
            results = await self.search_by_text(query, limit)

        # Validate results
        if not await self.validate_search_results(results):
            logger.warning("Invalid search results returned")
            return []

        # Rank results
        ranked_results = await self.rank_results(results)

        return ranked_results