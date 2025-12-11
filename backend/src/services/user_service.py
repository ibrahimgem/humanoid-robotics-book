from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext
from typing import Optional
import re
from ..models.user import User, UserProfile

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserService:
    def __init__(self, db: Session):
        self.db = db

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a plain password against a hashed password."""
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """Generate a hash for the given password."""
        return pwd_context.hash(password)

    def validate_email(self, email: str) -> bool:
        """Validate email format."""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

    def create_user(self, email: str, password: str, profile_data: Optional[dict] = None) -> Optional[User]:
        """Create a new user with the given email and password."""
        if not self.validate_email(email):
            raise ValueError("Invalid email format")

        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")

        hashed_password = self.get_password_hash(password)

        user = User(
            email=email,
            password_hash=hashed_password
        )

        try:
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)

            # Create user profile if profile data is provided
            if profile_data:
                self.create_user_profile(user.id, profile_data)

            return user
        except IntegrityError:
            self.db.rollback()
            raise ValueError("Email already registered")

    def create_user_profile(self, user_id: int, profile_data: dict) -> Optional[UserProfile]:
        """Create a profile for the given user."""
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

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate a user by email and password."""
        user = self.db.query(User).filter(User.email == email).first()
        if not user or not self.verify_password(password, user.password_hash):
            return None
        return user

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get a user by email."""
        return self.db.query(User).filter(User.email == email).first()

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get a user by ID."""
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_profile(self, user_id: int) -> Optional[UserProfile]:
        """Get a user profile by user ID."""
        return self.db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    def update_user_profile(self, user_id: int, profile_data: dict) -> Optional[UserProfile]:
        """Update a user profile."""
        profile = self.get_user_profile(user_id)
        if not profile:
            return None

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