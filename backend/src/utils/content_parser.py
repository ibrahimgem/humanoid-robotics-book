"""
Content parser to extract text from Docusaurus MDX files.
Handles parsing of MDX content and extracting text for vectorization.
"""
import os
import re
from typing import List, Dict, Tuple
from pathlib import Path
import frontmatter  # For parsing markdown with frontmatter

class ContentParser:
    def __init__(self, docs_path: str = "docs"):
        self.docs_path = Path(docs_path)

    def extract_text_from_mdx(self, file_path: str) -> Dict[str, any]:
        """
        Extract text content from an MDX file, preserving structural information.

        Args:
            file_path: Path to the MDX file

        Returns:
            Dictionary containing file metadata and extracted content
        """
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()

        # Parse frontmatter if present
        try:
            post = frontmatter.loads(content)
            raw_content = post.content
            metadata = post.metadata
        except:
            # If no frontmatter, treat entire content as raw content
            raw_content = content
            metadata = {}

        # Remove code blocks to avoid including code in text chunks
        text_only = self._remove_code_blocks(raw_content)

        # Extract headings to preserve document structure
        headings = self._extract_headings(raw_content)

        # Clean the text further
        clean_text = self._clean_text(text_only)

        # Get file info
        relative_path = Path(file_path).relative_to(self.docs_path)
        source_file = f"/{relative_path.as_posix()}"

        return {
            'source_file': source_file,
            'title': metadata.get('title', ''),
            'headings': headings,
            'content': clean_text,
            'raw_content': raw_content,
            'metadata': metadata
        }

    def _remove_code_blocks(self, text: str) -> str:
        """
        Remove code blocks from text while preserving surrounding text.
        """
        # Remove fenced code blocks (```...```)
        text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)

        # Remove inline code (backticks)
        text = re.sub(r'`[^`]*`', '', text)

        # Remove JSX components that might be in MDX
        text = re.sub(r'<.*?>', '', text)

        return text

    def _extract_headings(self, text: str) -> List[Dict[str, str]]:
        """
        Extract headings from the text to preserve document structure.
        """
        headings = []
        heading_pattern = r'^(#{1,6})\s+(.+)$'

        lines = text.split('\n')
        for line in lines:
            match = re.match(heading_pattern, line.strip())
            if match:
                level = len(match.group(1))
                title = match.group(2).strip()
                headings.append({
                    'level': level,
                    'title': title
                })

        return headings

    def _clean_text(self, text: str) -> str:
        """
        Clean text by removing extra whitespace and special characters.
        """
        # Remove markdown links but keep the text: [text](url) -> text
        text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)

        # Remove markdown formatting like **bold** and *italic*
        text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)  # Bold
        text = re.sub(r'\*([^*]+)\*', r'\1', text)      # Italic
        text = re.sub(r'__([^_]+)__', r'\1', text)      # Bold
        text = re.sub(r'_([^_]+)_', r'\1', text)        # Italic

        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)

        return text.strip()

    def get_all_docs_files(self) -> List[str]:
        """
        Get all MDX files from the docs directory.
        """
        mdx_files = []
        for root, dirs, files in os.walk(self.docs_path):
            for file in files:
                if file.lower().endswith('.mdx'):
                    mdx_files.append(os.path.join(root, file))
        return mdx_files

    def parse_all_docs(self) -> List[Dict]:
        """
        Parse all MDX files in the docs directory.
        """
        all_files = self.get_all_docs_files()
        parsed_docs = []

        for file_path in all_files:
            try:
                parsed_doc = self.extract_text_from_mdx(file_path)
                parsed_docs.append(parsed_doc)
            except Exception as e:
                print(f"Error parsing {file_path}: {e}")

        return parsed_docs

# Example usage
if __name__ == "__main__":
    parser = ContentParser()
    docs = parser.parse_all_docs()
    print(f"Parsed {len(docs)} documents")