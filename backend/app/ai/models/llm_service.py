import logging
from typing import Optional
from langchain_community.llms import Ollama
from langchain_core.language_models.llms import BaseLLM

logger = logging.getLogger("ai.models")

class LLMService:
    def __init__(self, model_name: str = "llama3.2:3b", base_url: str = "http://localhost:11434"):
        self.model_name = model_name
        self.base_url = base_url
        self._llm: Optional[BaseLLM] = None
        self._initialize()

    def _initialize(self):
        try:
            self._llm = Ollama(model=self.model_name, base_url=self.base_url)
            logger.info(f"Initialized Ollama LLM with model {self.model_name}")
        except Exception as e:
            logger.error(f"Failed to initialize LLM: {e}")

    def get_llm(self) -> BaseLLM:
        if not self._llm:
            raise ValueError("LLM not initialized")
        return self._llm

    def generate(self, prompt: str) -> str:
        logger.info("Generating LLM response...")
        if not self._llm:
            raise RuntimeError("Ollama LLM is not initialized")
        return self._llm.invoke(prompt)
