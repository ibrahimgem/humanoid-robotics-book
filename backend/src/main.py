"""
Main application entry point for the RAG Chatbot API.
"""
import os
from dotenv import load_dotenv
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Load environment variables from .env file
load_dotenv()

from src.api.chat_endpoints import router as chat_router
from src.api.auth import router as auth_router
from src.api.personalize import router as personalize_router
from src.api.translation import router as translation_router
from src.database.connection import init_db
from src.services.content_sync_service import content_sync_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler for startup and shutdown events.
    """
    # Startup
    logger.info("Initializing database...")
    init_db()
    logger.info("Database initialized successfully")

    # Start content synchronization service in the background
    logger.info("Starting content synchronization service...")
    # Note: In a real implementation, you'd want to manage this as a proper background task
    # For now, we'll just log that it should start
    logger.info("Content synchronization service ready")

    yield  # Application runs here

    # Shutdown
    logger.info("Shutting down content synchronization service...")
    content_sync_service.stop_monitoring()
    logger.info("Application shutdown complete")

# Create the main FastAPI application with lifespan
app = FastAPI(
    title="Humanoid Robotics Book RAG Chatbot API",
    description="API for the interactive RAG-based chatbot that allows readers to ask questions about the Humanoid Robotics Book content.",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware to allow requests from the Docusaurus frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your Docusaurus site URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # Expose custom headers that the frontend might need
    expose_headers=["Access-Control-Allow-Origin"]
)

# Include the chat API routes
app.include_router(chat_router)

# Include the auth API routes
app.include_router(auth_router)

# Include the personalization API routes
app.include_router(personalize_router)

# Include the translation API routes
app.include_router(translation_router)

@app.get("/")
async def root():
    """Root endpoint for basic health check."""
    return {
        "message": "Humanoid Robotics Book RAG Chatbot API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/info")
async def info():
    """Get detailed information about the API."""
    return {
        "title": "Humanoid Robotics Book RAG Chatbot API",
        "version": "1.0.0",
        "description": "API for the interactive RAG-based chatbot that allows readers to ask questions about the Humanoid Robotics Book content",
        "endpoints": [
            {
                "path": "/chat/query",
                "method": "POST",
                "description": "Submit a query to the RAG system"
            },
            {
                "path": "/chat/query-selected",
                "method": "POST",
                "description": "Submit a query with selected text context"
            },
            {
                "path": "/health",
                "method": "GET",
                "description": "Health check endpoint"
            }
        ],
        "models_used": [
            "text-embedding-ada-002",  # For embeddings
            "gpt-4-turbo"              # For response generation
        ],
        "data_sources": [
            "Humanoid Robotics Book content",
            "Vectorized using Qdrant Cloud",
            "Metadata stored in Neon Postgres"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", "8000")),
        reload=True  # Enable auto-reload during development
    )