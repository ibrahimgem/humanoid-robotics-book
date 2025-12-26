#!/usr/bin/env python3
"""
Test script to verify OpenRouter integration with fallback mechanisms
"""
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables from the backend directory
load_dotenv()

# Import the ResponseGenerator
from src.agents.answer_generation_agent.response_generator import ResponseGenerator

async def test_openrouter_integration():
    """Test the OpenRouter integration with fallback mechanisms"""
    print("Testing OpenRouter Integration with Fallback Mechanisms...")
    print("="*60)

    # Create response generator instance
    response_gen = ResponseGenerator()

    print(f"Client initialized: {response_gen.client is not None}")
    print(f"Model name set: {response_gen.model_name}")
    print(f"Fallback enabled: {getattr(response_gen, 'fallback_enabled', 'Attribute not found')}")

    # Test with a sample context
    sample_context = [
        {
            "content": "Humanoid robotics is a branch of robotics focused on creating robots that resemble and mimic human behavior. These robots typically have a head, torso, two arms, and two legs, and may have a means of mobility.",
            "metadata": {
                "source_document": "introduction.md"
            }
        }
    ]

    # Test a simple query
    query = "What is humanoid robotics?"

    print(f"\nTesting query: '{query}'")
    print("-" * 40)

    # Test the generate_response method
    result = await response_gen.generate_response(query, sample_context, query_mode="global")

    print(f"Response: {result['response'][:200]}{'...' if len(result['response']) > 200 else ''}")
    print(f"Sources: {result['sources']}")
    print(f"Follow-up questions: {len(result['follow_up_questions'])}")
    print(f"Has tone analysis: {bool(result['tone_analysis'])}")

    # Test educational response
    print("\nTesting educational response...")
    print("-" * 40)

    edu_result = await response_gen.generate_educational_response(query, sample_context)

    print(f"Educational response: {edu_result['response'][:200]}{'...' if len(edu_result['response']) > 200 else ''}")
    print(f"Sources: {edu_result['sources']}")
    print(f"Follow-up questions: {len(edu_result['follow_up_questions'])}")
    print(f"Has tone analysis: {bool(edu_result['tone_analysis'])}")

    print("\n" + "="*60)
    print("Test completed!")

    fallback_used = getattr(response_gen, 'fallback_enabled', True)
    if fallback_used:
        print("\n⚠️  WARNING: Fallback mode is enabled. This means either:")
        print("   - OpenRouter API key is not configured properly")
        print("   - Insufficient credits on OpenRouter account")
        print("   - No models are accessible with current account")
        print("\nThe system will still function but with reduced capabilities.")
    else:
        print("\n✅ SUCCESS: OpenRouter integration is working correctly!")
        print(f"   - Using model: {response_gen.model_name}")
        print("The AI assistant can now use OpenRouter models for enhanced responses.")

if __name__ == "__main__":
    asyncio.run(test_openrouter_integration())
