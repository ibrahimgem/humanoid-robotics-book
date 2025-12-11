# Implementation Plan: Integrated RAG Chatbot for Humanoid Robotics Book

**Branch**: `002-rag-chatbot` | **Date**: 2025-12-08 | **Spec**: [specs/002-rag-chatbot/spec.md](specs/002-rag-chatbot/spec.md)
**Input**: Feature specification from `/specs/002-rag-chatbot/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement an interactive RAG-based chatbot that allows readers to ask questions about the Humanoid Robotics Book content. The system will support both global queries (across entire book) and local queries (on selected text). The backend uses FastAPI with OpenAI Agents/ChatKit SDKs, Qdrant Cloud for vector storage, and Neon Postgres for metadata. The frontend integrates as a React widget in the Docusaurus book site with text selection capabilities.

## Technical Context

**Language/Version**: Python 3.11+ (for FastAPI backend), JavaScript/TypeScript (for Docusaurus frontend)
**Primary Dependencies**: FastAPI, OpenAI SDK, Qdrant client, Neon Postgres driver, React
**Storage**: Neon Serverless Postgres (metadata, chat logs), Qdrant Cloud (vector embeddings)
**Testing**: pytest (backend), Jest/Cypress (frontend integration)
**Target Platform**: Linux server (backend), Web browser (frontend)
**Project Type**: Web application (backend API + Docusaurus frontend integration)
**Performance Goals**: ≤ 1.5s average response time (per spec requirement)
**Constraints**: Qdrant free-tier limits (storage + 1 collection), GitHub Pages for frontend hosting, API keys restricted to server-side only
**Scale/Scope**: Single Docusaurus book site with RAG chatbot functionality for book content

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Compliance Verification

**Technical Accuracy**: ✓ The RAG system will use proper vector search and LLM reasoning to ensure responses are based on book content, maintaining technical accuracy per constitution.

**Beginner-Friendly Clarity**: ✓ The chatbot UI will be designed to be intuitive for readers of all levels, with clear responses that reference book content.

**Modular Chapter Structure**: ✓ The system will support chapter-based namespacing for vector content, maintaining the modular structure of the book.

**Source-Based Content**: ✓ The RAG system will ensure all responses are grounded in the book's content with proper citations.

**Consistent Terminology**: ✓ The chatbot will use consistent terminology from the book through vector search of the existing content.

**Quality Visuals**: ✓ The chat interface will follow Docusaurus v3 theming to maintain visual consistency with the book.

### Post-Design Constitution Re-Check

**Architecture Alignment**: ✓ Web application architecture with separate backend and frontend maintains clear separation of concerns while supporting all constitutional requirements.

**Technology Stack Compliance**: ✓ Selected technologies (FastAPI, Qdrant, Neon Postgres, React) support the constitutional principles of technical accuracy and accessibility.

**Data Model Consistency**: ✓ Database schema and vector store design support source-based content requirements with proper citation tracking.

**Performance Considerations**: ✓ Design includes caching and optimization strategies to meet performance goals while maintaining accuracy.

### Potential Violations & Justifications

**None identified**: The RAG chatbot implementation aligns with all constitutional principles. The system enhances the educational value of the book while maintaining technical accuracy and accessibility.

## Project Structure

### Documentation (this feature)

```text
specs/002-rag-chatbot/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code Structure

The RAG chatbot implementation follows a web application architecture with separate backend and frontend components:

```text
backend/
├── src/
│   ├── models/          # Data models (ChatSession, KnowledgeChunk, etc.)
│   ├── services/        # Core services (RAG orchestration, embedding generation)
│   ├── api/             # FastAPI endpoints for chat functionality
│   ├── database/        # Database interactions (Neon Postgres)
│   ├── vector_store/    # Qdrant integration for vector search
│   └── utils/           # Utility functions
├── tests/
│   ├── unit/
│   ├── integration/
│   └── contract/
└── requirements.txt

frontend/
├── src/
│   ├── components/
│   │   └── ChatWidget/  # React chat widget component
│   ├── hooks/           # Custom React hooks for API interaction
│   └── services/        # API service layer
└── tests/
    ├── unit/
    └── integration/

docs/
└── chatbot/             # Docusaurus integration documentation
```

**Structure Decision**: Web application architecture selected to separate concerns between backend RAG processing and frontend Docusaurus integration. The backend handles all RAG logic, vector storage, and LLM integration, while the frontend provides the chat widget that integrates with the Docusaurus documentation site.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
