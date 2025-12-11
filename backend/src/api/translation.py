from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..services.translation_service import TranslationService
from ..services.terminology_service import TerminologyPreservationService
from ..services.cache_service import CacheService
from ..middleware.auth import get_current_user_id

router = APIRouter(prefix="/translate", tags=["translation"])

class TranslateRequest(BaseModel):
    text: str
    source_lang: Optional[str] = "en"
    target_lang: Optional[str] = "ur"

class TranslateResponse(BaseModel):
    original_text: str
    translated_text: str
    cache_key: str

@router.post("/urdu", response_model=TranslateResponse)
async def translate_to_urdu(
    request: TranslateRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Translate content to Urdu while preserving technical terminology.
    """
    # Create services
    translation_service = TranslationService()
    terminology_service = TerminologyPreservationService()
    cache_service = CacheService()

    # Generate cache key
    cache_key = f"urdu_translation_user_{user_id}_{hash(request.text)}"

    # Check if translation is already cached
    cached_result = cache_service.get_cached_content(cache_key)
    if cached_result:
        return TranslateResponse(
            original_text=request.text,
            translated_text=cached_result,
            cache_key=cache_key
        )

    # First, preserve technical terms in the original text
    text_with_terms = terminology_service.preserve_technical_terms(request.text)

    # Then translate the text
    translated_text = translation_service.ensure_response_time(text_with_terms)

    if not translated_text:
        # If translation fails, return original text with error message
        translated_text = translation_service.handle_translation_failures()

    # Cache the result
    cache_service.cache_personalized_content(cache_key, translated_text, user_id)

    return TranslateResponse(
        original_text=request.text,
        translated_text=translated_text,
        cache_key=cache_key
    )