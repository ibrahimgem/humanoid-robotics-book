"""
Follow-up question generator for the Answer Generation Agent
Handles generating relevant follow-up questions based on the conversation context
"""
from typing import List, Dict, Any
import os
from openai import OpenAI
from dotenv import load_dotenv
from ...utils.logger import logger

# Load environment variables
load_dotenv()

class FollowUpGenerator:
    """Follow-up question generator for the answer generation agent"""

    def __init__(self):
        """Initialize the follow-up generator with OpenRouter model"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            # Initialize OpenAI client with OpenRouter as base URL
            self.client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=api_key,
                default_headers={
                    'HTTP-Referer': 'https://your-site-url.com',
                    'X-Title': 'Humanoid Robotics Book AI',
                },
            )
            # Use a free model for follow-up questions (same as main response generator)
            self.model_name = 'meta-llama/llama-3.3-70b-instruct:free'
        else:
            logger.error("OPENROUTER_API_KEY not found in environment")
            self.client = None
            self.model_name = None

    async def generate_follow_up_questions(self, query: str, response: str, context_chunks: List[Dict[str, Any]], num_questions: int = 3) -> List[str]:
        """Generate relevant follow-up questions based on the conversation context"""
        if not self.client:
            return []

        try:
            # Prepare context from retrieved chunks
            context_text = ""
            for chunk in context_chunks:
                content = chunk.get('content', '')
                source_doc = chunk.get('metadata', {}).get('source_document', 'Unknown')

                if content:
                    context_text += f"\n\nFrom {source_doc}: {content}"

            # Create the prompt for generating follow-up questions
            prompt = f"""
            You are an expert educator in humanoid robotics. Based on the following query, response, and context, generate {num_questions} relevant follow-up questions that would help deepen the learner's understanding of the topic.

            Original Query: {query}

            Response: {response}

            Context: {context_text}

            Guidelines for follow-up questions:
            - Questions should be relevant to the original topic and response
            - Questions should encourage deeper thinking about the concepts
            - Questions should be answerable based on the humanoid robotics book content
            - Vary the type of questions (conceptual, application, comparison, etc.)
            - Keep questions clear and concise
            - Focus on key concepts mentioned in the response or context

            Output Format:
            Return only the follow-up questions as a numbered list, one question per line, without any additional text or headers.
            """

            # Generate follow-up questions using OpenRouter
            chat_response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )

            # Extract the questions from the response
            questions_text = chat_response.choices[0].message.content if chat_response.choices else ""

            # Parse the numbered list of questions
            questions = []
            for line in questions_text.strip().split('\n'):
                # Remove numbering (e.g., "1.", "2.", etc.) and whitespace
                line = line.strip()
                if line:
                    # Remove leading numbering if present
                    if line[0].isdigit() and line[1:2] == '.':
                        line = line[2:].strip()

                    if line:  # Only add non-empty questions
                        questions.append(line)

            # Ensure we return exactly the requested number of questions
            return questions[:num_questions]

        except Exception as e:
            logger.error(f"Error generating follow-up questions: {str(e)}")
            return []

    async def validate_questions(self, questions: List[str]) -> bool:
        """Validate that generated questions are appropriate"""
        if not questions:
            return True  # Empty list is valid

        # Check that each question is non-empty and has reasonable length
        for question in questions:
            if not question or len(question.strip()) < 5 or len(question) > 200:
                return False

        return True

    async def rank_questions_by_relevance(self, questions: List[str], original_query: str) -> List[str]:
        """Rank questions by relevance to the original query"""
        if not questions:
            return questions

        # In a more sophisticated implementation, we would use embeddings to rank relevance
        # For now, we'll return the questions as-is since they were already generated
        # in order of relevance by the LLM
        return questions