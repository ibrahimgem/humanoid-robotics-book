# 🔐 Configure HuggingFace Secrets

Your backend has been successfully pushed to HuggingFace Space: `rag-chatbot`

Now you need to add the environment secrets to make the backend functional.

---

## 📍 Where to Add Secrets

**Go to:** https://huggingface.co/spaces/ibrahimgem/rag-chatbot/settings

**Scroll to:** "Repository secrets" section

---

## 🔑 Secrets to Add

Click "New secret" for each of these:

### 1. OPENROUTER_API_KEY (Required)

```
Name: OPENROUTER_API_KEY
Value: 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
```

### 2. QDRANT_URL (Required for vector storage)

```
Name: QDRANT_URL
Value: https://3a5bbc49-4928-438e-a5dc-90bf126c9442.europe-west3-0.gcp.cloud.qdrant.io
```

### 3. QDRANT_API_KEY (Required for vector storage)

```
Name: QDRANT_API_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.yQJFO-Vnu69iHcBA_OYgCqoQ-eJ6GjJpV5CMla9q5XY
```

### 4. DATABASE_URL (Required for persistence)

```
Name: DATABASE_URL
Value: postgresql://neondb_owner:npg_hBL4bofUFd3Z@ep-bold-dawn-a4jtmwo1-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 5. GEMINI_API_KEY (Optional - fallback)

```
Name: GEMINI_API_KEY
Value: AIzaSyAK_2QtVQ-CMu485cHXhcVz2KaV_ySxvks
```

---

## ⏱️ After Adding Secrets

1. **Wait 30-60 seconds** for the Space to rebuild automatically
2. The Space status will show:
   - 🟡 "Building..." (2-3 minutes)
   - 🟢 "Running" (when ready)

---

## ✅ Verify Backend is Running

Once the Space shows "Running", test it:

```bash
# Health check
curl https://ibrahimgem-rag-chatbot.hf.space/health

# Should return: {"status":"healthy"}
```

---

## 📊 Space URLs

- **Space Dashboard:** https://huggingface.co/spaces/ibrahimgem/rag-chatbot
- **Live API:** https://ibrahimgem-rag-chatbot.hf.space
- **API Docs:** https://ibrahimgem-rag-chatbot.hf.space/docs
- **Settings:** https://huggingface.co/spaces/ibrahimgem/rag-chatbot/settings

---

## 🚀 Next Step

After the backend is running, deploy the frontend:

```bash
cd /Users/apple/Data/Certified-Cloud-Applied-Generative-AI-Engineering/Q4-Agentic-AI/ai_driven_development/hackathon-1.0/humanoid-robotics-book
npm run deploy
```

---

**Good luck! The backend is live and waiting for secrets! 🎯**
