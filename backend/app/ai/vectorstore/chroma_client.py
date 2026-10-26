import logging

logger = logging.getLogger("ai.vectorstore")

try:
    from langchain_community.vectorstores import Chroma
    from langchain_community.embeddings import HuggingFaceEmbeddings
    HAS_CHROMA = True
except Exception:
    Chroma = None
    HuggingFaceEmbeddings = None
    HAS_CHROMA = False

class VectorStoreClient:
    def __init__(self, persist_directory: str = "../../datasets/knowledge_base/chroma"):
        self.persist_directory = persist_directory
        self.db = None
        if HAS_CHROMA and Chroma is not None and HuggingFaceEmbeddings is not None:
            try:
                self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
                self.db = Chroma(persist_directory=self.persist_directory, embedding_function=self.embeddings)
                logger.info("ChromaDB vector store initialized.")
            except Exception as e:
                logger.warning(f"ChromaDB initialization failed: {e}")
        else:
            logger.info("Langchain Chroma not installed or unavailable; vector search disabled.")
        
    def get_retriever(self, search_kwargs=None):
        if search_kwargs is None:
            search_kwargs = {"k": 3}
        if self.db:
            try:
                return self.db.as_retriever(search_kwargs=search_kwargs)
            except Exception as e:
                logger.warning(f"Failed to get retriever: {e}")
        return None
