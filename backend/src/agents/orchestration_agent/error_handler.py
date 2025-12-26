"""
Error handler for the Orchestration Agent
Handles errors gracefully and provides fallback responses
"""
from typing import Dict, Any, Optional
import traceback
import logging
from datetime import datetime
from ...utils.logger import logger


class ErrorHandler:
    """Error handler for the orchestration agent"""

    def __init__(self):
        """Initialize the error handler"""
        self.error_counts = {}
        self.last_error_time = {}

    async def handle_error(self, error: Exception, context: str = "", fallback_response: Optional[str] = None) -> Dict[str, Any]:
        """Handle an error and return a graceful fallback response"""
        error_type = type(error).__name__
        error_msg = str(error)
        timestamp = datetime.now().isoformat()

        # Log the error with context
        logger.error(f"Error in {context}: {error_type} - {error_msg}")
        logger.error(f"Traceback: {traceback.format_exc()}")

        # Track error occurrences
        self._track_error(error_type, timestamp)

        # Prepare fallback response
        if fallback_response is None:
            fallback_response = "I'm sorry, but I encountered an issue while processing your request. Please try again, or rephrase your question."

        return {
            "response": fallback_response,
            "sources": [],
            "follow_up_questions": [],
            "tone_analysis": {},
            "query_id": "",
            "response_time_ms": 0,
            "error_info": {
                "type": error_type,
                "message": error_msg,
                "context": context,
                "timestamp": timestamp
            }
        }

    async def handle_validation_error(self, error: Exception, field: str) -> Dict[str, Any]:
        """Handle validation errors specifically"""
        return await self.handle_error(
            error,
            f"validation of field '{field}'",
            f"I couldn't process your request because the {field} field was invalid. Please check your input and try again."
        )

    async def handle_service_unavailable(self, service_name: str) -> Dict[str, Any]:
        """Handle when a dependent service is unavailable"""
        error_msg = f"The {service_name} service is currently unavailable. Please try again later."
        return {
            "response": error_msg,
            "sources": [],
            "follow_up_questions": [],
            "tone_analysis": {},
            "query_id": "",
            "response_time_ms": 0,
            "error_info": {
                "type": "ServiceUnavailable",
                "message": error_msg,
                "service": service_name,
                "timestamp": datetime.now().isoformat()
            }
        }

    def _track_error(self, error_type: str, timestamp: str):
        """Track error occurrences for monitoring"""
        if error_type not in self.error_counts:
            self.error_counts[error_type] = 0
        self.error_counts[error_type] += 1
        self.last_error_time[error_type] = timestamp

    def get_error_summary(self) -> Dict[str, Any]:
        """Get a summary of recent errors for monitoring"""
        return {
            "error_counts": self.error_counts.copy(),
            "last_error_times": self.last_error_time.copy(),
            "total_errors": sum(self.error_counts.values())
        }

    async def validate_input(self, input_data: Dict[str, Any], required_fields: list) -> tuple[bool, str]:
        """Validate input data has required fields"""
        for field in required_fields:
            if field not in input_data or input_data[field] is None:
                return False, f"Missing required field: {field}"

        return True, ""

    async def sanitize_response(self, response: str) -> str:
        """Sanitize response to prevent any potential issues"""
        if not response:
            return "I couldn't generate a response for your query."

        # Remove any potentially problematic content
        sanitized = response.strip()

        # Ensure response is not too long (prevent potential issues)
        if len(sanitized) > 5000:  # Arbitrary limit
            sanitized = sanitized[:5000] + "... [truncated for safety]"

        return sanitized