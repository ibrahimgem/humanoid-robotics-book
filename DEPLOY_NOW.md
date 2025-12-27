# 🚀 Deploy RAG Chatbot NOW - Step by Step

Everything is ready! Follow these commands to deploy in the next 10 minutes.

---

## ✅ Pre-Deployment Checklist

**Already Done:**
- [x] Backend files prepared in `backend/` directory
- [x] Git repository initialized in backend
- [x] All files committed
- [x] Frontend API configured to point to HuggingFace
- [x] ChatWidget updated with API integration
- [x] CORS configured for GitHub Pages
- [x] HuggingFace remote added

**You Need:**
- [ ] HuggingFace account (username: ibrahimgem)
- [ ] HuggingFace Access Token
- [ ] GitHub repository access

---

## Part 1: Create HuggingFace Space (2 minutes)

### Step 1: Create the Space

1. **Go to:** https://huggingface.co/new-space

2. **Fill in:**
   - Owner: `ibrahimgem`
   - Space name: `humanoid-robotics-rag`
   - License: MIT
   - SDK: **Docker** ⚠️ Important!
   - Hardware: **CPU basic** (free tier)
   - Visibility: Public

3. **Click "Create Space"**

### Step 2: Get Access Token

1. **Go to:** https://huggingface.co/settings/tokens
2. **Click:** "New token"
3. **Name:** `rag-chatbot-deploy`
4. **Type:** **Write** ⚠️ Important!
5. **Click:** "Generate a token"
6. **Copy the token** - you'll need it in the next step

---

## Part 2: Push Backend to HuggingFace (3 minutes)

### Commands to Run:

```bash
# Navigate to backend directory
cd /Users/apple/Data/Certified-Cloud-Applied-Generative-AI-Engineering/Q4-Agentic-AI/ai_driven_development/hackathon-1.0/humanoid-robotics-book/backend

# Push to HuggingFace
git push huggingface main
```

**When prompted:**
- **Username:** `ibrahimgem`
- **Password:** Paste your HuggingFace Access Token (from Step 2 above)

**Expected output:**
```
Enumerating objects: ...
Counting objects: 100% (X/X), done.
Writing objects: 100% (X/X), done.
To https://huggingface.co/spaces/ibrahimgem/humanoid-robotics-rag
 * [new branch]      main -> main
```

---

## Part 3: Configure Environment Secret (1 minute)

### Step 1: Get Your OpenRouter API Key

```bash
# View your API key
cat backend/.env | grep OPENROUTER_API_KEY
```

**Copy the value** (everything after `=`)

### Step 2: Add Secret to HuggingFace Space

1. **Go to:** https://huggingface.co/spaces/ibrahimgem/humanoid-robotics-rag/settings

2. **Scroll to:** "Repository secrets"

3. **Click:** "New secret"

4. **Add:**
   - Name: `OPENROUTER_API_KEY`
   - Value: (paste your API key from Step 1)

5. **Click:** "Add secret"

### Step 3: Wait for Build (2-3 minutes)

The Space will automatically rebuild. You can watch the build logs at:
https://huggingface.co/spaces/ibrahimgem/humanoid-robotics-rag

**Build status will show:**
- 🟡 Building...
- 🟢 Running (when complete)

---

## Part 4: Verify Backend (1 minute)

### Test Health Endpoint

```bash
# Check if backend is running
curl https://ibrahimgem-humanoid-robotics-rag.hf.space/health
```

**Expected response:**
```json
{"status": "healthy"}
```

### Test Chat Endpoint

```bash
# Test chat functionality
curl -X POST https://ibrahimgem-humanoid-robotics-rag.hf.space/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question_text": "Hello!",
    "query_mode": "global",
    "session_id": "test-123"
  }'
```

**Expected response:** JSON with AI-generated greeting

---

## Part 5: Deploy Frontend to GitHub Pages (5 minutes)

### Step 1: Navigate to Project Root

