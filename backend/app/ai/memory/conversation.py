import logging
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
