---
title: RAG AI Chatbot API
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
app_port: 7860
---

# RAG AI Chatbot API

This is a FastAPI-based RAG (Retrieval-Augmented Generation) AI Chatbot backend integrated with a Docusaurus-based humanoid robotics book.

## Features

- **Intelligent Q&A**: Ask questions about humanoid robotics topics
- **Context-Aware Responses**: Uses RAG architecture for accurate, contextual answers
- **Multi-Model Support**: Powered by Meta Llama 3.3 70B via OpenRouter
- **Session Management**: Maintains conversation context
- **Vector Search**: Optional Qdrant integration for semantic search
- **Database Logging**: Optional Neon Postgres for chat history

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `POST /api/session` - Initialize a new chat session
- `POST /api/chat` - Send a chat message
- `POST /api/query-mode` - Set query mode (global or selected_text)
- `POST /api/ingest` - Ingest content into the vector database

## Environment Variables

This Space requires the following secrets to be configured:

- `OPENROUTER_API_KEY` (Required) - Your OpenRouter API key
- `QDRANT_URL` (Optional) - Qdrant Cloud instance URL
- `QDRANT_API_KEY` (Optional) - Qdrant API key
- `DATABASE_URL` (Optional) - Neon Postgres connection string
- `GEMINI_API_KEY` (Optional) - Google Gemini API key (fallback)

## Usage

Send a POST request to `/api/chat` with:

```json
{
  "question_text": "What is humanoid robotics?",
  "query_mode": "global",
  "session_id": "your-session-id"
}
```

## License

MIT License
