# Deployment Guide: RAG AI Chatbot to HuggingFace Spaces

This guide walks you through deploying the RAG AI Chatbot backend to HuggingFace Spaces and integrating it with the GitHub Pages frontend.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment to HuggingFace Spaces](#backend-deployment-to-huggingface-spaces)
3. [Frontend Configuration](#frontend-configuration)
4. [Testing the Integration](#testing-the-integration)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- [ ] A HuggingFace account (sign up at https://huggingface.co/)
- [ ] Git installed on your local machine
- [ ] Your OpenRouter API key (from https://openrouter.ai/)
- [ ] (Optional) Qdrant Cloud account for vector storage
- [ ] (Optional) Neon Postgres account for chat history

---

## Backend Deployment to HuggingFace Spaces

### Step 1: Create a New Space

1. Go to https://huggingface.co/spaces
2. Click **"Create new Space"**
3. Configure your Space:
   - **Space name**: `rag-chatbot` (or any name you prefer)
   - **License**: MIT
   - **Select the Space SDK**: Choose **Docker**
   - **Space hardware**: CPU basic (free tier) - upgrade if needed
   - **Visibility**: Public or Private (your choice)
4. Click **"Create Space"**

### Step 2: Prepare Backend Files

From your project root, navigate to the backend directory:

```bash
cd backend
```

Ensure these files exist:
- `Dockerfile` - Docker configuration for HuggingFace Spaces
- `app.py` - Entry point for HuggingFace Spaces
- `README_HUGGINGFACE.md` - Space documentation
- `requirements.txt` - Python dependencies
- `src/` - Your application source code

### Step 3: Rename README for HuggingFace

```bash
# Backup original README if it exists
mv README.md README_LOCAL.md 2>/dev/null || true

# Use the HuggingFace-specific README
cp README_HUGGINGFACE.md README.md
```

### Step 4: Initialize Git and Push to HuggingFace

```bash
# Initialize git repository (if not already done)
git init

# Add HuggingFace Space as remote
# Replace YOUR_USERNAME and YOUR_SPACE_NAME with your actual values
git remote add huggingface https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME

# Add all backend files
git add .

# Commit the files
git commit -m "Initial deployment of RAG AI Chatbot to HuggingFace Spaces"

# Push to HuggingFace
git push huggingface main
```

**Note**: You may need to authenticate. HuggingFace will prompt you for your username and access token.

### Step 5: Configure Secrets in HuggingFace Spaces

1. Go to your Space on HuggingFace: `https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME`
2. Click on **"Settings"** (gear icon)
3. Scroll down to **"Repository secrets"**
4. Add the following secrets:

   **Required:**
   - **Name**: `OPENROUTER_API_KEY`
     - **Value**: Your OpenRouter API key (starts with `sk-or-v1-...`)

   **Optional (add if you're using these services):**
   - **Name**: `QDRANT_URL`
     - **Value**: Your Qdrant Cloud instance URL
   - **Name**: `QDRANT_API_KEY`
     - **Value**: Your Qdrant API key
   - **Name**: `DATABASE_URL`
     - **Value**: Your Neon Postgres connection string
   - **Name**: `GEMINI_API_KEY`
     - **Value**: Your Google Gemini API key (fallback)

5. Click **"Save"** for each secret

### Step 6: Verify Deployment

1. Wait for the Space to build (check the "Logs" tab)
2. Once the build completes, your Space will show a **"Running"** status
3. Note your Space URL: `https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space`

Test the health endpoint:

```bash
curl https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/health
```

Expected response:
```json
{"status": "healthy"}
```

---

## Frontend Configuration

### Step 1: Update API Configuration

1. Open `src/config/api.js` in your project root
2. Replace `YOUR_HUGGINGFACE_USERNAME` with your actual HuggingFace username
3. Update the Space name if you used a different name:

```javascript
// Before:
return 'https://YOUR_HUGGINGFACE_USERNAME-rag-chatbot.hf.space';

// After (example):
return 'https://ibrahimgem-rag-chatbot.hf.space';
```

### Step 2: Update ChatWidget Component

Open `src/components/ChatWidget/ChatWidget.jsx` and replace the hardcoded API paths with the configuration:

```javascript
// At the top of the file, add:
import { getApiUrl, API_CONFIG } from '../../config/api';

// Replace fetch calls:
// Before:
const response = await fetch('/api/session', {

// After:
const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SESSION), {

// Apply this change to all fetch calls in the component
```

### Step 3: Build and Deploy to GitHub Pages

From your project root:

```bash
# Install dependencies if not already done
npm install

# Build the Docusaurus site
npm run build

# Deploy to GitHub Pages
npm run deploy
```

Or if using the deployment script:

```bash
GIT_USER=YOUR_GITHUB_USERNAME npm run deploy
```

### Step 4: Verify GitHub Pages Deployment

1. Visit your GitHub Pages URL: `https://YOUR_GITHUB_USERNAME.github.io/humanoid-robotics-book/`
2. Open the browser console (F12)
3. Check for any CORS errors or failed API requests

---

## Testing the Integration

### Test 1: Health Check

```bash
# Test backend health
curl https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/health

# Expected: {"status": "healthy"}
```

### Test 2: Session Initialization

```bash
# Initialize a session
curl -X POST https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/api/session

# Expected: {"session_id": "some-uuid"}
```

### Test 3: Chat Endpoint

```bash
# Send a chat message
curl -X POST https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question_text": "What is humanoid robotics?",
    "query_mode": "global",
    "session_id": "test-session-123"
  }'

# Expected: {"response": "...", "sources": [...], ...}
```

### Test 4: CORS from Browser

Open your GitHub Pages site in a browser and:

1. Open the chat widget
2. Send a test message
3. Check the browser console for:
   - No CORS errors
   - Successful API responses
   - Chat messages displaying correctly

### Test 5: End-to-End Test

Create a test script in `backend/test_deployment.sh`:

```bash
#!/bin/bash

BACKEND_URL="https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space"

echo "Testing RAG AI Chatbot Deployment..."
echo "===================================="
echo

# Test 1: Health Check
echo "1. Health Check"
curl -s "$BACKEND_URL/health" | jq .
echo

# Test 2: Initialize Session
echo "2. Session Initialization"
SESSION_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/session")
echo $SESSION_RESPONSE | jq .
SESSION_ID=$(echo $SESSION_RESPONSE | jq -r .session_id)
echo

# Test 3: Send Chat Message
echo "3. Chat Message"
curl -s -X POST "$BACKEND_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d "{
    \"question_text\": \"What is humanoid robotics?\",
    \"query_mode\": \"global\",
    \"session_id\": \"$SESSION_ID\"
  }" | jq .
echo

echo "===================================="
echo "Deployment test complete!"
```

Make it executable and run:

```bash
chmod +x backend/test_deployment.sh
./backend/test_deployment.sh
```

---

## Troubleshooting

### Issue 1: Space Build Fails

**Symptoms**: Build logs show errors during Docker build

**Solutions**:
1. Check `requirements.txt` for version conflicts
2. Verify Dockerfile syntax
3. Check HuggingFace Spaces status page for service issues
4. Review build logs in the "Logs" tab

### Issue 2: CORS Errors in Browser

**Symptoms**:
```
Access to fetch at 'https://...' from origin 'https://ibrahimgem.github.io' has been blocked by CORS policy
```

**Solutions**:
1. Verify `src/api/main.py` includes your GitHub Pages domain in `allowed_origins`
2. Check that the backend is running (visit the Space URL)
3. Ensure the frontend is using the correct backend URL
4. Clear browser cache and reload

### Issue 3: 404 Not Found Errors

**Symptoms**: API endpoints return 404

**Solutions**:
1. Verify the backend URL is correct in `src/config/api.js`
2. Check that app.py is running on port 7860
3. Test endpoints directly with curl
4. Review backend logs in HuggingFace Spaces

### Issue 4: Authentication Errors

**Symptoms**:
```
{"detail": "OpenRouter API key not configured"}
```

**Solutions**:
1. Verify `OPENROUTER_API_KEY` is set in HuggingFace Spaces secrets
2. Check that the secret name matches exactly (case-sensitive)
3. Restart the Space after adding secrets
4. Verify the API key is valid at https://openrouter.ai/

### Issue 5: Chat Responses Are Empty

**Symptoms**: Chat widget shows no response or empty responses

**Solutions**:
1. Check backend logs for errors
2. Verify OpenRouter API key is valid and has credits
3. Test the `/api/chat` endpoint directly with curl
4. Check if the model (Meta Llama 3.3 70B) is available
5. Review frontend console for JavaScript errors

### Issue 6: Slow Response Times

**Symptoms**: Chat takes a long time to respond

**Solutions**:
1. Upgrade HuggingFace Space hardware (Settings > Hardware)
2. Consider using a faster model in OpenRouter
3. Optimize vector search queries (if using Qdrant)
4. Add request timeout handling in the frontend

---

## URLs and Resources

After deployment, bookmark these URLs:

- **Backend API**: `https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space`
- **Frontend**: `https://YOUR_GITHUB_USERNAME.github.io/humanoid-robotics-book/`
- **HuggingFace Space**: `https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME`
- **GitHub Repository**: `https://github.com/YOUR_USERNAME/humanoid-robotics-book`

### Useful Links

- [HuggingFace Spaces Documentation](https://huggingface.co/docs/hub/spaces)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [FastAPI CORS Guide](https://fastapi.tiangolo.com/tutorial/cors/)

---

## Maintenance

### Updating the Backend

```bash
cd backend
git add .
git commit -m "Update backend"
git push huggingface main
```

The Space will automatically rebuild and redeploy.

### Updating the Frontend

```bash
# From project root
npm run build
npm run deploy
```

### Monitoring

1. **HuggingFace Spaces**: Check the "Logs" tab for backend logs
2. **Browser Console**: Monitor frontend errors and API responses
3. **OpenRouter Dashboard**: Track API usage and costs
4. **GitHub Actions**: Monitor deployment workflows

---

## Security Best Practices

1. **Never commit API keys** to Git repositories
2. **Use environment variables** for all secrets
3. **Regularly rotate** API keys
4. **Monitor usage** to detect unusual activity
5. **Use specific CORS origins** (avoid `*` in production)
6. **Keep dependencies updated** for security patches
7. **Enable rate limiting** if expecting high traffic

---

## Cost Considerations

- **HuggingFace Spaces**: Free tier available, paid tiers for more resources
- **OpenRouter**: Pay-per-use (check free tier limits)
- **Qdrant Cloud**: Free tier available
- **Neon Postgres**: Free tier available
- **GitHub Pages**: Free for public repositories

---

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review backend logs in HuggingFace Spaces
3. Check browser console for frontend errors
4. Verify all secrets are configured correctly
5. Test endpoints individually with curl
6. Consult the documentation links above

---

## Next Steps

After successful deployment:

1. **Ingest Content**: Use the `/api/ingest` endpoint to populate the vector database
2. **Customize UI**: Enhance the chat widget styling and functionality
3. **Add Features**: Implement additional query modes or capabilities
4. **Monitor Performance**: Track response times and error rates
5. **Gather Feedback**: Share with users and iterate based on feedback

---

**Congratulations!** Your RAG AI Chatbot is now deployed and integrated with GitHub Pages.
