#!/usr/bin/env python3
"""
Test script for the RAG AI Chatbot API
"""
import requests
import json

def test_chat_api():
    """Test the chat API endpoint"""
    url = "http://localhost:8000/api/chat"

    payload = {
        "question_text": "What is humanoid robotics?",
        "query_mode": "global",
        "session_id": "test-session-999"
    }

    headers = {
        "Content-Type": "application/json"
    }

    print("Testing RAG AI Chatbot API...")
    print("=" * 60)
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    print("=" * 60)

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=60)

        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print("=" * 60)

        if response.status_code == 200:
            data = response.json()
            print("Response Data:")
            print(json.dumps(data, indent=2))
            print("=" * 60)
            print("\n✅ API Test PASSED!")
            print(f"- Response generated successfully")
            print(f"- Sources: {len(data.get('sources', []))}")
            print(f"- Follow-up questions: {len(data.get('follow_up_questions', []))}")
            print(f"- Response time: {data.get('response_time_ms', 0)} ms")
        else:
            print(f"❌ API Test FAILED!")
            print(f"Error: {response.text}")

    except Exception as e:
        print(f"❌ API Test FAILED!")
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_chat_api()
