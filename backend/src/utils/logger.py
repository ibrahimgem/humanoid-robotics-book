"""
Logging utilities for the RAG AI Chatbot
"""
import logging
import sys
from datetime import datetime
from typing import Any, Dict


class Logger:
    """Custom logger class for the RAG AI Chatbot"""

    def __init__(self, name: str = "RAG_AI_Chatbot", level: int = logging.INFO):
        """Initialize the logger"""
        self.logger = logging.getLogger(name)
        self.logger.setLevel(level)

        # Create console handler
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(level)

        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)

        # Add handler to logger
        if not self.logger.handlers:
            self.logger.addHandler(handler)

    def info(self, message: str):
        """Log info message"""
        self.logger.info(message)

    def warning(self, message: str):
        """Log warning message"""
        self.logger.warning(message)

    def error(self, message: str):
        """Log error message"""
        self.logger.error(message)

    def debug(self, message: str):
        """Log debug message"""
        self.logger.debug(message)

    def log_response_time(self, endpoint: str, response_time_ms: float):
        """Log response time for an endpoint"""
        # Determine performance level based on response time
        if response_time_ms < 500:
            perf_level = "FAST"
        elif response_time_ms < 1000:
            perf_level = "MODERATE"
        elif response_time_ms < 2000:
            perf_level = "SLOW"
        else:
            perf_level = "VERY_SLOW"

        self.info(f"Endpoint: {endpoint}, Response Time: {response_time_ms}ms [{perf_level}]")

    def log_performance_metrics(self, endpoint: str, response_time_ms: float,
                              query_length: int = 0, context_size: int = 0):
        """Log detailed performance metrics"""
        self.info(f"Performance Metrics - Endpoint: {endpoint}, "
                 f"Response Time: {response_time_ms}ms, "
                 f"Query Length: {query_length} chars, "
                 f"Context Size: {context_size} chars")

    def log_user_interaction(self, user_id: str, query: str, response: str):
        """Log user interaction"""
        self.info(f"User: {user_id}, Query: {query[:50]}..., Response: {response[:50]}...")


# Global logger instance
logger = Logger()