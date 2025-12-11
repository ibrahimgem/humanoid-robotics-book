from typing import Optional
import os
from openai import OpenAI
from ..algorithms.personalization import PersonalizationAlgorithm

class ClaudePersonalizationService:
    """
    Service to enhance personalization with Claude API.
    """
    def __init__(self):
        self.client = OpenAI()
        self.personalization_algorithm = PersonalizationAlgorithm()

    def enhance_with_claude(
        self,
        content: str,
        user_profile_data: dict,
        difficulty_level: Optional[str] = None
    ) -> str:
        """
        Enhance content personalization using Claude API.
        """
        try:
            # Prepare a prompt for Claude based on user profile and content
            profile_context = self._build_profile_context(user_profile_data, difficulty_level)

            prompt = f"""
            {profile_context}

            Original content:
            {content}

            Please adapt this content to match the user's profile. Make it more engaging and relevant to their background.
            """

            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",  # Using a more accessible model
                messages=[
                    {"role": "system", "content": "You are an expert at adapting technical content to match the user's experience level and background."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.7
            )

            enhanced_content = response.choices[0].message.content
            return enhanced_content

        except Exception as e:
            print(f"Error calling Claude API: {e}")
            # Fallback to the local personalization algorithm
            return self.personalization_algorithm.adapt_content(
                content,
                type('UserProfile', (), user_profile_data)()  # Create a mock UserProfile object
            )

    def _build_profile_context(self, user_profile_data: dict, difficulty_level: Optional[str]) -> str:
        """
        Build context from user profile for Claude.
        """
        context_parts = ["User Profile:"]

        if difficulty_level:
            context_parts.append(f"- Experience Level: {difficulty_level}")
        elif user_profile_data.get('experience_level'):
            context_parts.append(f"- Experience Level: {user_profile_data['experience_level']}")

        if user_profile_data.get('software_experience'):
            context_parts.append(f"- Software Experience: {user_profile_data['software_experience']}")

        if user_profile_data.get('hardware_experience'):
            context_parts.append(f"- Hardware Experience: {user_profile_data['hardware_experience']}")

        if user_profile_data.get('preferred_language'):
            context_parts.append(f"- Preferred Language: {user_profile_data['preferred_language']}")

        if user_profile_data.get('learning_goals'):
            context_parts.append(f"- Learning Goals: {user_profile_data['learning_goals']}")

        return "\n".join(context_parts)