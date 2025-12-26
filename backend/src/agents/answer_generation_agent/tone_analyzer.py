"""
Tone analyzer for the Answer Generation Agent
Analyzes and ensures consistency of the educational tone in responses
"""
from typing import Dict, Any, List
import re
from ...utils.logger import logger


class ToneAnalyzer:
    """Tone analyzer for ensuring educational consistency in responses"""

    def __init__(self):
        """Initialize the tone analyzer"""
        # Educational tone indicators
        self.positive_indicators = {
            'encouraging': [
                'remember', 'important to note', 'key concept', 'crucial to understand',
                'it\'s helpful', 'understanding this', 'good question', 'great point',
                'let\'s explore', 'let\'s consider', 'it\'s worth noting', 'helpful to know',
                'as you learn', 'as you continue', 'a good way to think about', 'remember that',
                'keep in mind', 'noted that', 'worth mentioning'
            ],
            'clear_explanation': [
                'this means', 'in other words', 'to put it simply', 'specifically',
                'for example', 'for instance', 'such as', 'like', 'similar to',
                'in this case', 'this is because', 'the reason is', 'essentially',
                'basically', 'in essence', 'the core idea', 'the fundamental concept'
            ],
            'structured_learning': [
                'first', 'second', 'third', 'next', 'finally', 'in summary',
                'to summarize', 'in conclusion', 'key takeaway', 'main point',
                'important aspect', 'primary consideration', 'critical factor',
                'essential element', 'major benefit', 'significant challenge'
            ]
        }

        # Negative indicators (unprofessional, casual, etc.)
        self.negative_indicators = [
            'idk', 'dunno', 'maybe', 'probably', 'sort of', 'kind of',
            'umm', 'uhh', 'well', 'you know', 'like', 'basically',
            'anyway', 'anyways', 'so', 'actually', 'really', 'very',
            'totally', 'definitely', 'obviously', 'clearly', 'simply',
            'just', 'pretty much', 'most likely', 'might be', 'could be'
        ]

        # Technical terminology for humanoid robotics
        self.technical_terms = [
            'actuator', 'sensor', 'locomotion', 'balance control', 'inverse kinematics',
            'forward kinematics', 'degrees of freedom', 'center of mass', 'zero moment point',
            'ROS', 'robot operating system', 'gait', 'walking pattern', 'inverse dynamics',
            'motion planning', 'path planning', 'trajectory', 'control system', 'feedback loop',
            'PID controller', 'impedance control', 'compliant control', 'stability', 'posture',
            'kinematics', 'dynamics', 'torque', 'velocity', 'acceleration', 'friction compensation'
        ]

    async def analyze_tone(self, response: str) -> Dict[str, Any]:
        """Analyze the educational tone of a response"""
        analysis = {
            'score': 0.0,
            'positive_indicators': [],
            'negative_indicators': [],
            'technical_accuracy': 0.0,
            'readability_score': 0.0,
            'educational_quality': 0.0,
            'suggestions': []
        }

        try:
            # Convert to lowercase for comparison
            lower_response = response.lower()

            # Check positive indicators
            for category, indicators in self.positive_indicators.items():
                for indicator in indicators:
                    if indicator.lower() in lower_response:
                        analysis['positive_indicators'].append(indicator)

            # Check negative indicators
            for indicator in self.negative_indicators:
                if indicator.lower() in lower_response:
                    analysis['negative_indicators'].append(indicator)

            # Calculate scores
            positive_count = len(analysis['positive_indicators'])
            negative_count = len(analysis['negative_indicators'])

            # Basic tone score (positive vs negative)
            total_indicators = positive_count + negative_count
            if total_indicators > 0:
                analysis['score'] = positive_count / total_indicators
            else:
                analysis['score'] = 0.5  # Neutral score if no indicators found

            # Check for technical accuracy
            technical_matches = 0
            for term in self.technical_terms:
                if term.lower() in lower_response:
                    technical_matches += 1
            analysis['technical_accuracy'] = min(technical_matches / len(self.technical_terms) * 2, 1.0)

            # Calculate readability (simplified)
            sentences = [s.strip() for s in re.split(r'[.!?]+', response) if s.strip()]
            words = response.split()
            avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0

            # Higher readability score for moderate sentence length (not too short or too complex)
            if 8 <= avg_sentence_length <= 20:
                analysis['readability_score'] = 1.0
            elif 5 <= avg_sentence_length <= 25:
                analysis['readability_score'] = 0.8
            else:
                analysis['readability_score'] = 0.5

            # Overall educational quality
            analysis['educational_quality'] = (
                analysis['score'] * 0.3 +
                analysis['technical_accuracy'] * 0.4 +
                analysis['readability_score'] * 0.3
            )

            # Generate suggestions based on analysis
            if negative_count > positive_count:
                analysis['suggestions'].append("Consider using more educational and encouraging language")
            if technical_matches == 0:
                analysis['suggestions'].append("Consider including relevant technical terminology")
            if avg_sentence_length > 25:
                analysis['suggestions'].append("Consider breaking down long sentences for better readability")

            return analysis

        except Exception as e:
            logger.error(f"Error analyzing tone: {str(e)}")
            return analysis

    async def validate_educational_tone(self, response: str, min_score: float = 0.6) -> bool:
        """Validate if the response has an appropriate educational tone"""
        analysis = await self.analyze_tone(response)
        return analysis['educational_quality'] >= min_score

    async def suggest_improvements(self, response: str) -> List[str]:
        """Suggest improvements to make the response more educational"""
        analysis = await self.analyze_tone(response)
        suggestions = analysis.get('suggestions', [])

        # Additional suggestions based on content
        if len(response) < 100:
            suggestions.append("Consider expanding the response with more detail and examples")

        if not any(word in response.lower() for word in ['example', 'for instance', 'such as']):
            suggestions.append("Consider adding examples to illustrate concepts")

        if not any(word in response.lower() for word in ['important', 'key', 'crucial', 'significant']):
            suggestions.append("Consider highlighting important concepts or key points")

        return suggestions

    async def ensure_consistency(self, responses: List[str]) -> Dict[str, Any]:
        """Ensure consistency across multiple responses"""
        if not responses:
            return {'consistent': True, 'average_quality': 0.0, 'variance': 0.0}

        scores = []
        for response in responses:
            analysis = await self.analyze_tone(response)
            scores.append(analysis['educational_quality'])

        avg_score = sum(scores) / len(scores)
        variance = sum((score - avg_score) ** 2 for score in scores) / len(scores) if scores else 0

        # Consider consistent if variance is low and average score is good
        consistent = variance < 0.1 and avg_score >= 0.6

        return {
            'consistent': consistent,
            'average_quality': avg_score,
            'variance': variance,
            'scores': scores
        }