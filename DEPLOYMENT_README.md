# RAG AI Chatbot Deployment Package

This deployment package contains everything you need to deploy the RAG AI Chatbot backend to HuggingFace Spaces and integrate it with the GitHub Pages frontend.

## Package Contents

### Documentation (Start Here!)

1. **QUICK_START.md** - 10-minute deployment guide (recommended starting point)
2. **DEPLOYMENT.md** - Comprehensive deployment guide with troubleshooting
3. **DEPLOYMENT_SUMMARY.md** - Architecture overview and technical details
4. **DEPLOYMENT_CHECKLIST.md** - Step-by-step verification checklist
5. **DEPLOYMENT_FILES.txt** - Complete list of files and their purposes

### Backend Deployment Files

Located in `backend/`:

- **README_HUGGINGFACE.md** - Space documentation with metadata
- **app.py** - HuggingFace Spaces entry point
- **Dockerfile** - Docker configuration
- **.env.example** - Environment variables template
- **test_deployment.sh** - Automated testing script
- **DEPLOY_INSTRUCTIONS.md** - Quick backend deployment guide

### Frontend Configuration Files

Located in `src/`:

- **config/api.js** - API endpoint configuration
- **components/ChatWidget/ChatWidget_UPDATED.jsx** - Updated chat widget

### Configuration Updates

- **backend/src/api/main.py** - Updated with GitHub Pages CORS
- **backend/.env.example** - Updated with all required variables

## Quick Deployment (10 Minutes)

Follow these steps in order:

### 1. Create HuggingFace Space (2 min)
- Go to https://huggingface.co/spaces
- Create new Space: SDK = Docker, Name = rag-chatbot

### 2. Deploy Backend (3 min)
```bash
cd backend
mv README.md README_LOCAL.md
cp README_HUGGINGFACE.md README.md
git remote add huggingface https://huggingface.co/spaces/YOUR_USERNAME/rag-chatbot
git add .
git commit -m "Deploy RAG AI Chatbot"
git push huggingface main
```

### 3. Configure Secrets (1 min)
- Go to Space Settings → Repository secrets
- Add: `OPENROUTER_API_KEY` = (your key from .env file)

### 4. Update Frontend Config (2 min)
Edit `src/config/api.js`:
```javascript
return 'https://YOUR_USERNAME-rag-chatbot.hf.space';
```

Replace ChatWidget:
```bash
cd src/components/ChatWidget
mv ChatWidget.jsx ChatWidget_OLD.jsx
mv ChatWidget_UPDATED.jsx ChatWidget.jsx
```

### 5. Deploy Frontend (1 min)
```bash
npm run build
npm run deploy
```

### 6. Test (1 min)
```bash
cd backend
./test_deployment.sh https://YOUR_USERNAME-rag-chatbot.hf.space
```

## Architecture

```
GitHub Pages (Frontend) ←→ HuggingFace Spaces (Backend) ←→ OpenRouter (AI)
                                    ↓
                        Qdrant (Vectors) + Neon (Database)
                              [Optional]
```

## Required Configuration

### HuggingFace Spaces Secrets

**Required:**
- `OPENROUTER_API_KEY` - Your OpenRouter API key

**Optional:**
- `QDRANT_URL` - Qdrant Cloud instance URL
- `QDRANT_API_KEY` - Qdrant API key
- `DATABASE_URL` - Neon Postgres connection string
- `GEMINI_API_KEY` - Google Gemini API key (fallback)

### Frontend Configuration

Edit `src/config/api.js`:
- Replace `YOUR_HUGGINGFACE_USERNAME` with your actual HuggingFace username

### CORS Configuration

Already configured in `backend/src/api/main.py`:
- `https://ibrahimgem.github.io` - Update if your GitHub Pages URL is different

## Testing

### Backend Health Check
```bash
curl https://YOUR_USERNAME-rag-chatbot.hf.space/health
```

### Full Test Suite
```bash
cd backend
./test_deployment.sh https://YOUR_USERNAME-rag-chatbot.hf.space
```

### Manual Testing
1. Visit: `https://YOUR_GITHUB_USERNAME.github.io/humanoid-robotics-book/`
2. Click chat widget
3. Send test message
4. Verify response

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error | Update GitHub Pages URL in `backend/src/api/main.py` |
| 404 error | Check backend URL in `src/config/api.js` |
| Empty responses | Verify `OPENROUTER_API_KEY` in HuggingFace secrets |
| Build fails | Check `requirements.txt` versions |

See **DEPLOYMENT.md** for detailed troubleshooting.

## URLs to Update

Replace these placeholders:

1. **YOUR_USERNAME** - Your HuggingFace username
2. **YOUR_GITHUB_USERNAME** - Your GitHub username
3. **Backend URL**: `https://YOUR_USERNAME-rag-chatbot.hf.space`
4. **Frontend URL**: `https://YOUR_GITHUB_USERNAME.github.io/humanoid-robotics-book/`

## Documentation Hierarchy

```
QUICK_START.md          ← Start here for fastest deployment
    ↓
DEPLOYMENT.md           ← Detailed guide with troubleshooting
    ↓
DEPLOYMENT_SUMMARY.md   ← Technical architecture overview
    ↓
DEPLOYMENT_CHECKLIST.md ← Complete verification checklist
```

## Support Resources

- **HuggingFace Spaces**: https://huggingface.co/docs/hub/spaces
- **OpenRouter**: https://openrouter.ai/docs
- **FastAPI CORS**: https://fastapi.tiangolo.com/tutorial/cors/
- **GitHub Pages**: https://docs.github.com/en/pages

## Cost Estimate

| Service | Free Tier | Cost |
|---------|-----------|------|
| HuggingFace Spaces | CPU basic | Free |
| OpenRouter | Limited credits | ~$0.001-0.05/request |
| GitHub Pages | Public repos | Free |
| Qdrant Cloud | 1GB | Optional |
| Neon Postgres | 0.5GB | Optional |

**Total**: ~$0-5/month (depending on usage)

## Next Steps After Deployment

1. Test with various questions
2. Ingest documentation content
3. Monitor performance and errors
4. Customize chat widget styling
5. Share with users and gather feedback

## Files Modified

- ✅ `backend/src/api/main.py` - CORS configuration
- ✅ `backend/.env.example` - Environment variables
- ✅ New: `src/config/api.js` - API configuration
- ✅ New: `src/components/ChatWidget/ChatWidget_UPDATED.jsx` - Updated widget

## Deployment Status

- [x] Backend files created
- [x] Frontend configuration created
- [x] CORS configured
- [x] Testing scripts created
- [x] Documentation complete
- [ ] Backend deployed to HuggingFace (your action)
- [ ] Frontend deployed to GitHub Pages (your action)
- [ ] Integration tested (your action)

## Ready to Deploy!

Follow **QUICK_START.md** for the fastest path to deployment.

---

**Created**: 2025-12-27  
**Version**: 1.0  
**Status**: Ready for deployment
