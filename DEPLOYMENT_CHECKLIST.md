# Deployment Checklist

Use this checklist to ensure all deployment steps are completed successfully.

## Pre-Deployment

- [ ] Backend is running locally without errors
- [ ] OpenRouter API key is valid and has credits
- [ ] Frontend chatbot UI is functional locally
- [ ] All dependencies are documented in `requirements.txt`
- [ ] `.env.example` is updated with all required variables

## HuggingFace Spaces Setup

- [ ] Created new HuggingFace Space
  - Space name: `rag-chatbot` (or custom name)
  - SDK: Docker
  - Visibility: Public or Private
  - Hardware: CPU basic (free tier)

## Backend Deployment

- [ ] Renamed README.md to README_LOCAL.md (backup)
- [ ] Copied README_HUGGINGFACE.md to README.md
- [ ] Initialized git repository in backend directory
- [ ] Added HuggingFace remote repository
- [ ] Committed all backend files
- [ ] Pushed to HuggingFace Spaces
- [ ] Build completed successfully (check Logs tab)
- [ ] Space shows "Running" status

## Environment Variables Configuration

- [ ] Added `OPENROUTER_API_KEY` secret in HuggingFace Spaces
- [ ] (Optional) Added `QDRANT_URL` secret
- [ ] (Optional) Added `QDRANT_API_KEY` secret
- [ ] (Optional) Added `DATABASE_URL` secret
- [ ] (Optional) Added `GEMINI_API_KEY` secret
- [ ] Restarted Space after adding secrets

## Backend Testing

- [ ] Health endpoint responds: `curl https://YOUR_USERNAME-rag-chatbot.hf.space/health`
- [ ] Root endpoint responds: `curl https://YOUR_USERNAME-rag-chatbot.hf.space/`
- [ ] Session initialization works: `curl -X POST .../api/session`
- [ ] Chat endpoint responds to queries: `curl -X POST .../api/chat`
- [ ] CORS headers are present in response
- [ ] Ran `test_deployment.sh` script successfully

## Frontend Configuration

- [ ] Updated `src/config/api.js` with HuggingFace Space URL
- [ ] Replaced YOUR_HUGGINGFACE_USERNAME with actual username
- [ ] Updated ChatWidget.jsx to use API configuration:
  - [ ] Added import: `import { getApiUrl, API_CONFIG } from '../../config/api';`
  - [ ] Updated `/api/session` fetch call
  - [ ] Updated `/api/chat` fetch call
  - [ ] Updated `/api/query-mode` fetch call
- [ ] Updated GitHub Pages domain in backend CORS config (if different)

## Frontend Deployment

- [ ] Ran `npm install` to ensure dependencies are installed
- [ ] Ran `npm run build` successfully
- [ ] No build errors or warnings
- [ ] Deployed to GitHub Pages: `npm run deploy`
- [ ] GitHub Pages site is accessible
- [ ] Custom domain configured (if applicable)

## Integration Testing

- [ ] Visited GitHub Pages URL
- [ ] Chat widget appears on the page
- [ ] Clicked to open chat widget
- [ ] No CORS errors in browser console
- [ ] Session initializes successfully
- [ ] Can send a test message
- [ ] Receives a response from the AI
- [ ] Response displays correctly in chat widget
- [ ] Follow-up questions appear (if applicable)
- [ ] Source citations display (if applicable)
- [ ] Error handling works (try with backend offline)

## Cross-Browser Testing

- [ ] Tested in Chrome/Chromium
- [ ] Tested in Firefox
- [ ] Tested in Safari (macOS/iOS)
- [ ] Tested in Edge
- [ ] Tested on mobile devices

## Performance Verification

- [ ] Response time is acceptable (<5 seconds)
- [ ] No memory leaks in chat widget
- [ ] Multiple messages work correctly
- [ ] Session persistence works
- [ ] Chat history displays correctly

## Documentation

- [ ] README.md includes deployment information
- [ ] DEPLOYMENT.md is complete and accurate
- [ ] DEPLOY_INSTRUCTIONS.md has correct URLs
- [ ] API endpoints are documented
- [ ] Environment variables are documented
- [ ] Troubleshooting section is helpful

## Security Review

- [ ] No API keys committed to Git
- [ ] All secrets stored in HuggingFace Spaces settings
- [ ] CORS origins are specific (not "*")
- [ ] No sensitive data in logs
- [ ] Rate limiting considered (if needed)
- [ ] HTTPS is used for all API calls

## Monitoring Setup

- [ ] HuggingFace Spaces logs are accessible
- [ ] Can monitor backend errors
- [ ] Can monitor API usage
- [ ] OpenRouter dashboard configured
- [ ] GitHub Actions workflow is working
- [ ] Error tracking set up (optional)

## Post-Deployment

- [ ] Shared deployment URLs with team
- [ ] Bookmarked important URLs:
  - [ ] Backend: https://YOUR_USERNAME-rag-chatbot.hf.space
  - [ ] Frontend: https://YOUR_GITHUB_USERNAME.github.io/humanoid-robotics-book/
  - [ ] HF Space: https://huggingface.co/spaces/YOUR_USERNAME/rag-chatbot
- [ ] Created backup of working configuration
- [ ] Documented any custom modifications
- [ ] Planned for content ingestion (if needed)

## Optional Enhancements

- [ ] Set up custom domain for GitHub Pages
- [ ] Upgraded HuggingFace Space hardware (if needed)
- [ ] Configured Qdrant Cloud for vector storage
- [ ] Configured Neon Postgres for chat history
- [ ] Added analytics/monitoring tools
- [ ] Implemented rate limiting
- [ ] Added user authentication (if needed)
- [ ] Set up CI/CD pipeline
- [ ] Created staging environment

## Rollback Plan

In case of issues, document rollback steps:

- [ ] Previous backend version URL: ___________________________
- [ ] Previous frontend deployment: ___________________________
- [ ] Backup configuration files location: ___________________________
- [ ] Contact for urgent issues: ___________________________

## Sign-off

Deployment completed by: ___________________________

Date: ___________________________

Approved by: ___________________________

Date: ___________________________

---

**Notes:**
- Check off items as you complete them
- Document any deviations from standard deployment
- Keep this checklist for future deployments
- Update checklist based on lessons learned
