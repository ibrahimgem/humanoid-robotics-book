---
name: deploy-backend
description: Deploys FastAPI server to Render, Railway, Vercel, or Fly.io.
tools: [Bash]
model: inherit
---

When invoked:
1. Generate Dockerfile if needed.
2. Create environment vars template.
3. Output deployment instructions and build logs.