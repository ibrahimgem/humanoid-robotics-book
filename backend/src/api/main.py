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
# Configure allowed origins for production
allowed_origins = [
    "http://localhost:3000",  # Local development
    "http://localhost:8000",  # Local backend testing
    "https://ibrahimgem.github.io",  # GitHub Pages production
    # Add your custom domain if you have one
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
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