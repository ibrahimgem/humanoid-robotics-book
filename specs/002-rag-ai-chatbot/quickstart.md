# Quickstart Guide: Integrated RAG AI Chatbot

## Prerequisites

- Python 3.11+
- Node.js 18+ (for Docusaurus)
- Access to Qdrant Cloud (free tier)
- Access to Neon Serverless Postgres (free tier)
- Gemini API access (free tier)

## Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd humanoid-robotics-book
   ```

2. **Set up Python virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r backend/requirements.txt
   ```

3. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   QDRANT_URL=<your-qdrant-cloud-url>
   QDRANT_API_KEY=<your-qdrant-api-key>
   DATABASE_URL=<your-neon-postgres-connection-string>
   GEMINI_API_KEY=<your-gemini-api-key>
   ```

4. **Install frontend dependencies**
   ```bash
   cd src
   npm install
   ```

## Backend Setup

1. **Start the FastAPI server**
   ```bash
   cd backend
   uvicorn src.api.main:app --reload
   ```

2. **Initialize the database**
   ```bash
   python -m src.services.database_service init
   ```

3. **Ingest book content**
   ```bash
   python -m src.agents.ingestion_agent.ingest --path /path/to/book/content
   ```

## Frontend Integration

1. **Integrate the chat widget**
   The chat widget is available as a React component in `src/components/ChatWidget`.

2. **Add to Docusaurus pages**
   The chat widget can be added to any Docusaurus page using the component.

## API Usage

### Chat Endpoint
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is embodied cognition in robotics?",
    "mode": "global"
  }'
```

### Streaming Chat
```bash
curl -X POST http://localhost:8000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is embodied cognition in robotics?",
    "mode": "global"
  }'
```

### Ingest Content
```bash
curl -X POST http://localhost:8000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "content_path": "/docs/module-1-introduction-physical-ai/foundations-physical-ai.mdx",
    "document_title": "Foundations of Physical AI"
  }'
```

## Running Tests

```bash
# Backend tests
cd backend
pytest tests/

# Frontend tests
cd src
npm test
```

## Configuration

The system supports two query modes:
- **Global**: Searches the entire book content
- **Selected-text**: Limits responses to user-selected text

The multi-agent architecture includes:
- Ingestion Agent: Processes and stores content
- Retrieval Agent: Finds relevant content chunks
- Answer Generation Agent: Creates responses
- Frontend/UI Agent: Manages chat interface
- Orchestration Agent: Coordinates the other agents