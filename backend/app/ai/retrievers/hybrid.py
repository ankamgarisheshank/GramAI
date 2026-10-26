import logging
from app.ai.vectorstore.chroma_client import VectorStoreClient

logger = logging.getLogger("ai.retriever")

class HybridRetriever:
    def __init__(self):
        self.vector_store = VectorStoreClient()

    def search(self, query: str, metadata_filter: dict = None) -> list:
        logger.info(f"Performing hybrid search for query: {query}")
        try:
            retriever = self.vector_store.get_retriever()
            if retriever:
                return retriever.invoke(query)
        except Exception as e:
            logger.warning(f"Vector search failed: {e}")
        return []
