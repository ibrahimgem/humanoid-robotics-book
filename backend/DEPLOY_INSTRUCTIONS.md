# Quick Deployment Instructions

This is a condensed version of the full deployment guide. For detailed troubleshooting and explanations, see [DEPLOYMENT.md](../DEPLOYMENT.md).

## Step-by-Step Deployment

### 1. Create HuggingFace Space

1. Go to https://huggingface.co/spaces
2. Click "Create new Space"
3. Choose:
   - Name: `rag-chatbot`
   - SDK: **Docker**
   - Hardware: CPU basic (free)
4. Click "Create Space"

### 2. Deploy Backend to HuggingFace

```bash
# Navigate to backend directory
cd backend

# Backup local README
mv README.md README_LOCAL.md 2>/dev/null || true

# Use HuggingFace README
cp README_HUGGINGFACE.md README.md

# Initialize git if needed
git init

# Add HuggingFace remote (replace with your username and space name)
git remote add huggingface https://huggingface.co/spaces/YOUR_USERNAME/rag-chatbot

# Commit and push
git add .
git commit -m "Deploy RAG AI Chatbot to HuggingFace Spaces"
git push huggingface main
```

### 3. Configure Secrets in HuggingFace

Go to your Space settings and add these secrets:

**Required:**
- `OPENROUTER_API_KEY`: Your OpenRouter API key (from .env file)

**Optional:**
- `QDRANT_URL`: Qdrant Cloud instance URL
- `QDRANT_API_KEY`: Qdrant API key
- `DATABASE_URL`: Neon Postgres connection string
- `GEMINI_API_KEY`: Google Gemini API key

### 4. Test Backend Deployment

```bash
# Make test script executable
chmod +x test_deployment.sh

# Run tests (replace with your Space URL)
./test_deployment.sh https://YOUR_USERNAME-rag-chatbot.hf.space
```

Expected output:
```
✓ Health check
✓ Root endpoint
✓ Session initialization
✓ Chat endpoint
✓ CORS headers
```

### 5. Update Frontend Configuration

Edit `src/config/api.js` and replace:
```javascript
return 'https://YOUR_HUGGINGFACE_USERNAME-rag-chatbot.hf.space';
```

With your actual HuggingFace username:
```javascript
return 'https://ibrahimgem-rag-chatbot.hf.space';  // example
```

### 6. Update ChatWidget Component

Edit `src/components/ChatWidget/ChatWidget.jsx`:

```javascript
// Add import at the top
import { getApiUrl, API_CONFIG } from '../../config/api';

// Replace ALL fetch URLs:
// Before:
const response = await fetch('/api/session', {

// After:
const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SESSION), {

// Apply to all fetch calls: /api/session, /api/chat, /api/query-mode
```

### 7. Deploy Frontend to GitHub Pages

```bash
# From project root
cd ..

# Build and deploy
npm run build
GIT_USER=YOUR_GITHUB_USERNAME npm run deploy
```

### 8. Verify Integration

1. Visit: `https://YOUR_GITHUB_USERNAME.github.io/humanoid-robotics-book/`
2. Open chat widget
3. Send a test message
4. Check browser console (F12) for errors

## Quick Test Commands

```bash
# Health check
curl https://YOUR_USERNAME-rag-chatbot.hf.space/health

# Initialize session
curl -X POST https://YOUR_USERNAME-rag-chatbot.hf.space/api/session

# Send chat message
curl -X POST https://YOUR_USERNAME-rag-chatbot.hf.space/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question_text": "What is humanoid robotics?",
    "query_mode": "global",
    "session_id": "test-123"
  }'
```

## Common Issues

### CORS Error
- Check that GitHub Pages URL is in `backend/src/api/main.py` allowed_origins
- Restart HuggingFace Space after updating

### 404 Not Found
- Verify backend URL in `src/config/api.js`
- Check that Space is running on HuggingFace

### Authentication Error
- Verify `OPENROUTER_API_KEY` is set in HuggingFace Spaces secrets
- Check secret name is exact match (case-sensitive)

### Empty Responses
- Check backend logs in HuggingFace Spaces "Logs" tab
- Verify OpenRouter API key has credits
- Test endpoint directly with curl

## URLs to Bookmark

- **Backend**: `https://YOUR_USERNAME-rag-chatbot.hf.space`
- **Frontend**: `https://YOUR_GITHUB_USERNAME.github.io/humanoid-robotics-book/`
- **HF Space**: `https://huggingface.co/spaces/YOUR_USERNAME/rag-chatbot`

## Support

For detailed troubleshooting, see [DEPLOYMENT.md](../DEPLOYMENT.md).
