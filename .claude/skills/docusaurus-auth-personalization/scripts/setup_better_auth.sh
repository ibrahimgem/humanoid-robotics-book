#!/bin/bash
# Setup Better Auth for Docusaurus site

set -e

echo "🔐 Setting up Better Auth for Docusaurus..."

# Install Better Auth and dependencies
echo "📦 Installing dependencies..."
npm install better-auth@latest
npm install @better-auth/react
npm install pg  # PostgreSQL client
npm install drizzle-orm drizzle-kit  # For database migrations

# Install OAuth providers
npm install @auth/core

# Install UI dependencies
npm install @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-select
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

echo "✅ Dependencies installed successfully"
echo ""
echo "Next steps:"
echo "1. Configure your database connection in .env"
echo "2. Set up OAuth credentials (GitHub, Google) in .env"
echo "3. Run database migrations"
echo "4. Implement auth components in your Docusaurus site"
