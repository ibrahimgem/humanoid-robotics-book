"""
Content parser utility for the RAG AI Chatbot
Parses Docusaurus markdown content into structured format
"""
import re
from typing import Dict, List, Optional
from pathlib import Path


class ContentParser:
    """Utility class for parsing Docusaurus markdown content"""

    def __init__(self):
        """Initialize the content parser"""
        pass

    def parse_markdown(self, content: str, source_path: str = "") -> Dict:
        """Parse markdown content and extract structured information"""
        # Extract title from first H1
        title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        title = title_match.group(1) if title_match else "Untitled"

        # Extract H2 and H3 headers as sections
        headers = []
        for match in re.finditer(r'^(#{2,3})\s+(.+)$', content, re.MULTILINE):
            level = len(match.group(1))
            header_text = match.group(2)
            headers.append({
                'level': level,
                'text': header_text,
                'position': match.start()
            })

        # Extract text content without markdown syntax
        # Remove headers but keep the text
        clean_content = re.sub(r'^#+\s+.*$', '', content, flags=re.MULTILINE)
        clean_content = re.sub(r'\*{2}(.+?)\*{2}', r'\1', clean_content)  # Bold
        clean_content = re.sub(r'_{2}(.+?)_{2}', r'\1', clean_content)  # Bold
        clean_content = re.sub(r'\*(.+?)\*', r'\1', clean_content)  # Italic
        clean_content = re.sub(r'`(.+?)`', r'\1', clean_content)  # Code
        clean_content = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', clean_content)  # Links

        # Clean up extra whitespace
        clean_content = re.sub(r'\n\s*\n', '\n\n', clean_content).strip()

        return {
            'title': title,
            'source_path': source_path,
            'headers': headers,
            'content': clean_content,
            'word_count': len(clean_content.split()),
            'character_count': len(clean_content)
        }

    def parse_from_file(self, file_path: str) -> Dict:
        """Parse content from a markdown file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
                return self.parse_markdown(content, file_path)
        except Exception as e:
            print(f"Error parsing file {file_path}: {str(e)}")
            return {
                'title': 'Error',
                'source_path': file_path,
                'headers': [],
                'content': '',
                'word_count': 0,
                'character_count': 0
            }

    def extract_text_from_mdast(self, content: str) -> str:
        """Extract plain text from markdown abstract syntax tree"""
        # Remove markdown syntax but preserve content
        # Remove headers
        text = re.sub(r'^#+\s+', '', content, flags=re.MULTILINE)
        # Remove emphasis
        text = re.sub(r'\*{1,3}(.+?)\*{1,3}', r'\1', text)
        text = re.sub(r'_{1,3}(.+?)_{1,3}', r'\1', text)
        # Remove code blocks
        text = re.sub(r'```.*?\n(.*?)```', r'\1', text, flags=re.DOTALL)
        # Remove inline code
        text = re.sub(r'`(.+?)`', r'\1', text)
        # Remove links but keep link text
        text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)
        # Remove images but keep alt text
        text = re.sub(r'!\[([^\]]*)\]\(.+?\)', r'\1', text)

        # Clean up whitespace
        text = re.sub(r'\n\s*\n', '\n', text).strip()
        return text


# Global content parser instance
content_parser = ContentParser()