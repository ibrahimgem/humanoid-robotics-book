---
id: 1
title: "RAG Chatbot Spec"
stage: spec
date: "2025-12-06"
surface: "agent"
model: "Claude Sonnet 4.5"
feature: "rag-chatbot"
branch: "002-rag-chatbot"
user: "user"
command: "/sp.specify"
labels: ["specification", "RAG", "chatbot", "docusaurus"]
links:
  spec: "specs/002-rag-chatbot/spec.md"
  ticket: null
  adr: null
  pr: null
files:
  - "specs/002-rag-chatbot/spec.md"
  - "specs/002-rag-chatbot/checklists/requirements.md"
tests: []
---

# Prompt History Record

## PROMPT_TEXT

Feature: Integrated RAG Chatbot for the Humanoid Robotics Book

Objective:
Embed an interactive RAG-based chatbot inside the published Docusaurus book that can answer:
1) General questions about any book content.
2) Questions restricted to user-selected text passages.

Functional Requirements:
- Provide embedded chat UI within Docusaurus (React-based widget).
- Support two modes:
  • Global RAG: queries entire vectorized book content.
  • Local RAG: only retrieves from user-highlighted text.
- Expose backend endpoints via FastAPI.
- Use OpenAI Agents/ChatKit SDKs for LLM reasoning.
- Handle hybrid retrieval using Qdrant Cloud (Free Tier).
- Store metadata (chunks, embeddings, chat logs) in Neon Serverless Postgres.
- Auto-sync: regenerate embeddings when book content updates.

Non-Functional Requirements:
- Latency: ≤ 1.5s average response.
- Embedding updates must run asynchronously via background worker.
- All vector content must follow chapter-based namespacing.
- UI must be lightweight, responsive, and theme-aware (Docusaurus v3).
- Security: restrict API keys to server-side only; no exposure in frontend.

Scope:
- Backend: FastAPI service, embeddings pipeline, RAG orchestration.
- Frontend: Docusaurus plugin + React chat widget.
- Infra: Qdrant Cloud (collections), Neon Postgres (tables), deployment scripts.

Constraints:
- Qdrant: free-tier limits (storage + 1 collection).
- Postgres: use serverless Neon with pooling.
- LLM: use OpenAI Chat Completions and Agents APIs.

Acceptance Criteria:
- Embedded chatbot loads on any documentation page.
- Responds accurately using only book content.
- Correctly switches to "selected text only" retrieval mode.
- Zero hallucinations when retrieval returns empty results.
- Works on GitHub Pages deployment using external API endpoints.

## RESPONSE_TEXT

Successfully created the feature specification for the integrated RAG chatbot:

- Created feature branch `002-rag-chatbot`
- Created comprehensive specification at `specs/002-rag-chatbot/spec.md`
- Included user scenarios with prioritized stories
- Defined functional requirements (FR-001 through FR-009)
- Specified key entities and measurable success criteria
- Created quality validation checklist at `specs/002-rag-chatbot/checklists/requirements.md`

The specification is ready for the next phase of development planning.

## OUTCOME

Specification created successfully with all required sections and quality validation.

## EVALUATION

The specification meets all requirements with clear user stories, functional requirements, and success criteria. Ready for planning phase.