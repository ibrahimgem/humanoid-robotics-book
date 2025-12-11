from sqlalchemy.orm import Session
from typing import Optional
from ..models.user import User, UserProfile
from ..services.user_service import UserService
from ..utils.password import verify_password

class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_service = UserService(db)

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate a user by email and password."""
        user = self.db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.password_hash):
            return None
        return user

    def store_profile_data_during_registration(self, user_id: int, profile_data: dict) -> Optional[UserProfile]:
        """Store profile data during registration."""
        profile = UserProfile(
            user_id=user_id,
            software_experience=profile_data.get('software_experience'),
            hardware_experience=profile_data.get('hardware_experience'),
            experience_level=profile_data.get('experience_level'),
            preferred_language=profile_data.get('preferred_language'),
            learning_goals=profile_data.get('learning_goals'),
            personalization_settings=profile_data.get('personalization_settings')
        )

        try:
            self.db.add(profile)
            self.db.commit()
            self.db.refresh(profile)
            return profile
        except Exception as e:
            self.db.rollback()
            raise e

    def update_profile_endpoint_implementation(self, user_id: int, profile_data: dict) -> Optional[UserProfile]:
        """Update profile endpoint implementation."""
        profile = self.db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if not profile:
            # If profile doesn't exist, create it
            profile = UserProfile(user_id=user_id)
            self.db.add(profile)

        for key, value in profile_data.items():
            if hasattr(profile, key):
                setattr(profile, key, value)

        try:
            self.db.commit()
            self.db.refresh(profile)
            return profile
        except Exception as e:
            self.db.rollback()
            raise e