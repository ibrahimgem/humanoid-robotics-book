---
id: 001
title: rag-ai-chatbot-development
stage: spec
date_iso: 2025-12-26
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 002-rag-ai-chatbot
user: apple
command: /sp.specify
labels:
  - rag
  - chatbot
  - docusaurus
  - ai
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - /Users/apple/Data/Certified-Cloud-Applied-Generative-AI-Engineering/Q4-Agentic-AI/ai_driver_development/hackathon-1.0/humanoid-robotics-book/specs/003-rag-chatbot/spec.md
  - /Users/apple/Data/Certified-Cloud-Applied-Generative-AI-Engineering/Q4-Agentic-AI/ai_driver_development/hackathon-1.0/humanoid-robotics-book/specs/003-rag-chatbot/checklists/requirements.md
tests_yaml:
  - spec validation
  - requirements checklist
prompt_text: |
  title: Integrated RAG Chatbot Development for a Published Docusaurus Book

  objective:
  Build and embed a Retrieval-Augmented Generation (RAG) chatbot inside a published Docusaurus book. The chatbot must answer user questions strictly from the book's content and must also support answering questions based **only on user-selected text**.

  scope:
  The system should be production-ready, modular, and fully compatible with free-tier tooling while maintaining good UI/UX and clean architecture.

  core_requirements:
  - Use **free tier only** for all tools and services.
  - Backend must be built using **FastAPI**.
  - Use **OpenAI Agents / ChatKit SDK** with **Gemini free models**.
  - Convert the book content into vector embeddings using **Gemini embedding models**.
  - Store and retrieve vectors using:
    - **Qdrant Cloud (Free Tier)** for vector search
    - **Neon Serverless Postgres (Free Tier)** for metadata, users, and logs
  - Embed the chatbot directly into the book frontend.
  - Support two query modes:
    1. Global book search (entire book context)
    2. Selected-text-only answers (strictly limited to user selection)

  integration_and_docs:
  - Use **context7 MCP server** to:
    - Read and understand documentation of all integrated technologies
    - Ensure smooth backend, frontend, and UI/UX integration
    - Reduce hallucinations in implementation details

  agent_architecture:
  Use a multi-agent system with clear separation of responsibilities.

  required_subagents:
  - Ingestion Agent
    - Parses Docusaurus markdown
    - Chunks content
    - Generates embeddings
    - Stores vectors and metadata

  - Retrieval Agent
    - Queries Qdrant
    - Applies filtering (global vs selected text)
    - Returns top-K relevant chunks

  - Answer Generation Agent
    - Uses Gemini free models
    - Answers strictly from retrieved context
    - No external knowledge leakage

  - Frontend/UI Agent
    - Improves chatbot UI/UX inside Docusaurus
    - Ensures responsive layout, accessibility, and clean design

  - Orchestration Agent
    - Manages agent handoffs
    - Controls query flow
    - Handles errors and fallbacks

  skills_to_define_and_use:
  - vectorization
  - semantic search
  - context filtering
  - agent orchestration
  - FastAPI API design
  - frontend-backend integration
  - UI/UX optimization for chat interfaces
  - cost-aware free-tier optimization

  non_functional_requirements:
  - Modular and extensible architecture
  - Secure API endpoints
  - Low latency within free-tier limits
  - Clean logging and error handling
  - Easy re-embedding when new chapters are added

  deliverables:
  - Embedded RAG chatbot inside the book
  - FastAPI backend with agent-based architecture
  - Vectorized book content stored in Qdrant
  - Metadata and state stored in Neon Postgres
  - Clear documentation of agents, skills, and data flow
  - Example queries for both global and selected-text modes

  constraints:
  - No paid services
  - No vendor lock-in
  - No model usage outside Gemini free tier
  - Answers must always be grounded in retrieved context
response_text: |
  Successfully created feature specification for Integrated RAG Chatbot Development.
  - Created branch 003-rag-chatbot
  - Created comprehensive spec with user scenarios, requirements, and success criteria
  - Created requirements validation checklist
  - All requirements properly documented with functional requirements, key entities, and measurable outcomes
outcome: |
  Feature specification created successfully for RAG chatbot integration into Docusaurus book.
  The spec includes all required functionality for both global book search and selected-text-only query modes,
  with proper architecture using FastAPI backend and free-tier services (Qdrant, Neon Postgres, Gemini).
evaluation: |
  Specification is complete and ready for planning phase (/sp.plan).
  All user requirements have been translated into clear functional requirements and success criteria.
  The multi-agent architecture is properly specified with clear responsibilities for each agent.
---
