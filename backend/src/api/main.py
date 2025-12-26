"""
Main FastAPI application for the RAG AI Chatbot
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app
app = FastAPI(
    title="RAG AI Chatbot API",
    description="API for the RAG AI Chatbot integrated with Docusaurus book",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
from . import chat_endpoints, ingestion_endpoints

app.include_router(chat_endpoints.router, prefix="/api", tags=["chat"])
app.include_router(ingestion_endpoints.router, prefix="/api", tags=["ingestion"])

@app.get("/")
async def root():
    return {"message": "RAG AI Chatbot API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}