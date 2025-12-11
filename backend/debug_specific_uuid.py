#!/usr/bin/env python3
"""
More specific debug script to test the exact error scenario.
"""
import sys
import os
import asyncio
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.'))

from uuid import UUID
import uuid

# Test the exact scenario that might be causing the issue
print("Testing specific UUID to string conversion scenarios...")

test_uuid = uuid.uuid4()
print(f"Test UUID: {test_uuid}, type: {type(test_uuid)}")

# Test if there's an issue with string operations on UUID
try:
    # This should fail and show the exact error
    result = test_uuid.replace("-", "_")
    print(f"UUID.replace worked: {result}")
except AttributeError as e:
    print(f"Expected error with UUID.replace: {e}")

# Test string formatting operations
try:
    formatted = f"session:{test_uuid}"
    print(f"F-string formatting worked: {formatted}")
except Exception as e:
    print(f"F-string formatting failed: {e}")

try:
    # Test what happens in cache _generate_key
    combined = f"test_query::{test_uuid}"
    print(f"Cache key generation worked: {len(combined)} chars")

    # Test encoding (this is what happens in the cache)
    encoded = combined.encode()
    print(f"Encoding worked: {type(encoded)}")

    # Test hashing
    import hashlib
    hashed = hashlib.sha256(encoded).hexdigest()
    print(f"Hashing worked: {hashed[:10]}...")

except Exception as e:
    print(f"Cache operations failed: {e}")
    import traceback
    traceback.print_exc()

# Test database operations with UUID
print(f"\nTesting database operations with UUID...")
try:
    from src.database.connection import get_db
    from src.models.chat_models import ChatSession, ChatLog
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy import create_engine

    # Use a test UUID and see if there's an issue with database operations
    db_session_uuid = test_uuid
    print(f"Using UUID for database operations: {db_session_uuid}")

    # Test creating a ChatSession with UUID
    db = next(get_db())
    try:
        # This is similar to what happens in _log_interaction
        session = ChatSession(id=db_session_uuid)
        print(f"ChatSession creation worked with UUID: {type(session.id)}")
    finally:
        db.close()

except Exception as e:
    print(f"Database operations failed: {e}")
    import traceback
    traceback.print_exc()

# Test the _log_interaction method directly
print(f"\nTesting _log_interaction method...")
try:
    from src.services.rag_service import rag_service
    import datetime

    async def test_log_interaction():
        # Test calling _log_interaction with UUID
        await rag_service._log_interaction(
            query="test query",
            response="test response",
            session_id=test_uuid,  # Pass UUID object
            query_mode="global",
            selected_text=None
        )
        print("_log_interaction with UUID object succeeded")

        # Test with string
        await rag_service._log_interaction(
            query="test query 2",
            response="test response 2",
            session_id=str(test_uuid),  # Pass string
            query_mode="global",
            selected_text=None
        )
        print("_log_interaction with string succeeded")

    asyncio.run(test_log_interaction())

except Exception as e:
    print(f"_log_interaction failed: {e}")
    import traceback
    traceback.print_exc()

print("\nSpecific debug completed.")