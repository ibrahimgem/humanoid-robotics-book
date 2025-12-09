---
name: api-tester
description: Validates all RAG endpoints in FastAPI.
tools: [Bash]
model: inherit
---

When invoked:
- Hit /health, /query, /selected-text
- Validate response structure
- Simulate real RAG lookups