```bash
cd /Users/apple/Data/Certified-Cloud-Applied-Generative-AI-Engineering/Q4-Agentic-AI/ai_driven_development/hackathon-1.0/humanoid-robotics-book
```

### Step 2: Install Dependencies (if needed)

```bash
# Only if node_modules doesn't exist
npm install
```

### Step 3: Build Docusaurus Site

```bash
npm run build
```

**Expected output:**
```
[SUCCESS] Generated static files in "build"
```

### Step 4: Deploy to GitHub Pages

```bash
npm run deploy
```

**This will:**
1. Build the site
2. Push to `gh-pages` branch
3. Trigger GitHub Pages deployment

**Expected output:**
```
Published
```

### Step 5: Enable GitHub Pages (if not already enabled)

1. **Go to:** https://github.com/ibrahimgem/humanoid-robotics-book/settings/pages

2. **Source:** Deploy from a branch

3. **Branch:** `gh-pages` / `root`

4. **Click:** "Save"

---

## Part 6: Test Full Integration (2 minutes)

### Step 1: Visit Your Site

**URL:** https://ibrahimgem.github.io/humanoid-robotics-book/

**Wait:** 1-2 minutes for GitHub Pages to update

### Step 2: Test the Chatbot

1. **Look for:** Chatbot button (bottom-right corner)
2. **Click:** The floating action button
3. **Type:** "What is ROS 2?"
4. **Expect:** AI-generated response about ROS 2

### Step 3: Verify Features

- [ ] Chatbot opens/closes smoothly
- [ ] Theme switcher works (light/dark mode)
- [ ] Messages send successfully
- [ ] AI responses are received
- [ ] No errors in browser console (F12)
- [ ] Loading states work correctly

---

## 🎉 Success Checklist

**Backend (HuggingFace):**
- [ ] Space created
- [ ] Code pushed
- [ ] Secret configured
- [ ] Space shows "Running" status
- [ ] Health endpoint returns healthy
- [ ] Chat endpoint returns responses

**Frontend (GitHub Pages):**
- [ ] Build completed without errors
- [ ] Deployed to gh-pages branch
- [ ] Site accessible at GitHub Pages URL
- [ ] Chatbot UI loads
- [ ] Can interact with chatbot

**Integration:**
- [ ] No CORS errors
- [ ] API requests reach backend
- [ ] AI responses generated
- [ ] Theme switching works
- [ ] Mobile responsive

---

## 🔧 Quick Troubleshooting

### Backend Not Responding

```bash
# Check Space status
# Visit: https://huggingface.co/spaces/ibrahimgem/humanoid-robotics-rag

# Check logs for errors
# Click on "Logs" tab in the Space
```

### Frontend Not Showing Chatbot

```bash
# Check browser console
# Press F12 → Console tab
# Look for errors
```

### CORS Errors

The backend is already configured with CORS for `https://ibrahimgem.github.io`

If you see CORS errors:
1. Clear browser cache
2. Check backend logs
3. Verify backend URL in `src/config/api.js`

---

## 📊 Your Deployment URLs

**Frontend (Live Site):**
- URL: https://ibrahimgem.github.io/humanoid-robotics-book/
- Repository: https://github.com/ibrahimgem/humanoid-robotics-book

**Backend (API):**
- Space: https://huggingface.co/spaces/ibrahimgem/humanoid-robotics-rag
- API URL: https://ibrahimgem-humanoid-robotics-rag.hf.space
- Health Check: https://ibrahimgem-humanoid-robotics-rag.hf.space/health
- API Docs: https://ibrahimgem-humanoid-robotics-rag.hf.space/docs

---

## 🚀 Start Deployment Now!

**Begin with Part 1:** Create the HuggingFace Space

Then follow each part in order. Total time: ~10 minutes.

**Questions?** Check `DEPLOYMENT_GUIDE.md` for detailed troubleshooting.

---

**Ready? Let's deploy!** 🎯
