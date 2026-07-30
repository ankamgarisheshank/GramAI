import pytest
from app.ai.prompts.manager import PromptManager
from app.ai.eligibility.engine import EligibilityEngine

def test_prompt_manager():
    manager = PromptManager()
    prompt = manager.get_prompt("general", "test_context", "test_question")
    assert "test_context" in prompt
    assert "test_question" in prompt

def test_eligibility_engine():
    engine = EligibilityEngine(db_session=None)
    profile = {"age": 25, "income": 400000}
    schemes = [
        {"name": "Valid Scheme", "min_age": 18, "max_income": 500000},
        {"name": "Invalid Scheme", "min_age": 30, "max_income": 500000}
    ]
    eligible = engine.evaluate(profile, schemes)
    assert len(eligible) == 1
    assert eligible[0]["name"] == "Valid Scheme"
