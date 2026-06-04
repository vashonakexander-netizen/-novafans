#!/bin/bash

# Start the API server for Savage House

echo "🚀 Starting API Server..."
echo ""

cd "$(dirname "$0")/apps/api"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  pnpm install
fi

echo "✅ Starting NestJS server..."
echo "   The scraper worker will start automatically"
echo ""
echo "📋 API will be available at: http://localhost:3001"
echo "📋 Scraper endpoint: http://localhost:3001/creator/scraper/scrape"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

pnpm run dev
