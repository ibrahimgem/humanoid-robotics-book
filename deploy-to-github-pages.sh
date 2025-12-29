#!/bin/bash
# Deploy Frontend to GitHub Pages
# Usage: ./deploy-to-github-pages.sh

set -e

echo "🚀 Deploying Frontend to GitHub Pages..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
GITHUB_USERNAME="ibrahimgem"
REPO_NAME="humanoid-robotics-book"
GITHUB_PAGES_URL="https://${GITHUB_USERNAME}.github.io/${REPO_NAME}"
HF_BACKEND_URL="https://ibrahimgem-humanoid-robotics-rag.hf.space"

echo -e "${BLUE}Configuration:${NC}"
echo "  GitHub Username: ${GITHUB_USERNAME}"
echo "  Repository: ${REPO_NAME}"
echo "  GitHub Pages URL: ${GITHUB_PAGES_URL}"
echo "  Backend URL: ${HF_BACKEND_URL}"
echo ""

# Step 1: Check if backend is deployed
echo -e "${YELLOW}Step 1: Verifying backend deployment...${NC}"
echo "  Checking backend health at: ${HF_BACKEND_URL}/health"
if curl -s --max-time 10 "${HF_BACKEND_URL}/health" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ Backend is running!${NC}"
else
    echo -e "  ${RED}⚠️  Backend is not responding${NC}"
    echo "  Make sure your backend is deployed to HuggingFace first."
    echo "  Run: ./deploy-to-huggingface.sh"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 2: Verify API configuration
echo -e "${YELLOW}Step 2: Verifying API configuration...${NC}"
if grep -q "ibrahimgem-humanoid-robotics-rag.hf.space" src/config/api.js; then
    echo "  ✅ API configuration is correct"
else
    echo "  ❌ API configuration needs to be updated"
    echo "  Please update src/config/api.js with your HuggingFace URL"
    exit 1
fi

# Step 3: Install dependencies
echo -e "${YELLOW}Step 3: Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "  Installing npm packages..."
    npm install
    echo "  ✅ Dependencies installed"
else
    echo "  ✅ Dependencies already installed"
fi

# Step 4: Build the site
echo -e "${YELLOW}Step 4: Building Docusaurus site...${NC}"
echo "  This may take a few minutes..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}✅ Build successful!${NC}"
else
    echo -e "  ${RED}❌ Build failed${NC}"
    exit 1
fi

# Step 5: Test build locally (optional)
echo -e "${YELLOW}Step 5: Testing build...${NC}"
if [ -d "build" ]; then
    echo "  ✅ Build directory exists"
    echo "  Build size: $(du -sh build | cut -f1)"
else
    echo "  ❌ Build directory not found"
    exit 1
fi

# Step 6: Deploy to GitHub Pages
echo -e "${YELLOW}Step 6: Deploying to GitHub Pages...${NC}"
echo ""
echo "  This will deploy to: ${GITHUB_PAGES_URL}"
echo ""
read -p "Ready to deploy? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

# Check if gh-pages branch exists
if git rev-parse --verify gh-pages > /dev/null 2>&1; then
    echo "  gh-pages branch exists"
else
    echo "  Creating gh-pages branch..."
    git checkout -b gh-pages
    git checkout main  # or your main branch
fi

# Deploy using npm script
npm run deploy

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Frontend deployed successfully!${NC}"
    echo ""
    echo "🎉 Your site will be available at:"
    echo "   ${GITHUB_PAGES_URL}"
    echo ""
    echo "⏳ GitHub Pages typically takes 1-2 minutes to update."
    echo ""
    echo "📝 Next steps:"
    echo "  1. Wait 1-2 minutes for deployment to complete"
    echo "  2. Visit: ${GITHUB_PAGES_URL}"
    echo "  3. Test the chatbot by asking: 'What is ROS 2?'"
    echo "  4. Check browser console for any errors"
    echo ""
    echo "🔧 If you encounter issues:"
    echo "  - Check GitHub Pages settings in your repository"
    echo "  - Ensure gh-pages branch is set as the source"
    echo "  - Verify CORS is enabled in backend (already done)"
    echo "  - Check browser console for API errors"
    echo ""
else
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "Check the error messages above"
    exit 1
fi
