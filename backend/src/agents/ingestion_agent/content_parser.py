"""
Content parser for the Ingestion Agent
Handles parsing of Docusaurus markdown content
"""
from typing import Dict, Any
import os
import asyncio
from ...utils.content_parser import content_parser


class IngestionContentParser:
    """Content parser specifically for the ingestion agent"""

    def __init__(self):
        """Initialize the ingestion content parser"""
        pass

    async def parse_content(self, content: str, source_path: str = "") -> Dict[str, Any]:
        """Parse content for ingestion"""
        # Use the general content parser
        parsed_data = content_parser.parse_markdown(content, source_path)
        return parsed_data

    async def parse_file(self, file_path: str) -> Dict[str, Any]:
        """Parse content from a file for ingestion"""
        # Use the general content parser
        parsed_data = content_parser.parse_from_file(file_path)
        return parsed_data

    async def validate_content(self, content: str) -> bool:
        """Validate that content is appropriate for ingestion"""
        # Basic validation
        if not content or len(content.strip()) == 0:
            return False

        # Check for minimum length
        if len(content) < 10:
            return False

        return True