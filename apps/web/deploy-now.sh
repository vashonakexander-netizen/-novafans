#!/bin/bash
cd /Users/vash/novafans/apps/web

echo "🚀 Deploying to Vercel..."
echo ""

# Check if token is provided as env var
if [ -n "$VERCEL_TOKEN" ]; then
    echo "Using provided token..."
    npx vercel --token "$VERCEL_TOKEN" --prod --yes
elif npx vercel whoami &>/dev/null; then
    echo "Using saved credentials..."
    npx vercel --prod --yes
else
    echo "❌ Not authenticated!"
    echo ""
    echo "Please either:"
    echo "1. Run: npx vercel login"
    echo "2. Or set VERCEL_TOKEN environment variable"
    echo "   export VERCEL_TOKEN=your_token_here"
    echo "   ./deploy-now.sh"
    exit 1
fi
