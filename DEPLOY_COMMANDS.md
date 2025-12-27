# 🚀 Final Deployment Commands

Everything is built and ready! Follow these exact commands to deploy.

---

## ✅ Current Status

- ✅ Backend: All files committed and ready in `backend/` directory
- ✅ Frontend: Build completed successfully in `build/` directory
- ✅ Configuration: API endpoints configured for production
- ✅ Scripts: Deployment scripts created and executable

---

## 🎯 Deploy in 3 Steps (8 minutes)

### Step 1: Create HuggingFace Space (2 minutes) - MANUAL

**Go to:** https://huggingface.co/new-space

**Settings:**
```
Owner: ibrahimgem
Space name: humanoid-robotics-rag
License: MIT
SDK: Docker ⚠️ IMPORTANT!
Hardware: CPU basic (free)
Visibility: Public
```

**Click:** "Create Space"

---

### Step 2: Push Backend to HuggingFace (3 minutes)

#### 2a. Get HuggingFace Token

**Go to:** https://huggingface.co/settings/tokens

**Create token:**
- Name: `rag-deploy`
- Type: **Write** ⚠️ IMPORTANT!
- Click "Generate"
- **Copy the token**

#### 2b. Push Backend

```bash
# Navigate to backend directory
cd /Users/apple/Data/Certified-Cloud-Applied-Generative-AI-Engineering/Q4-Agentic-AI/ai_driven_development/hackathon-1.0/humanoid-robotics-book/backend

# Push to HuggingFace (you'll be prompted for credentials)
./PUSH_TO_HF.sh
```

**When prompted:**
- Username: `ibrahimgem`
- Password: Paste your token (from 2a)

**Expected output:**
```
Enumerating objects: 46, done.
Writing objects: 100% (46/46), done.
To https://huggingface.co/spaces/ibrahimgem/humanoid-robotics-rag
 * [new branch]      main -> main
```

#### 2c. Add Environment Secret

1. **Go to:** https://huggingface.co/spaces/ibrahimgem/humanoid-robotics-rag/settings

2. **Scroll to:** "Repository secrets"

3. **Click:** "New secret"

4. **Add:**
   ```
   Name: OPENROUTER_API_KEY
   Value: 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
   ```

5. **Click:** "Add secret"

#### 2d. Wait for Build

- Space will automatically rebuild (2-3 minutes)
- Watch at: https://huggingface.co/spaces/ibrahimgem/humanoid-robotics-rag
- Status will change: Building → Running

---

### Step 3: Deploy Frontend to GitHub Pages (3 minutes)

```bash
# Navigate back to project root
cd /Users/apple/Data/Certified-Cloud-Applied-Generative-AI-Engineering/Q4-Agentic-AI/ai_driven_development/hackathon-1.0/humanoid-robotics-book

# Deploy to GitHub Pages (already built!)
npm run deploy
```

**Expected output:**
```
> humanoid-robotics-book@1.0.0 deploy
> docusaurus deploy

Deploying to GitHub Pages...
Published
```

**Wait:** 1-2 minutes for GitHub Pages to update

---

## ✅ Verify Deployment (2 minutes)

### Backend Health Check

```bash
# Check backend is running
curl https://ibrahimgem-humanoid-robotics-rag.hf.space/health
```

**Expected:** `{"status":"healthy"}`

### Frontend Live Site

**Visit:** https://ibrahimgem.github.io/humanoid-robotics-book/

**Test:**
1. Click chatbot button (bottom-right)
2. Type: "What is ROS 2?"
3. Should get AI response!

---

## 🎉 Success! Your URLs

**Live Site (Frontend):**
```
https://ibrahimgem.github.io/humanoid-robotics-book/
```

**API Backend:**
```
https://ibrahimgem-humanoid-robotics-rag.hf.space
```

**API Health:**
```
https://ibrahimgem-humanoid-robotics-rag.hf.space/health
```

**API Documentation:**
```
https://ibrahimgem-humanoid-robotics-rag.hf.space/docs
```

---

## 🔧 Quick Test Commands

```bash
# Test backend health
curl https://ibrahimgem-humanoid-robotics-rag.hf.space/health

# Test chat endpoint
curl -X POST https://ibrahimgem-humanoid-robotics-rag.hf.space/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question_text": "Hello, what can you tell me about humanoid robotics?",
    "query_mode": "global",
    "session_id": "test-123"
  }'

# Create session
curl -X POST https://ibrahimgem-humanoid-robotics-rag.hf.space/api/session
```

---

## 📊 Deployment Checklist

**Backend:**
- [ ] HuggingFace Space created
- [ ] Backend code pushed
- [ ] OPENROUTER_API_KEY secret added
- [ ] Space shows "Running" status
- [ ] Health endpoint responds

**Frontend:**
- [ ] Build completed (already done ✅)
- [ ] Deployed to gh-pages branch
- [ ] Site accessible
- [ ] Chatbot button visible
- [ ] Can send messages

**Integration:**
- [ ] No CORS errors
- [ ] API requests work
- [ ] AI responses generated
- [ ] Theme switching works

---

## 🚀 Start Now!

**Current directory:**
```bash
pwd
# Should show: .../humanoid-robotics-book/backend
```

**If not in backend directory:**
```bash
cd /Users/apple/Data/Certified-Cloud-Applied-Generative-AI-Engineering/Q4-Agentic-AI/ai_driven_development/hackathon-1.0/humanoid-robotics-book/backend
```

**Then run:**
```bash
./PUSH_TO_HF.sh
```

---

**Good luck! 🎯**
