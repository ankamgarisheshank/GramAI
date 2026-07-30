import logging
from app.ai.vectorstore.chroma_client import VectorStoreClient

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
