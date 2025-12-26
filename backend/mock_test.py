"""
Mock backend for testing the RAG AI Chatbot frontend
This simulates the API responses for testing purposes
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import random
import time

app = FastAPI(
    title="Mock RAG AI Chatbot API",
    description="Mock API for testing the RAG AI Chatbot frontend",
    version="1.0.0"
)

# Mock data for responses
MOCK_RESPONSES = {
    "global": {
        "What is humanoid robotics?": {
            "response": "Humanoid robotics is a branch of robotics focused on creating robots that resemble and mimic human behavior. These robots typically have a head, torso, two arms, and two legs, and may have a means of mobility. Humanoid robots are used in research, entertainment, and increasingly in service industries.",
            "sources": ["introduction.md", "chapter1.md"]
        },
        "What are the main components of a humanoid robot?": {
            "response": "The main components of a humanoid robot include: actuators (motors) for movement, sensors for perception, a control system for decision-making, a power system for energy, and a mechanical structure for physical form. Additionally, they often include cameras, microphones, and other sensory equipment.",
            "sources": ["components.md", "design.md"]
        },
        "How do humanoid robots maintain balance?": {
            "response": "Humanoid robots maintain balance using various techniques including feedback control systems, gyroscopes, accelerometers, and sometimes specialized balancing algorithms like the Zero Moment Point (ZMP) method. They often use a combination of hardware sensors and software algorithms to detect and correct balance issues.",
            "sources": ["balance.md", "control.md"]
        }
    },
    "selected_text": {
        "What does this selected text explain?": {
            "response": "Based on the selected text you provided, this explains the specific concepts mentioned in that text. The AI assistant is able to answer questions about the particular content you've highlighted.",
            "sources": ["selected_text_context"]
        }
    }
}

# Models for request/response
class ChatRequest(BaseModel):
    question_text: str
    query_mode: str
    session_id: Optional[str] = None
    selected_text: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    sources: List[str]

class SessionRequest(BaseModel):
    session_id: Optional[str] = None

class SessionResponse(BaseModel):
    session_id: str

class QueryModeRequest(BaseModel):
    session_id: str
    mode: str

@app.get("/")
async def root():
    return {"message": "Mock RAG AI Chatbot API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/session", response_model=SessionResponse)
async def create_session(request: SessionRequest = None):
    # Generate a mock session ID
    session_id = f"session_{int(time.time())}_{random.randint(1000, 9999)}"
    return SessionResponse(session_id=session_id)

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # Simulate processing delay
    time.sleep(random.uniform(0.5, 1.5))

    # Create a mock response based on the question
    question = request.question_text.lower()

    # Check if we have a specific response for this question
    responses = MOCK_RESPONSES.get(request.query_mode, MOCK_RESPONSES["global"])

    # Look for a matching question
    response_data = None
    for q, data in responses.items():
        if q.lower() in question or question in q.lower():
            response_data = data
            break

    # If no specific match, create a generic response
    if not response_data:
        if request.query_mode == "selected_text" and request.selected_text:
            response_data = {
                "response": f"Based on the selected text '{request.selected_text[:50]}...', I can provide information about this topic. This is a mock response demonstrating the selected text functionality.",
                "sources": ["selected_text_context"]
            }
        else:
            response_data = {
                "response": f"This is a mock response for your question: '{request.question_text}'. In the real implementation, this would be answered based on the humanoid robotics book content using RAG (Retrieval-Augmented Generation) techniques. The system would retrieve relevant information from the book and generate a contextual response.",
                "sources": ["mock_response.md"]
            }

    return ChatResponse(**response_data)

@app.post("/api/query-mode")
async def set_query_mode(request: QueryModeRequest):
    # Mock endpoint to set query mode
    return {"status": "success", "session_id": request.session_id, "mode": request.mode}

# Ingestion endpoints (mock)
@app.post("/api/ingest-content")
async def ingest_content():
    return {"status": "success", "message": "Content ingestion completed (mock)"}

@app.get("/api/health")
async def api_health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "mock_test:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )