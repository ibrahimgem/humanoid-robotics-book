# 🚀 Complete Deployment Guide

This guide will help you deploy your RAG AI Chatbot to production in **under 15 minutes**.

## 📋 Prerequisites

- [x] HuggingFace account (username: `ibrahimgem`)
- [x] GitHub account (username: `ibrahimgem`)
- [x] Git installed
- [x] Node.js and npm installed
- [x] OpenRouter API key (already configured in `.env`)

## 🎯 Deployment Architecture

```
┌─────────────────────────────────────┐
│  GitHub Pages (Frontend)            │
│  https://ibrahimgem.github.io       │
│  /humanoid-robotics-book            │
│  - Docusaurus documentation site    │
│  - Stunning chatbot UI              │
│  - Light/dark mode theme support    │
└─────────────────────────────────────┘
              │ HTTPS + CORS
              ▼
┌─────────────────────────────────────┐
│  HuggingFace Spaces (Backend)       │
│  ibrahimgem-humanoid-robotics-rag   │
│  - FastAPI server (Docker)          │
│  - Port 7860 (HF standard)          │
│  - OpenRouter integration           │
│  - Free tier (CPU basic)            │
└─────────────────────────────────────┘
              │
    ┌─────────┼─────────┐
    ▼         ▼         ▼
OpenRouter  Qdrant    Neon
 (Active)  (Optional) (Optional)
```

## 🚀 Quick Start (15 Minutes)

### Part 1: Deploy Backend to HuggingFace (8 minutes)

#### Step 1: Create HuggingFace Space (2 minutes)

1. Go to: https://huggingface.co/new-space
2. Fill in the details:
   - **Owner**: `ibrahimgem`
   - **Space name**: `humanoid-robotics-rag`
   - **License**: MIT
   - **Select SDK**: Docker
   - **Hardware**: CPU basic (free)
   - **Visibility**: Public
3. Click **"Create Space"**

#### Step 2: Get HuggingFace Token (1 minute)

