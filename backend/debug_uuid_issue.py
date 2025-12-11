#!/usr/bin/env python3
"""
Debug script to identify where the UUID issue is occurring.
"""
import sys
import os
import asyncio
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.'))

from uuid import UUID
import uuid

# Test the cache functionality
from src.utils.cache import response_cache

# Test UUID handling
test_uuid = uuid.uuid4()
print(f"Test UUID: {test_uuid}")
print(f"Type: {type(test_uuid)}")
print(f"String representation: {str(test_uuid)}")

# Test cache key generation with UUID
try:
    query = "test query"
    session_id = test_uuid
    print(f"\nTesting cache key generation with UUID session_id...")

    # This is what happens in the RAG service
    session_id_str = str(session_id) if isinstance(session_id, UUID) else session_id
    print(f"Session ID type: {type(session_id_str)}")

    cached_response = response_cache.get_cached_response(query, session_id_str)
    print("Cache get_cached_response succeeded")

    response = {"response": "test response", "sources": [], "citations": []}
    response_cache.cache_response(query, response, session_id_str)
    print("Cache cache_response succeeded")

except Exception as e:
    print(f"Cache operation failed: {e}")
    import traceback
    traceback.print_exc()

# Test the RAG service directly with async call
print(f"\nTesting RAG service async call...")
try:
    from src.services.rag_service import rag_service

    async def test_rag():
        # Test with string session_id
        result = await rag_service.process_query(
            query="Hello, what is this chatbot for?",
            session_id=str(test_uuid),  # Use string version
            query_mode="global"
        )
        print(f"RAG service call with string session_id succeeded: {type(result)}")

        # Test with UUID session_id (this might cause the error)
        try:
            result2 = await rag_service.process_query(
                query="Hello, what is this for?",
                session_id=test_uuid,  # Use UUID object
                query_mode="global"
            )
            print(f"RAG service call with UUID session_id succeeded: {type(result2)}")
        except Exception as e2:
            print(f"RAG service call with UUID session_id failed: {e2}")
            import traceback
            traceback.print_exc()

    asyncio.run(test_rag())

except Exception as e:
    print(f"RAG service async call failed: {e}")
    import traceback
    traceback.print_exc()

# Test the exact scenario from chat endpoints
print(f"\nTesting chat endpoint scenario...")
try:
    # Simulate the logic from chat_endpoints.py
    from src.api.chat_endpoints import ChatQueryRequest
    from src.services.rag_service import rag_service

    # Create a test request
    request = ChatQueryRequest(
        message="Hello, what is this chatbot for?",
        session_id=str(test_uuid),  # This would be a string from the API
        query_mode="global"
    )

    print(f"Request session_id: {request.session_id}, type: {type(request.session_id)}")

    # Simulate the rag_service.process_query call from chat_endpoints.py
    async def test_chat_scenario():
        # This is how it's called in the chat endpoint
        response = await rag_service.process_query(
            query=request.message,
            session_id=request.session_id,  # This is a string
            query_mode=request.query_mode
        )
        print(f"Chat scenario call succeeded: {type(response)}")

    asyncio.run(test_chat_scenario())

except Exception as e:
    print(f"Chat endpoint scenario failed: {e}")
    import traceback
    traceback.print_exc()

print("\nDebug script completed.")