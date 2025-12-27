"""
HuggingFace Spaces entry point for the RAG AI Chatbot FastAPI application
This file is specifically configured for HuggingFace Spaces deployment
"""
import os
import uvicorn
from src.api.main import app

# HuggingFace Spaces uses port 7860 by default
PORT = int(os.getenv("PORT", 7860))

if __name__ == "__main__":
    # Run the FastAPI application
    # Note: reload is disabled for production deployment
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=PORT,
        log_level="info"
    )
