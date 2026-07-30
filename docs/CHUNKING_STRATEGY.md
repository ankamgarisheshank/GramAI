# Chunking Strategy

To ensure high-quality context retrieval without token overflow, GramAI uses a **Semantic Chunking** strategy.

1. **Section Isolation**: Schemes are split by `Description`, `Eligibility`, and `Process`.
2. **Overlap**: 50 tokens overlap is applied for continuous paragraphs to maintain context.
3. **Metadata Attachment**: Every chunk ID is appended with its Parent Scheme ID to allow reverse lookup in Postgres.
