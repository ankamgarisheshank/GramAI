import logging
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
