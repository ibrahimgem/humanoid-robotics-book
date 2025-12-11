# Data Model: Integrated RAG Chatbot for Humanoid Robotics Book

## Overview
This document defines the data models for the RAG chatbot system, including database schemas and vector store structures.

## Database Models (Neon Postgres)

### ChatSession
Stores user chat session information and history.

```sql
Table: chat_sessions
- id: UUID (Primary Key)
- user_id: UUID (nullable, for anonymous sessions)
- created_at: TIMESTAMP (default: NOW())
- updated_at: TIMESTAMP (default: NOW())
- metadata: JSONB (additional session data)
```

### ChatLog
Stores individual chat messages within sessions.

```sql
Table: chat_logs
- id: UUID (Primary Key)
- session_id: UUID (Foreign Key: chat_sessions.id)
- role: VARCHAR (enum: 'user', 'assistant', 'system')
- content: TEXT (the message content)
- query_mode: VARCHAR (enum: 'global', 'local')
- selected_text: TEXT (nullable, for local queries)
- created_at: TIMESTAMP (default: NOW())
- metadata: JSONB (retrieval context, sources, etc.)
```

### KnowledgeChunk
Stores metadata about content chunks that are vectorized.

```sql
Table: knowledge_chunks
- id: UUID (Primary Key)
- chapter_id: VARCHAR (chapter identifier for namespacing)
- content_hash: VARCHAR (unique hash of content)
- source_file: VARCHAR (path to source document)
- source_section: VARCHAR (section title/heading)
- content_preview: TEXT (first 200 chars of content)
- embedding_status: VARCHAR (enum: 'pending', 'processed', 'failed')
- created_at: TIMESTAMP (default: NOW())
- updated_at: TIMESTAMP (default: NOW())
```

### FileMap
Maps original files to their processed chunks.

```sql
Table: file_mappings
- id: UUID (Primary Key)
- original_path: VARCHAR (original file path)
- processed_chunks: INTEGER (number of chunks created)
- last_processed: TIMESTAMP
- processing_status: VARCHAR (enum: 'pending', 'in_progress', 'completed', 'failed')
```

## Vector Store Schema (Qdrant Cloud)

### Collection: book_content
Stores vector embeddings for RAG retrieval.

**Payload Structure:**
```json
{
  "chunk_id": "uuid",
  "chapter_id": "string",
  "source_file": "string",
  "source_section": "string",
  "content_preview": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Vector Configuration:**
- Size: 1536 (for OpenAI ada-002 embeddings)
- Distance: Cosine
- Collection name: `book_content`
- Namespacing: By chapter_id field for chapter-based namespacing

## Key Relationships

1. **ChatSession** (1) → (Many) **ChatLog**: Sessions contain multiple chat messages
2. **KnowledgeChunk** (Many) ↔ (Many) **ChatLog**: Chat logs reference knowledge chunks used for responses
3. **FileMap** (1) → (Many) **KnowledgeChunk**: Files are split into multiple chunks

## Validation Rules

### ChatSession
- Session must have either a user_id or be anonymous
- Created_at must be before updated_at

### ChatLog
- Role must be one of 'user', 'assistant', or 'system'
- Query_mode must be 'global' or 'local'
- If query_mode is 'local', selected_text must not be null or empty

### KnowledgeChunk
- Chapter_id must follow naming convention (e.g., "introduction", "ros-2")
- Content_hash must be unique
- Embedding_status must be one of allowed values

## State Transitions

### KnowledgeChunk States
```
[pending] → [in_progress] → [processed] | [failed]
```
- Transitions occur during content processing pipeline
- Failed chunks can be retried

### FileMap States
```
[pending] → [in_progress] → [completed] | [failed]
```
- Tracks document processing status