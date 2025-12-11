#!/usr/bin/env python3
"""
Test the exact request flow that might be causing the issue.
"""
import sys
import os
import asyncio
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.'))

from uuid import UUID
import uuid

# Test the exact flow from chat endpoint
print("Testing exact request flow...")

test_uuid_str = str(uuid.uuid4())
print(f"Test UUID string: {test_uuid_str}")

# Test the exact logic from chat_endpoints.py
async def test_chat_endpoint_logic():
    from src.api.chat_endpoints import ChatQueryRequest
    from src.database.connection import get_db
    from src.models.chat_models import ChatSession, ChatLog
    from src.services.rag_service import rag_service

    # Create a mock request
    request = ChatQueryRequest(
        message="Hello, what is this chatbot for?",
        session_id=test_uuid_str,
        query_mode="global"
    )

    # Simulate the exact logic from chat_endpoints.py
    db = next(get_db())
    try:
        # Validate and convert session_id to UUID format (from chat_endpoints.py)
        try:
            session_uuid = UUID(request.session_id)
            # Convert to string for consistent use throughout the function
            session_id_str = str(session_uuid)
        except ValueError:
            # If session_id is not a valid UUID, generate a new one but log the original for debugging
            session_uuid = UUID(uuid.uuid4())
            session_id_str = str(session_uuid)
            print(f"Invalid UUID format for session_id: {request.session_id}. Generated new UUID: {session_uuid}")

        print(f"session_uuid: {session_uuid} (type: {type(session_uuid)})")
        print(f"session_id_str: {session_id_str} (type: {type(session_id_str)})")

        # Check if session exists, create if not (from chat_endpoints.py)
        session = db.query(ChatSession).filter(ChatSession.id == session_uuid).first()
        if not session:
            session = ChatSession(id=session_uuid)
            db.add(session)
            db.commit()
            db.refresh(session)

        # Log the user message (from chat_endpoints.py)
        user_log = ChatLog(
            session_id=session_uuid,
            role="user",
            content=request.message,
            query_mode=request.query_mode,
            selected_text=request.selected_text
        )
        db.add(user_log)
        db.commit()
        print("User log creation succeeded")

        # Process the query using the RAG service (from chat_endpoints.py)
        print("Calling rag_service.process_query...")
        response = await rag_service.process_query(
            query=request.message,
            session_id=session_id_str,  # Pass the UUID as string
            query_mode=request.query_mode,
            selected_text=request.selected_text
        )
        print(f"RAG service response: {type(response)}")

        # Log the assistant response (from chat_endpoints.py)
        assistant_log = ChatLog(
            session_id=session_uuid,
            role="assistant",
            content=response['response'],
            query_mode=request.query_mode,
            selected_text=request.selected_text
        )
        db.add(assistant_log)
        db.commit()
        print("Assistant log creation succeeded")

    finally:
        db.close()

    print("Chat endpoint logic test completed successfully")

# Run the test
try:
    asyncio.run(test_chat_endpoint_logic())
except Exception as e:
    print(f"Chat endpoint logic test failed: {e}")
    import traceback
    traceback.print_exc()

print("\nRequest flow test completed.")