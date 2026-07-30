# Data Pipeline Flow

1. **Ingestion**: Raw Govt documents enter `datasets/raw/`.
2. **Cleaning**: `cleaner.py` removes artifacts and normalizes text.
3. **Validation**: `validator.py` ensures required schema fields exist.
4. **Metadata**: `metadata_generator.py` tags the document.
5. **Chunking**: `chunker.py` breaks the document into semantic blocks.
6. **Vectorization**: `embedder.py` (Phase 8) generates vector embeddings.
7. **Storage**: `chroma_init.py` persists data to the `knowledge_base/` dir.
