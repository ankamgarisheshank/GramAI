import os

BASE = "/Users/apple/.gemini/antigravity-ide/scratch/GramAI/backend/app/ai"
DIRS = [
    "agents", "chat", "conversation", "eligibility", "embeddings",
    "evaluation", "memory", "models", "prompts", "rag",
    "recommendation", "retrievers", "speech", "tools", "vectorstore"
]

TEST_BASE = "/Users/apple/.gemini/antigravity-ide/scratch/GramAI/backend/tests/ai"

# Ensure directories exist
for d in DIRS:
    os.makedirs(os.path.join(BASE, d), exist_ok=True)
os.makedirs(TEST_BASE, exist_ok=True)

FILES = {}

# 1. Models & LLM Service
FILES["models/llm_service.py"] = """import logging
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
        return self._llm.invoke(prompt)
"""

# 2. Speech Pipeline
FILES["speech/pipeline.py"] = """import logging
# Placeholders for actual whisper and piper libraries
logger = logging.getLogger("ai.speech")

class SpeechPipeline:
    def __init__(self):
        self.stt_model = "whisper-1"
        self.tts_model = "piper"
    
    def detect_language(self, audio_bytes: bytes) -> str:
        logger.info("Detecting language...")
        return "te" # Defaulting to Telugu for testing

    def speech_to_text(self, audio_bytes: bytes) -> str:
        logger.info(f"Transcribing audio using {self.stt_model}...")
        return "Transcribed text placeholder"

    def text_to_speech(self, text: str, language: str = "te") -> bytes:
        logger.info(f"Synthesizing text using {self.tts_model} for language {language}...")
        return b"fake_audio_bytes"
"""

# 3. Eligibility Engine (Structured Logic)
FILES["eligibility/engine.py"] = """import logging
from typing import List, Dict, Any
logger = logging.getLogger("ai.eligibility")

class EligibilityEngine:
    def __init__(self, db_session):
        self.db = db_session
        
    def evaluate(self, profile: Dict[str, Any], schemes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        logger.info(f"Evaluating eligibility for profile age: {profile.get('age')}")
        eligible_schemes = []
        
        for scheme in schemes:
            # Example Evaluation Logic
            is_eligible = True
            if scheme.get("min_age") and profile.get("age"):
                if profile["age"] < scheme["min_age"]:
                    is_eligible = False
            
            if scheme.get("max_income") and profile.get("income"):
                if profile["income"] > scheme["max_income"]:
                    is_eligible = False
                    
            if is_eligible:
                eligible_schemes.append(scheme)
                
        return eligible_schemes
"""

# 4. Prompt Manager
FILES["prompts/manager.py"] = """from typing import Dict
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
"""

# 5. Retrievers and Vectorstore
FILES["vectorstore/chroma_client.py"] = """import logging
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

logger = logging.getLogger("ai.vectorstore")

class VectorStoreClient:
    def __init__(self, persist_directory: str = "../../datasets/knowledge_base/chroma"):
        self.persist_directory = persist_directory
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.db = Chroma(persist_directory=self.persist_directory, embedding_function=self.embeddings)
        logger.info("ChromaDB vector store initialized.")
        
    def get_retriever(self, search_kwargs={"k": 3}):
        return self.db.as_retriever(search_kwargs=search_kwargs)
"""

FILES["retrievers/hybrid.py"] = """import logging
from ai.vectorstore.chroma_client import VectorStoreClient

logger = logging.getLogger("ai.retriever")

class HybridRetriever:
    def __init__(self):
        self.vector_store = VectorStoreClient()

    def search(self, query: str, metadata_filter: dict = None) -> list:
        logger.info(f"Performing hybrid search for query: {query}")
        # In a real implementation, you apply the metadata filter to the Chroma retriever
        retriever = self.vector_store.get_retriever()
        docs = retriever.invoke(query)
        return docs
"""

# 6. Recommendation Engine
FILES["recommendation/engine.py"] = """import logging
from ai.eligibility.engine import EligibilityEngine
from ai.retrievers.hybrid import HybridRetriever
from ai.models.llm_service import LLMService
from ai.prompts.manager import PromptManager

logger = logging.getLogger("ai.recommendation")

class RecommendationEngine:
    def __init__(self, db_session):
        self.eligibility = EligibilityEngine(db_session)
        self.retriever = HybridRetriever()
        self.llm = LLMService()
        self.prompts = PromptManager()
        
    def recommend(self, profile: dict, query: str) -> str:
        logger.info("Starting recommendation pipeline...")
        # 1. Structured filtering (Mocks database schemes)
        all_schemes = [{"name": "Rythu Bandhu", "min_age": 18, "max_income": 500000}]
        eligible = self.eligibility.evaluate(profile, all_schemes)
        
        # 2. Semantic Search
        docs = self.retriever.search(query)
        context = " ".join([d.page_content for d in docs]) if docs else str(eligible)
        
        # 3. Prompting & LLM Generation
        prompt = self.prompts.get_prompt("farmer", context, query)
        response = self.llm.generate(prompt)
        
        return response
"""

# 7. Memory
FILES["memory/conversation.py"] = """import logging
from langchain.memory import ConversationBufferWindowMemory

logger = logging.getLogger("ai.memory")

class ConversationMemory:
    def __init__(self, k: int = 5):
        self.memory = ConversationBufferWindowMemory(k=k, return_messages=True)
        logger.info(f"Initialized conversation memory with window {k}")

    def add_message(self, role: str, content: str):
        if role == "user":
            self.memory.chat_memory.add_user_message(content)
        else:
            self.memory.chat_memory.add_ai_message(content)
            
    def get_history(self) -> str:
        return self.memory.buffer_as_str
"""

# 8. Tools
FILES["tools/registry.py"] = """import logging

logger = logging.getLogger("ai.tools")

class ToolRegistry:
    @staticmethod
    def get_weather(location: str):
        logger.info(f"Tool execution: get_weather({location})")
        return {"temperature": 32, "condition": "Sunny"}

    @staticmethod
    def get_market_prices(crop: str):
        logger.info(f"Tool execution: get_market_prices({crop})")
        return {"price_per_quintal": 2200}
"""

# 9. Tests
FILES["../../tests/ai/test_ai_pipeline.py"] = """import pytest
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
"""

for path, content in FILES.items():
    full_path = os.path.join(BASE, path)
    with open(full_path, "w") as f:
        f.write(content)

print("AI Scaffold Completed!")
