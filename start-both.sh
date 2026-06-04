#!/bin/bash

# Start both API and Web servers

echo "🚀 Starting Savage House Servers"
echo "═══════════════════════════════════════════════"
echo ""

# Kill any existing processes on these ports
echo "Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 2

# Start API server
echo "📡 Starting API server on port 3001..."
cd "$(dirname "$0")/apps/api"
PORT=3001 pnpm run dev > /tmp/api-server.log 2>&1 &
API_PID=$!
echo "   API server PID: $API_PID"
echo "   Logs: tail -f /tmp/api-server.log"

# Wait for API to start
echo ""
echo "⏳ Waiting for API server..."
for i in {1..20}; do
  if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ API server is ready!"
    break
  fi
  sleep 1
done

# Start Web server
echo ""
echo "🌐 Starting Web server on port 3000..."
cd "$(dirname "$0")/apps/web"
PORT=3000 pnpm dev > /tmp/web-server.log 2>&1 &
WEB_PID=$!
echo "   Web server PID: $WEB_PID"
echo "   Logs: tail -f /tmp/web-server.log"

echo ""
echo "✅ Both servers starting!"
echo ""
echo "📱 Access points:"
echo "   Web App: http://localhost:3000"
echo "   API: http://localhost:3001"
echo "   Scraper: http://localhost:3000/admin/scraper"
echo ""
echo "To stop servers:"
echo "   kill $API_PID $WEB_PID"
