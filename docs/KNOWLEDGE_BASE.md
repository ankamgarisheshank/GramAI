# GramAI Knowledge Base Architecture

The Knowledge Base is the core data layer for the GramAI Recommendation engine.
It connects unstructured text (FAQs, application processes) with structured metadata (Income limits, Age limits).

## Components
1. **Relational Data**: Housed in PostgreSQL.
2. **Vector Data**: Housed in ChromaDB (initialized via `chroma_init.py`).
3. **Hybrid Search**: The pipeline uses Metadata pre-filtering before semantic vector lookup.
