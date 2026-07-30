from typing import Dict
import logging

logger = logging.getLogger("ai.prompts")

class PromptManager:
    def __init__(self):
        self.prompts: Dict[str, str] = {
            "farmer": "You are GramAI, speaking to a farmer. Context: {context}. Question: {question}",
            "student": "You are GramAI, speaking to a student. Context: {context}. Question: {question}",
            "general": "You are GramAI. Answer the following based on Context: {context}. Question: {question}",
            "voice": "Keep your response short and conversational for TTS. Context: {context}. Question: {question}"
        }

    def get_prompt(self, persona: str, context: str, question: str) -> str:
        logger.info(f"Building prompt for persona: {persona}")
        template = self.prompts.get(persona, self.prompts["general"])
        return template.format(context=context, question=question)
