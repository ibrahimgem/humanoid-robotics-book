---
name: rag-validator
description: Runs validation checks to ensure RAG accuracy and retrieval health.
tools: [Read]
model: inherit
---

Tests:
- Chunk coverage
- Embedding availability
- Qdrant collection completeness
- Latency check (<700ms ideal)
- Correct answer citations