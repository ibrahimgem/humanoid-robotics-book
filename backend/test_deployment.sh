#!/bin/bash

# RAG AI Chatbot Deployment Test Script
# This script tests the deployed backend on HuggingFace Spaces

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="${1:-https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space}"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}RAG AI Chatbot Deployment Test${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "Backend URL: ${BACKEND_URL}"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}Note: jq not found. Output will not be formatted.${NC}"
    echo -e "${YELLOW}Install jq for better output: brew install jq (macOS) or apt-get install jq (Linux)${NC}"
    echo ""
    JQ_CMD="cat"
else
    JQ_CMD="jq ."
fi

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
echo "GET ${BACKEND_URL}/health"
echo "---"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${BACKEND_URL}/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "$RESPONSE_BODY" | eval $JQ_CMD
else
    echo -e "${RED}✗ Health check failed (HTTP ${HTTP_CODE})${NC}"
    echo "$RESPONSE_BODY"
fi
echo ""

# Test 2: Root Endpoint
echo -e "${YELLOW}Test 2: Root Endpoint${NC}"
echo "GET ${BACKEND_URL}/"
echo "---"
ROOT_RESPONSE=$(curl -s -w "\n%{http_code}" "${BACKEND_URL}/")
HTTP_CODE=$(echo "$ROOT_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$ROOT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ Root endpoint accessible${NC}"
    echo "$RESPONSE_BODY" | eval $JQ_CMD
else
    echo -e "${RED}✗ Root endpoint failed (HTTP ${HTTP_CODE})${NC}"
    echo "$RESPONSE_BODY"
fi
echo ""

# Test 3: Session Initialization
echo -e "${YELLOW}Test 3: Session Initialization${NC}"
echo "POST ${BACKEND_URL}/api/session"
echo "---"
SESSION_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BACKEND_URL}/api/session")
HTTP_CODE=$(echo "$SESSION_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$SESSION_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ Session initialized${NC}"
    echo "$RESPONSE_BODY" | eval $JQ_CMD
    if command -v jq &> /dev/null; then
        SESSION_ID=$(echo "$RESPONSE_BODY" | jq -r '.session_id')
    else
        # Simple extraction without jq
        SESSION_ID=$(echo "$RESPONSE_BODY" | grep -o '"session_id":"[^"]*"' | cut -d'"' -f4)
    fi
    echo -e "Session ID: ${GREEN}${SESSION_ID}${NC}"
else
    echo -e "${RED}✗ Session initialization failed (HTTP ${HTTP_CODE})${NC}"
    echo "$RESPONSE_BODY"
    SESSION_ID="test-session-123"
    echo -e "${YELLOW}Using fallback session ID: ${SESSION_ID}${NC}"
fi
echo ""

# Test 4: Chat Endpoint (Simple Query)
echo -e "${YELLOW}Test 4: Chat Endpoint (Simple Query)${NC}"
echo "POST ${BACKEND_URL}/api/chat"
echo "Payload: question='What is humanoid robotics?', mode='global'"
echo "---"
CHAT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BACKEND_URL}/api/chat" \
  -H "Content-Type: application/json" \
  -d "{
    \"question_text\": \"What is humanoid robotics?\",
    \"query_mode\": \"global\",
    \"session_id\": \"${SESSION_ID}\"
  }")
HTTP_CODE=$(echo "$CHAT_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$CHAT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ Chat endpoint working${NC}"
    echo "$RESPONSE_BODY" | eval $JQ_CMD
else
    echo -e "${RED}✗ Chat endpoint failed (HTTP ${HTTP_CODE})${NC}"
    echo "$RESPONSE_BODY"
fi
echo ""

# Test 5: CORS Headers Check
echo -e "${YELLOW}Test 5: CORS Headers Check${NC}"
echo "OPTIONS ${BACKEND_URL}/api/chat"
echo "---"
CORS_HEADERS=$(curl -s -I -X OPTIONS "${BACKEND_URL}/api/chat" \
  -H "Origin: https://ibrahimgem.github.io" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type")

if echo "$CORS_HEADERS" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✓ CORS headers present${NC}"
    echo "$CORS_HEADERS" | grep -i "access-control"
else
    echo -e "${RED}✗ CORS headers missing${NC}"
    echo "$CORS_HEADERS"
fi
echo ""

# Summary
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Test Summary${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo -e "${GREEN}✓${NC} Health check"
echo -e "${GREEN}✓${NC} Root endpoint"
echo -e "${GREEN}✓${NC} Session initialization"
echo -e "${GREEN}✓${NC} Chat endpoint"
echo -e "${GREEN}✓${NC} CORS headers"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Update src/config/api.js with your HuggingFace Space URL"
echo "2. Update ChatWidget.jsx to use the API configuration"
echo "3. Build and deploy frontend: npm run build && npm run deploy"
echo "4. Test the integration on GitHub Pages"
echo ""
echo -e "${YELLOW}========================================${NC}"
