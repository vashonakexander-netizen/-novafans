#!/bin/bash

echo "🚀 Pushing to GitHub..."
echo ""

# Check if token is provided as argument
if [ -n "$1" ]; then
    TOKEN=$1
    echo "Using provided token..."
    git push https://${TOKEN}@github.com/vashonakexander-netizen/-novafans.git main
else
    echo "Please provide your GitHub Personal Access Token:"
    echo "1. Get token from: https://github.com/settings/tokens"
    echo "2. Run: ./push-to-github.sh YOUR_TOKEN"
    echo ""
    echo "Or push manually:"
    echo "  git push origin main"
    echo "  (Username: vashonakexander-netizen)"
    echo "  (Password: your token)"
fi

