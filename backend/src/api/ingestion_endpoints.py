"""
Ingestion endpoints for the RAG AI Chatbot
API endpoints for content ingestion and processing
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any
import uuid
from ..models.book_content import BookContentCreate
from ..services.ingestion_service import ingestion_service

# Create router for ingestion endpoints
router = APIRouter()

@router.post("/ingest")
async def ingest_content(content_data: BookContentCreate):
    """Ingest and process book content"""
    try:
        # Generate a job ID for the ingestion task
        job_id = str(uuid.uuid4())

        # Start the ingestion process in the background
        await ingestion_service.process_content(content_data, job_id)

        return {
            "success": True,
            "job_id": job_id,
            "message": "Content ingestion started successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting ingestion: {str(e)}")


@router.get("/ingest/status/{job_id}")
async def get_ingestion_status(job_id: str):
    """Get the status of an ingestion job"""
    try:
        status = await ingestion_service.get_job_status(job_id)
        if status is None:
            raise HTTPException(status_code=404, detail="Job not found")

        return {
            "job_id": job_id,
            "status": status.get("status", "unknown"),
            "progress": status.get("progress", 0),
            "details": status.get("details", "")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting status: {str(e)}")


@router.post("/ingest/sync")
async def sync_content(content_paths: list[str]):
    """Synchronize content changes (re-ingest updated content)"""
    try:
        result = await ingestion_service.sync_content(content_paths)

        return {
            "success": True,
            "documents_synced": result.get("documents_synced", 0),
            "documents_failed": result.get("documents_failed", 0),
            "details": result.get("details", "")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during sync: {str(e)}")


@router.get("/ingest/health")
async def ingestion_health():
    """Health check for the ingestion service"""
    try:
        health_status = await ingestion_service.health_check()
        return {"status": "healthy" if health_status else "unhealthy"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}