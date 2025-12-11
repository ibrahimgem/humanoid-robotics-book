from typing import Dict, Any, Optional
from ..models.user import UserProfile
import re

class PersonalizationAlgorithm:
    """
    Personalization algorithm that adapts content based on user profile data.
    """

    def __init__(self):
        self.difficulty_levels = {
            "beginner": 1,
            "intermediate": 2,
            "advanced": 3
        }

    def adapt_content(self, content: str, user_profile: UserProfile) -> str:
        """
        Adapt content based on user profile.
        """
        # Get user's experience level
        user_level = user_profile.experience_level or "intermediate"

        # Adjust content based on experience level
        adapted_content = self._adjust_content_for_level(content, user_level)

        # Adjust based on software/hardware experience
        adapted_content = self._adjust_for_experience(adapted_content, user_profile)

        # Adjust based on preferred language (if needed)
        adapted_content = self._adjust_for_language(adapted_content, user_profile)

        return adapted_content

    def _adjust_content_for_level(self, content: str, user_level: str) -> str:
        """
        Adjust content based on user's experience level.
        """
        if user_level == "beginner":
            return self._simplify_content(content)
        elif user_level == "advanced":
            return self._enhance_content(content)
        else:  # intermediate
            return content

    def _simplify_content(self, content: str) -> str:
        """
        Simplify content for beginners.
        """
        # Add more explanations for complex terms
        content = re.sub(r'\b(advanced|complex|sophisticated)\b', 'detailed', content, flags=re.IGNORECASE)

        # Add beginner-friendly explanations
        content += "\n\n**Beginner Tip:** This concept builds on fundamental principles. Consider reviewing the basics if this seems challenging."

        # Break down complex sentences
        # This is a simplified approach - in a real implementation, you might use NLP techniques
        return content

    def _enhance_content(self, content: str) -> str:
        """
        Enhance content for advanced users.
        """
        # Add advanced insights
        content += "\n\n**Advanced Insight:** For deeper understanding, consider the implications of this concept in edge cases and performance-critical applications."

        return content

    def _adjust_for_experience(self, content: str, user_profile: UserProfile) -> str:
        """
        Adjust content based on user's software and hardware experience.
        """
        adjustments = []

        if user_profile.software_experience:
            if "beginner" in user_profile.software_experience.lower():
                adjustments.append("\n**Software Context:** This section assumes basic programming knowledge.")
            elif "advanced" in user_profile.software_experience.lower():
                adjustments.append("\n**Software Context:** This section includes advanced programming concepts.")

        if user_profile.hardware_experience:
            if "beginner" in user_profile.hardware_experience.lower():
                adjustments.append("\n**Hardware Context:** This section assumes basic hardware knowledge.")
            elif "advanced" in user_profile.hardware_experience.lower():
                adjustments.append("\n**Hardware Context:** This section includes advanced hardware concepts.")

        for adj in adjustments:
            content += adj

        return content

    def _adjust_for_language(self, content: str, user_profile: UserProfile) -> str:
        """
        Adjust content based on user's preferred language (if needed for localization).
        """
        # This is a placeholder - actual implementation would handle localization
        return content

    def handle_edge_cases(self, content: str, user_profile: UserProfile) -> str:
        """
        Handle edge cases in personalization.
        """
        if not user_profile:
            # Return default content if no profile exists
            return content

        if not content:
            return content

        return self.adapt_content(content, user_profile)

    def ensure_performance(self, content: str, user_profile: UserProfile) -> str:
        """
        Ensure personalization algorithm performs efficiently.
        """
        # This is a simplified implementation
        # In a real system, you'd want to implement caching and optimization
        import time
        start_time = time.time()

        result = self.handle_edge_cases(content, user_profile)

        end_time = time.time()
        processing_time = end_time - start_time

        # Log if processing takes too long
        if processing_time > 3.0:  # More than 3 seconds
            print(f"Warning: Personalization took {processing_time:.2f} seconds")

        return result