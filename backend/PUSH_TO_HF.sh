#!/bin/bash
# Quick Push to HuggingFace Spaces
# Run this after creating your Space at huggingface.co

echo "🚀 Pushing to HuggingFace Spaces..."
echo ""
echo "You will be prompted for credentials:"
echo "  Username: ibrahimgem"
echo "  Password: <your-huggingface-access-token>"
echo ""
echo "Get your token at: https://huggingface.co/settings/tokens"
echo ""
read -p "Press Enter to continue..."

git push huggingface main --force
