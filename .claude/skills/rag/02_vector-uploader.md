---
name: vector-uploader
description: Uploads text chunks to Qdrant Cloud (Free Tier) using Qdrant API.
tools: [Bash]
model: inherit
---

When invoked:
1. Take generated embeddings.
2. Perform Qdrant upsert operations.
3. Validate collection schema.