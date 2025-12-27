# Quick Start: Deploy RAG Chatbot in 10 Minutes

This is the fastest path to deployment. For detailed instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Prerequisites (2 minutes)

1. **HuggingFace Account**: Sign up at https://huggingface.co/
2. **OpenRouter API Key**: Get free key at https://openrouter.ai/
3. **Git installed**: Check with `git --version`

## Step 1: Create HuggingFace Space (2 minutes)

1. Go to https://huggingface.co/spaces
2. Click "Create new Space"
3. Settings:
   - Name: `rag-chatbot`
   - SDK: **Docker**
   - Hardware: CPU basic (free)
   - Visibility: Public
4. Click "Create Space"
5. **Note your Space URL**: `https://YOUR_USERNAME-rag-chatbot.hf.space`

## Step 2: Deploy Backend (3 minutes)

```bash
# Navigate to backend
cd backend

# Backup original README
mv README.md README_LOCAL.md 2>/dev/null || true

# Use HuggingFace README
cp README_HUGGINGFACE.md README.md

# Add HuggingFace remote (replace YOUR_USERNAME)
git remote add huggingface https://huggingface.co/spaces/YOUR_USERNAME/rag-chatbot

# Commit and push
git add .
git commit -m "Deploy RAG AI Chatbot"
git push huggingface main
```

Wait for build to complete (check "Logs" tab in HuggingFace Space).

## Step 3: Configure Secrets (1 minute)

1. Go to your Space: `https://huggingface.co/spaces/YOUR_USERNAME/rag-chatbot`
2. Click "Settings" (gear icon)
3. Scroll to "Repository secrets"
4. Add secret:
   - Name: `OPENROUTER_API_KEY`
   - Value: Your OpenRouter API key (from your `.env` file)
5. Click "Save"

## Step 4: Test Backend (1 minute)

```bash
# Test health endpoint (replace YOUR_USERNAME)
curl https://YOUR_USERNAME-rag-chatbot.hf.space/health

# Expected: {"status": "healthy"}

# Or run full test suite
./test_deployment.sh https://YOUR_USERNAME-rag-chatbot.hf.space
```

## Step 5: Update Frontend (2 minutes)

### A. Update API Configuration

Edit `src/config/api.js` (line 9):

```javascript
// Before:
return 'https://YOUR_HUGGINGFACE_USERNAME-rag-chatbot.hf.space';

// After (replace with your username):
return 'https://ibrahimgem-rag-chatbot.hf.space';
```

### B. Update ChatWidget

```bash
# Navigate to ChatWidget directory
cd ../src/components/ChatWidget

# Backup original
mv ChatWidget.jsx ChatWidget_OLD.jsx

# Use updated version
mv ChatWidget_UPDATED.jsx ChatWidget.jsx
```

## Step 6: Deploy Frontend (1 minute)

```bash
# Navigate to project root
cd ../../..

# Build and deploy
npm run build
npm run deploy
```

## Step 7: Test Integration (1 minute)

1. Visit: `https://YOUR_GITHUB_USERNAME.github.io/humanoid-robotics-book/`
2. Click chat widget icon (bottom right)
3. Send message: "What is humanoid robotics?"
4. Verify response appears

### Check for Issues

Open browser console (F12) and verify:
- ✅ No CORS errors
- ✅ No 404 errors
- ✅ Chat messages send/receive successfully

## Troubleshooting

### CORS Error
```javascript
// Update backend/src/api/main.py (line 19)
allowed_origins = [
    "https://YOUR_GITHUB_USERNAME.github.io",  // Update this
]
```

### 404 Not Found
- Verify backend URL in `src/config/api.js`
- Check Space is running on HuggingFace

### Empty Responses
- Verify `OPENROUTER_API_KEY` is set in HuggingFace Spaces secrets
- Check backend logs in HuggingFace Spaces "Logs" tab

## URLs to Remember

After deployment, bookmark these:

- **Backend**: `https://YOUR_USERNAME-rag-chatbot.hf.space`
- **Frontend**: `https://YOUR_GITHUB_USERNAME.github.io/humanoid-robotics-book/`
- **HF Space**: `https://huggingface.co/spaces/YOUR_USERNAME/rag-chatbot`

## Next Steps

- [ ] Test with various questions
- [ ] Ingest content: Use `/api/ingest` endpoint
- [ ] Customize chat widget styling
- [ ] Monitor usage in OpenRouter dashboard
- [ ] Share with users!

## Need Help?

- **Detailed Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- **Architecture**: [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)

---

**Total Time**: ~10 minutes

**Status**: Ready to deploy! 🚀
