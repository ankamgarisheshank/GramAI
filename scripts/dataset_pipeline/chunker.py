from typing import List, Dict

class KnowledgeChunker:
    def __init__(self, chunk_size: int = 500, overlap: int = 50):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def sentence_chunk(self, text: str) -> List[str]:
        # Basic sentence splitting (for default logic)
        sentences = text.replace('!', '.').replace('?', '.').split('.')
        return [s.strip() for s in sentences if s.strip()]

    def semantic_chunk(self, content: Dict[str, str]) -> List[Dict[str, str]]:
        chunks = []
        # Chunks by semantic meaning (e.g., Description vs Eligibility)
        if "Description" in content:
            chunks.append({"chunk_id": "desc_1", "text": content["Description"], "semantic_tag": "Description"})
        if "Eligibility" in content:
            chunks.append({"chunk_id": "elig_1", "text": content["Eligibility"], "semantic_tag": "Eligibility"})
        return chunks
