from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)  # Foreign key to users table
    software_experience = Column(String, nullable=True)  # e.g., "beginner", "intermediate", "expert"
    hardware_experience = Column(String, nullable=True)  # e.g., "beginner", "intermediate", "expert"
    experience_level = Column(String, nullable=True)  # e.g., "beginner", "intermediate", "advanced"
    preferred_language = Column(String, nullable=True)  # e.g., "en", "ur", "es"
    learning_goals = Column(String, nullable=True)  # text field for user's goals
    personalization_settings = Column(String, nullable=True)  # JSON string for settings
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<UserProfile(id={self.id}, user_id={self.user_id})>"