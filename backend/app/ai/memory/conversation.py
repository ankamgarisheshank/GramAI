import logging

try:
    from langchain.memory import ConversationBufferWindowMemory
    HAS_MEMORY = True
except Exception:
    ConversationBufferWindowMemory = None
    HAS_MEMORY = False

logger = logging.getLogger("ai.memory")

class ConversationMemory:
    def __init__(self, k: int = 5):
        self.history = []
        if HAS_MEMORY and ConversationBufferWindowMemory is not None:
            try:
                self.memory = ConversationBufferWindowMemory(k=k, return_messages=True)
            except Exception:
                self.memory = None
        else:
            self.memory = None
        logger.info(f"Initialized conversation memory with window {k}")

    def add_message(self, role: str, content: str):
        if self.memory:
            try:
                if role == "user":
                    self.memory.chat_memory.add_user_message(content)
                else:
                    self.memory.chat_memory.add_ai_message(content)
                return
            except Exception:
                pass
        self.history.append(f"{role}: {content}")
            
    def get_history(self) -> str:
        if self.memory:
            try:
                return self.memory.buffer_as_str
            except Exception:
                pass
        return "\n".join(self.history)
