import os

class ChromaDBInitializer:
    def __init__(self, persist_dir: str):
        self.persist_dir = persist_dir

    def create_collection(self, collection_name: str, metadata: dict):
        # Placeholder for chromadb.PersistentClient initialization
        print(f"ChromaDB Collection '{collection_name}' initialized at {self.persist_dir}.")
        print(f"Metadata configured: {metadata}")
        return True

if __name__ == "__main__":
    db_path = os.path.join(os.path.dirname(__file__), '../../datasets/knowledge_base/chroma')
    os.makedirs(db_path, exist_ok=True)
    initializer = ChromaDBInitializer(persist_dir=db_path)
    initializer.create_collection("gramai_schemes", {"dimension": 384})
