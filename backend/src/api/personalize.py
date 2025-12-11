from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..models.user import User, UserProfile
from ..algorithms.personalization import PersonalizationAlgorithm
from ..services.user_service import UserService
from ..services.claude_service import ClaudePersonalizationService
from ..middleware.auth import get_current_user_id

router = APIRouter(prefix="/personalize", tags=["personalization"])

class PersonalizeRequest(BaseModel):
    chapter_id: str
    content: str
    difficulty_override: Optional[str] = None  # "beginner", "intermediate", "advanced"

class PersonalizeResponse(BaseModel):
    personalized_content: str
    cache_key: str
    user_level: str

@router.post("/chapter", response_model=PersonalizeResponse)
async def personalize_chapter(
    request: PersonalizeRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Personalize chapter content based on user profile.
    """
    user_service = UserService(db)

    # Get user profile
    user_profile = user_service.get_user_profile(user_id)
    if not user_profile:
        # If no profile exists, create a default one or use intermediate level
        user_profile = UserProfile(
            user_id=user_id,
            experience_level="intermediate"
        )

    # Override difficulty if provided
    if request.difficulty_override:
        user_profile.experience_level = request.difficulty_override

    # Apply personalization algorithm
    algorithm = PersonalizationAlgorithm()
    personalized_content = algorithm.ensure_performance(request.content, user_profile)

    # Enhance with Claude API if available
    try:
        claude_service = ClaudePersonalizationService()
        profile_data = {
            "experience_level": user_profile.experience_level,
            "software_experience": user_profile.software_experience,
            "hardware_experience": user_profile.hardware_experience,
            "preferred_language": user_profile.preferred_language,
            "learning_goals": user_profile.learning_goals
        }
        enhanced_content = claude_service.enhance_with_claude(
            personalized_content,
            profile_data,
            user_profile.experience_level
        )
        personalized_content = enhanced_content
    except Exception as e:
        # If Claude fails, continue with just the local algorithm
        print(f"Warning: Claude enhancement failed: {e}")

    # Generate cache key
    cache_key = f"user_{user_id}_chapter_{request.chapter_id}_level_{user_profile.experience_level}"

    return PersonalizeResponse(
        personalized_content=personalized_content,
        cache_key=cache_key,
        user_level=user_profile.experience_level or "intermediate"
    )