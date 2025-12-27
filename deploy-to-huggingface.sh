#!/bin/bash
# Deploy RAG Chatbot Backend to HuggingFace Spaces
# Usage: ./deploy-to-huggingface.sh

set -e

echo "🚀 Deploying RAG Chatbot Backend to HuggingFace Spaces..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
HF_USERNAME="ibrahimgem"
SPACE_NAME="humanoid-robotics-rag"
HF_SPACE_URL="https://huggingface.co/spaces/${HF_USERNAME}/${SPACE_NAME}"

echo -e "${BLUE}Configuration:${NC}"
echo "  Username: ${HF_USERNAME}"
echo "  Space Name: ${SPACE_NAME}"
echo "  Space URL: ${HF_SPACE_URL}"
echo ""

# Step 1: Check if Space exists (manual step)
echo -e "${YELLOW}Step 1: Create HuggingFace Space${NC}"
echo "  Please ensure you have created the Space at:"
echo "  ${HF_SPACE_URL}"
echo ""
echo "  Space Settings:"
echo "    - SDK: Docker"
echo "    - Hardware: CPU basic (free)"
echo "    - Visibility: Public"
echo ""
read -p "Have you created the Space? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Please create the Space first at: https://huggingface.co/new-space"
    exit 1
fi

# Step 2: Prepare backend directory
echo -e "${YELLOW}Step 2: Preparing backend files...${NC}"
cd backend

# Check required files
echo "  Checking required files..."
required_files=("app.py" "Dockerfile" "requirements.txt" "README.md" "src/api/main.py")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "  ❌ Missing required file: $file"
        exit 1
    fi
    echo "  ✅ Found: $file"
done

# Step 3: Initialize git if needed
echo -e "${YELLOW}Step 3: Setting up git repository...${NC}"
if [ ! -d ".git" ]; then
    git init
    echo "  ✅ Git initialized"
else
    echo "  ✅ Git already initialized"
fi

# Step 4: Add HuggingFace remote
echo -e "${YELLOW}Step 4: Adding HuggingFace remote...${NC}"
if git remote | grep -q "huggingface"; then
    echo "  Removing existing huggingface remote..."
    git remote remove huggingface
fi
git remote add huggingface "https://huggingface.co/spaces/${HF_USERNAME}/${SPACE_NAME}"
echo "  ✅ HuggingFace remote added"

# Step 5: Prepare commit
echo -e "${YELLOW}Step 5: Preparing files for commit...${NC}"

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
.env
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
ENV/
.vscode/
.idea/
*.log
.DS_Store
EOF
    echo "  ✅ Created .gitignore"
fi

# Stage all files
git add .
echo "  ✅ Files staged"

# Step 6: Commit
echo -e "${YELLOW}Step 6: Creating commit...${NC}"
git commit -m "Deploy RAG AI Chatbot to HuggingFace Spaces

- FastAPI backend with Docker
- OpenRouter integration for free AI models
- RAG pipeline with vector search
- Session management and chat endpoints
- Health check and monitoring" || echo "  No changes to commit"

# Step 7: Push to HuggingFace
echo -e "${YELLOW}Step 7: Pushing to HuggingFace Spaces...${NC}"
echo "  This will push to: ${HF_SPACE_URL}"
echo ""
echo "  ⚠️  You may be prompted for your HuggingFace credentials:"
echo "     Username: ${HF_USERNAME}"
echo "     Password: Use your HuggingFace Access Token (not your password!)"
echo "     Get token at: https://huggingface.co/settings/tokens"
echo ""
read -p "Ready to push? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Deployment cancelled."
    exit 1
fi

git push huggingface main --force

echo ""
echo -e "${GREEN}✅ Backend deployed successfully!${NC}"
echo ""
echo "🎉 Your backend is now deploying at: ${HF_SPACE_URL}"
echo ""
echo "Next steps:"
echo "  1. Go to ${HF_SPACE_URL}/settings"
echo "  2. Add secret: OPENROUTER_API_KEY"
echo "  3. Wait for Space to build (2-3 minutes)"
echo "  4. Test at: https://${HF_USERNAME}-${SPACE_NAME}.hf.space/health"
echo ""
echo "To deploy frontend to GitHub Pages, run:"
echo "  ./deploy-to-github-pages.sh"
echo ""