1. Go to: https://huggingface.co/settings/tokens
2. Click **"New token"**
3. Name: `rag-chatbot-deploy`
4. Type: **Write**
5. Click **"Generate a token"**
6. **Copy the token** (you'll need it in the next step)

#### Step 3: Deploy Backend (5 minutes)

```bash
# Run the automated deployment script
./deploy-to-huggingface.sh
```

The script will:
- ✅ Check required files
- ✅ Initialize git in backend directory
- ✅ Add HuggingFace remote
- ✅ Stage and commit files
- ✅ Push to HuggingFace Spaces

**When prompted for credentials:**
- Username: `ibrahimgem`
- Password: **Paste your HuggingFace token** (from Step 2)

#### Step 4: Configure Secrets (1 minute)

1. Go to: https://huggingface.co/spaces/ibrahimgem/humanoid-robotics-rag/settings
2. Scroll to **"Repository secrets"**
3. Click **"New secret"**
4. Add:
   - Name: `OPENROUTER_API_KEY`
   - Value: (from your `.env` file in `backend/.env`)
5. Click **"Add secret"**

**Wait 2-3 minutes for the Space to build...**

#### Step 5: Verify Backend (1 minute)

```bash
# Check if backend is running
curl https://ibrahimgem-humanoid-robotics-rag.hf.space/health

# Test chat endpoint
curl -X POST https://ibrahimgem-humanoid-robotics-rag.hf.space/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question_text": "Hello!",
    "query_mode": "global",
    "session_id": "test-123"
  }'
```

Expected response: `{"status": "healthy"}`

---

### Part 2: Deploy Frontend to GitHub Pages (7 minutes)

#### Step 1: Verify API Configuration (1 minute)

```bash
# Check that API config points to HuggingFace
grep "ibrahimgem-humanoid-robotics-rag" src/config/api.js
```

Should show: `return 'https://ibrahimgem-humanoid-robotics-rag.hf.space';`

✅ **Already configured!**

#### Step 2: Build and Deploy (5 minutes)

```bash
# Run the automated deployment script
./deploy-to-github-pages.sh
```

The script will:
- ✅ Verify backend is running
- ✅ Check API configuration
- ✅ Install dependencies
- ✅ Build Docusaurus site
- ✅ Deploy to GitHub Pages

**Wait 1-2 minutes for GitHub Pages to update...**

#### Step 3: Verify Deployment (1 minute)

1. Visit: https://ibrahimgem.github.io/humanoid-robotics-book/
2. Click the chatbot button (bottom-right corner)
3. Type: "What is ROS 2?"
4. You should get an AI-generated response!

---

## ✅ Verification Checklist

### Backend Verification

- [ ] HuggingFace Space created
- [ ] Backend deployed successfully
- [ ] Environment secret (`OPENROUTER_API_KEY`) configured
- [ ] Space status shows "Running"
- [ ] Health endpoint returns `{"status": "healthy"}`
- [ ] Chat endpoint returns valid responses

### Frontend Verification

- [ ] GitHub Pages enabled in repository settings
- [ ] Build completed without errors
- [ ] Site accessible at GitHub Pages URL
- [ ] Chatbot UI loads correctly
- [ ] Chatbot button visible (bottom-right)
- [ ] Can open/close chatbot interface
- [ ] Theme switches work (light/dark mode)
- [ ] Chat messages send successfully
- [ ] AI responses received

### Integration Verification

- [ ] No CORS errors in browser console
- [ ] API requests reach HuggingFace backend
- [ ] Session creation works
- [ ] Query responses are generated
- [ ] Loading states work correctly
- [ ] Error handling works properly

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: Space build fails

**Solution**:
1. Check build logs in HuggingFace Space
2. Verify `Dockerfile` and `requirements.txt` are correct
3. Ensure Python 3.11 is specified (not 3.14)

**Problem**: Backend returns 500 errors

**Solution**:
1. Check Space logs for errors
2. Verify `OPENROUTER_API_KEY` secret is set
3. Restart the Space

### Frontend Issues

**Problem**: CORS errors in browser console

**Solution**:
- Backend CORS is already configured for `https://ibrahimgem.github.io`
- Clear browser cache and try again
- Check backend logs for CORS-related errors

**Problem**: Chatbot button not visible

**Solution**:
1. Clear browser cache
2. Check browser console for JavaScript errors
3. Verify `src/components/ChatWidget/ChatWidget.jsx` is correct version

**Problem**: No response from chatbot

**Solution**:
1. Open browser DevTools → Network tab
2. Check if API requests are being sent
3. Verify backend URL in `src/config/api.js`
4. Check backend health endpoint

### General Issues

**Problem**: 404 Not Found

**Solution**:
- **Backend**: Check Space name is `humanoid-robotics-rag`
- **Frontend**: Check repository name in `docusaurus.config.js`

**Problem**: Empty or generic responses

**Solution**:
- Vector database is empty (content not ingested yet)
- This is expected - you'll need to ingest content using `/api/ingest`

---

## 📊 Monitoring & Testing

### Backend Health Check

```bash
# Simple health check
curl https://ibrahimgem-humanoid-robotics-rag.hf.space/health

# Full diagnostic
./backend/test_deployment.sh https://ibrahimgem-humanoid-robotics-rag.hf.space
```

### Frontend Testing

1. **Manual Testing**:
   - Visit: https://ibrahimgem.github.io/humanoid-robotics-book/
   - Test all chatbot features
   - Try both light and dark modes
   - Test on mobile and desktop

2. **Browser Console**:
   - Open DevTools (F12)
   - Check Console for errors
   - Check Network tab for failed requests

---

## 🎯 Next Steps

### 1. Ingest Book Content

```bash
# Use the ingestion endpoint to load content
curl -X POST https://ibrahimgem-humanoid-robotics-rag.hf.space/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "content_path": "/docs",
    "recursive": true
  }'
```

### 2. Monitor Usage

- **HuggingFace**: Check Space metrics and logs
- **OpenRouter**: Monitor API usage at https://openrouter.ai/dashboard
- **GitHub**: Check Pages analytics

### 3. Scale Up (if needed)

- **Backend**: Upgrade HuggingFace Space hardware tier
- **Frontend**: Enable CDN in GitHub Pages settings
- **API**: Add Qdrant and Neon Postgres for persistence

---

## 📚 Additional Resources

- **HuggingFace Spaces Docs**: https://huggingface.co/docs/hub/spaces
- **GitHub Pages Docs**: https://docs.github.com/en/pages
- **OpenRouter Docs**: https://openrouter.ai/docs
- **Docusaurus Docs**: https://docusaurus.io/docs

---

## 🎉 Congratulations!

Your RAG AI Chatbot is now live in production!

- **Frontend**: https://ibrahimgem.github.io/humanoid-robotics-book/
- **Backend**: https://ibrahimgem-humanoid-robotics-rag.hf.space
- **Docs**: https://huggingface.co/spaces/ibrahimgem/humanoid-robotics-rag

Share your chatbot with the world! 🚀
