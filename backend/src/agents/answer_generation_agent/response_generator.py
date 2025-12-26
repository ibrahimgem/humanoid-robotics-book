"""
Response generator for the Answer Generation Agent
Handles generating responses using OpenRouter models based on context
"""
from typing import List, Dict, Any
import os
from openai import OpenAI
from dotenv import load_dotenv
from ...utils.logger import logger
from .follow_up_generator import FollowUpGenerator
from .tone_analyzer import ToneAnalyzer

# Load environment variables
load_dotenv()

class ResponseGenerator:
    """Response generator for the answer generation agent"""

    def __init__(self):
        """Initialize the response generator with OpenRouter model"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            # Initialize OpenAI client with OpenRouter as base URL
            self.client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=api_key,
                default_headers={
                    'HTTP-Referer': 'https://your-site-url.com',  # Optional: Replace with your site URL
                    'X-Title': 'Humanoid Robotics Book AI',       # Optional: Replace with your app name
                },
            )

            # Use free models from OpenRouter (models with :free suffix don't require credits)
            # Using a fallback mechanism to try different models
            available_models = [
                'meta-llama/llama-3.3-70b-instruct:free',  # Free Llama 3.3 70B model
                'google/gemini-2.0-flash-exp:free',  # Free Gemini 2.0 Flash
                'meta-llama/llama-3.1-405b-instruct:free',  # Free Llama 3.1 405B
                'google/gemini-flash-1.5:free',  # Free Gemini Flash 1.5
                'meta-llama/llama-3.1-8b-instruct:free',  # Free Llama 3.1 8B
                'mistralai/mistral-7b-instruct:free',  # Free Mistral 7B
                'google/gemma-2-9b-it:free',  # Free Gemma 2 9B
                'microsoft/phi-3-mini-128k-instruct:free'  # Free Phi-3 Mini
            ]

            self.model_name = None
            for model_name in available_models:
                try:
                    # Test if the model is accessible by making a simple call
                    response = self.client.chat.completions.create(
                        model=model_name,
                        messages=[
                            {"role": "user", "content": "Test if model is accessible"}
                        ],
                        max_tokens=5,
                        temperature=0
                    )
                    self.model_name = model_name
                    logger.info(f"Successfully validated OpenRouter model: {model_name}")
                    break
                except Exception as e:
                    logger.warning(f"Model {model_name} not accessible: {e}")
                    continue

            if self.model_name is None:
                logger.error("Could not initialize any OpenRouter model - insufficient credits or invalid key")
                # Initialize with a fallback mechanism when no models are accessible
                self.fallback_enabled = True
                logger.info("Fallback mechanism enabled due to model unavailability")
            else:
                self.fallback_enabled = False
        else:
            logger.error("OPENROUTER_API_KEY not found in environment")
            self.client = None
            self.model_name = None
            self.fallback_enabled = True

        # Initialize additional components
        self.follow_up_generator = FollowUpGenerator()
        self.tone_analyzer = ToneAnalyzer()

    async def generate_response(self, query: str, context_chunks: List[Dict[str, Any]],
                              query_mode: str = "global") -> Dict[str, Any]:
        """Generate a response based on the query and context chunks"""
        if not self.client or self.fallback_enabled:
            # Use fallback mechanism when OpenRouter is not available
            logger.warning("Using fallback response generation due to OpenRouter unavailability")

            # Prepare context from retrieved chunks
            context_text = ""
            sources = []

            for chunk in context_chunks:
                content = chunk.get('content', '')
                source_doc = chunk.get('metadata', {}).get('source_document', 'Unknown')

                if content:
                    context_text += f"\n\nFrom {source_doc}: {content}"
                    if source_doc not in sources:
                        sources.append(source_doc)

            # Create a simple fallback response based on context
            if context_text:
                if query_mode == "selected_text":
                    response_text = f"Based on the provided context, here's what I can share about '{query}':\n\n{context_text[:500]}... [Context provided but AI unavailable due to credit limitations]"
                else:
                    response_text = f"I found some information related to your question '{query}' in the provided context:\n\n{context_text[:500]}... [AI temporarily unavailable due to credit limitations - showing context]"
            else:
                response_text = f"Sorry, I couldn't find any relevant information about '{query}' in the available content. [AI temporarily unavailable due to credit limitations]"

            # Generate empty follow-up questions as fallback
            follow_up_questions = []

            # Create a basic tone analysis as fallback
            tone_analysis = {
                "score": 0.0,
                "positive_indicators": [],
                "negative_indicators": [],
                "technical_accuracy": 0.0,
                "readability_score": 0.0,
                "educational_quality": 0.0,
                "suggestions": ["AI service temporarily unavailable due to credit limitations"]
            }

            return {
                "response": response_text,
                "sources": sources,
                "follow_up_questions": follow_up_questions,
                "tone_analysis": tone_analysis,
                "query_id": "",  # Will be filled in by the calling function
                "response_time_ms": 0  # Will be calculated by the calling function
            }

        try:
            # Prepare context from retrieved chunks
            context_text = ""
            sources = []

            for chunk in context_chunks:
                content = chunk.get('content', '')
                source_doc = chunk.get('metadata', {}).get('source_document', 'Unknown')

                if content:
                    context_text += f"\n\nFrom {source_doc}: {content}"
                    if source_doc not in sources:
                        sources.append(source_doc)

            # Create the prompt for the LLM
            if query_mode == "selected_text":
                system_prompt = f"""
                You are an expert assistant for the Humanoid Robotics Book.
                Answer the user's question based ONLY on the provided selected text context.

                Selected Text Context: {context_text}

                Instructions:
                - Answer only based on the provided context
                - Do not include information not found in the context
                - Be concise and accurate
                - If the context doesn't contain enough information to answer, say so
                """
            else:  # global mode
                system_prompt = f"""
                You are an expert assistant for the Humanoid Robotics Book.
                Answer the user's question based on the provided context from the humanoid robotics book.

                Context: {context_text}

                Instructions:
                - Answer based on the provided context
                - Be accurate and relevant to humanoid robotics
                - Be concise but comprehensive
                - If the context doesn't contain enough information to answer, say so
                """

            # Generate response using OpenRouter via OpenAI client
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                temperature=0.3,
                max_tokens=1000
            )

            # Extract the text response
            response_text = response.choices[0].message.content if response.choices else "I couldn't generate a response based on the provided context."

            # Generate follow-up questions
            follow_up_questions = await self.follow_up_generator.generate_follow_up_questions(
                query, response_text, context_chunks
            )

            # Analyze the tone of the response
            tone_analysis = await self.tone_analyzer.analyze_tone(response_text)

            return {
                "response": response_text,
                "sources": sources,
                "follow_up_questions": follow_up_questions,
                "tone_analysis": tone_analysis,
                "query_id": "",  # Will be filled in by the calling function
                "response_time_ms": 0  # Will be calculated by the calling function
            }

        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            # Use fallback response when there's an error with the API call
            context_text = ""
            sources = []

            for chunk in context_chunks:
                content = chunk.get('content', '')
                source_doc = chunk.get('metadata', {}).get('source_document', 'Unknown')

                if content:
                    context_text += f"\n\nFrom {source_doc}: {content}"
                    if source_doc not in sources:
                        sources.append(source_doc)

            if context_text:
                response_text = f"I found some information related to your question '{query}' in the provided context, but there was an issue with the AI service:\n\n{context_text[:500]}... [AI service temporarily unavailable]"
            else:
                response_text = f"Sorry, I encountered an error while processing your request about '{query}'. [Service temporarily unavailable]"

            return {
                "response": response_text,
                "sources": sources,
                "follow_up_questions": [],
                "tone_analysis": {},
                "query_id": "",
                "response_time_ms": 0
            }

    async def validate_response(self, response: str) -> bool:
        """Validate that a response is appropriate"""
        if not response or len(response.strip()) == 0:
            return False

        # Check for common error responses
        error_indicators = [
            "error", "couldn't generate", "encountered an error", "api key not configured"
        ]

        response_lower = response.lower()
        for indicator in error_indicators:
            if indicator in response_lower:
                return False

        return True

    async def format_response(self, response_data: Dict[str, Any]) -> Dict[str, Any]:
        """Format the response for the API"""
        # Add any additional formatting here
        return response_data

    async def generate_educational_response(self, query: str, context_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate a response with educational focus"""
        if not self.client or self.fallback_enabled:
            # Use fallback mechanism when OpenRouter is not available
            logger.warning("Using fallback educational response generation due to OpenRouter unavailability")

            # Prepare context from retrieved chunks
            context_text = ""
            sources = []

            for chunk in context_chunks:
                content = chunk.get('content', '')
                source_doc = chunk.get('metadata', {}).get('source_document', 'Unknown')

                if content:
                    context_text += f"\n\nFrom {source_doc}: {content}"
                    if source_doc not in sources:
                        sources.append(source_doc)

            # Create a simple educational fallback response based on context
            if context_text:
                response_text = f"""Here's an educational response about '{query}' based on the provided context:

**Key Points:**
{context_text[:500]}...

**Summary:**
This information comes from the provided context. [Educational AI service temporarily unavailable due to credit limitations]"""
            else:
                response_text = f"Sorry, I couldn't find any relevant information about '{query}' in the available content. [Educational AI service temporarily unavailable due to credit limitations]"

            # Generate empty follow-up questions as fallback
            follow_up_questions = []

            # Create a basic tone analysis as fallback
            tone_analysis = {
                "score": 0.0,
                "positive_indicators": [],
                "negative_indicators": [],
                "technical_accuracy": 0.0,
                "readability_score": 0.0,
                "educational_quality": 0.0,
                "suggestions": ["Educational AI service temporarily unavailable due to credit limitations"]
            }

            return {
                "response": response_text,
                "sources": sources,
                "follow_up_questions": follow_up_questions,
                "tone_analysis": tone_analysis,
                "query_id": "",
                "response_time_ms": 0
            }

        try:
            # Prepare context from retrieved chunks
            context_text = ""
            sources = []

            for chunk in context_chunks:
                content = chunk.get('content', '')
                source_doc = chunk.get('metadata', {}).get('source_document', 'Unknown')

                if content:
                    context_text += f"\n\nFrom {source_doc}: {content}"
                    if source_doc not in sources:
                        sources.append(source_doc)

            # Create the prompt for the LLM with educational focus
            system_prompt = f"""
            You are an expert educator in humanoid robotics. Provide an educational response that helps the learner understand the topic based on the provided context from the humanoid robotics book.

            Context: {context_text}

            Question: {query}

            Response Format:
            1. Start with a clear, concise answer to the question
            2. Explain the key concepts in an accessible way
            3. If relevant, provide examples or analogies to clarify complex topics
            4. Include any important technical details from the context
            5. End with a brief summary or key takeaway
            6. If the context doesn't contain enough information to answer, acknowledge this and suggest where the learner might find more information

            Educational Guidelines:
            - Use clear and accessible language appropriate for technical learners
            - Maintain an encouraging and supportive tone
            - Connect concepts to broader principles in humanoid robotics
            - Highlight important technical terms and define them when first used
            - Ensure accuracy in all technical information
            """

            # Generate response using OpenRouter via OpenAI client
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                temperature=0.2,
                max_tokens=1200
            )

            # Extract the text response
            response_text = response.choices[0].message.content if response.choices else "I couldn't generate a response based on the provided context."

            # Generate follow-up questions
            follow_up_questions = await self.follow_up_generator.generate_follow_up_questions(
                query, response_text, context_chunks
            )

            # Analyze the tone of the response
            tone_analysis = await self.tone_analyzer.analyze_tone(response_text)

            return {
                "response": response_text,
                "sources": sources,
                "follow_up_questions": follow_up_questions,
                "tone_analysis": tone_analysis,
                "query_id": "",
                "response_time_ms": 0
            }

        except Exception as e:
            logger.error(f"Error generating educational response: {str(e)}")
            # Use fallback response when there's an error with the API call
            context_text = ""
            sources = []

            for chunk in context_chunks:
                content = chunk.get('content', '')
                source_doc = chunk.get('metadata', {}).get('source_document', 'Unknown')

                if content:
                    context_text += f"\n\nFrom {source_doc}: {content}"
                    if source_doc not in sources:
                        sources.append(source_doc)

            if context_text:
                response_text = f"""I found some information related to your question '{query}' in the provided context, but there was an issue with the educational AI service:

{context_text[:500]}...

[AI service temporarily unavailable - showing context]"""
            else:
                response_text = f"Sorry, I encountered an error while processing your request about '{query}'. [Educational service temporarily unavailable]"

            return {
                "response": response_text,
                "sources": sources,
                "follow_up_questions": [],
                "tone_analysis": {},
                "query_id": "",
                "response_time_ms": 0
            }