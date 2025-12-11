import re
from typing import List, Dict, Tuple

class TerminologyPreservationService:
    """
    Service to maintain English technical terms with Urdu explanations.
    """
    def __init__(self):
        # Common technical terms in the humanoid robotics domain
        self.technical_terms = {
            "robot": "روبوٹ (Robot)",
            "humanoid": "ہیومنوائڈ (Humanoid)",
            "AI": "مصنوعی ذہانت (Artificial Intelligence)",
            "algorithm": "الگورتھم (Algorithm)",
            "neural network": "نیورل نیٹ ورک (Neural Network)",
            "sensor": "سینسر (Sensor)",
            "actuator": "ایکچویٹر (Actuator)",
            "locomotion": "لوکوموشن (Locomotion)",
            "kinematics": "کنیمیٹکس (Kinematics)",
            "dynamics": "ڈائنا مکس (Dynamics)",
            "control system": "کنٹرول سسٹم (Control System)",
            "machine learning": "مشین لرننگ (Machine Learning)",
            "deep learning": "ڈیپ لرننگ (Deep Learning)",
            "computer vision": "کمپیوٹر وژن (Computer Vision)",
            "path planning": "راہ کی منصوبہ بندی (Path Planning)",
            "SLAM": "سیم (Simultaneous Localization and Mapping)",
            "ROS": "ROS (Robot Operating System)",
            "gait": "گیٹ (Gait)",
            "inverse kinematics": "معکوس کنیمیٹکس (Inverse Kinematics)",
            "forward kinematics": "فرورڈ کنیمیٹکس (Forward Kinematics)",
        }

    def preserve_technical_terms(self, text: str) -> str:
        """
        Preserve English technical terms with Urdu explanations.
        """
        result = text
        for english_term, urdu_explanation in self.technical_terms.items():
            # Use word boundaries to match whole words only
            pattern = r'\b' + re.escape(english_term) + r'\b'
            replacement = f"{english_term} ({urdu_explanation})"
            result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)

        return result

    def format_mixed_language_content(self, text: str) -> str:
        """
        Format mixed-language content properly.
        """
        # Apply technical term preservation
        formatted_text = self.preserve_technical_terms(text)

        # Add any additional formatting for mixed-language content
        # For example, ensuring proper spacing around technical terms
        return formatted_text

    def maintain_glossary(self) -> Dict[str, str]:
        """
        Maintain glossary of technical terms.
        """
        return self.technical_terms

    def get_technical_terms(self) -> List[str]:
        """
        Get list of technical terms.
        """
        return list(self.technical_terms.keys())