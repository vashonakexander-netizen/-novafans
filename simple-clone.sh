#!/bin/bash

# Simple website cloning script
# Usage: ./simple-clone.sh <URL> [output-dir]

URL=$1
OUTPUT_DIR=${2:-"./cloned-site"}

if [ -z "$URL" ]; then
  echo "Usage: $0 <URL> [output-dir]"
  echo ""
  echo "Examples:"
  echo "  $0 https://example.com"
  echo "  $0 https://example.com ./my-clone"
  exit 1
fi

echo "🌐 Cloning website: $URL"
echo "📁 Output directory: $OUTPUT_DIR"
echo ""

# Check if wget is available
if command -v wget &> /dev/null; then
  echo "✅ Using wget..."
  wget --mirror \
       --convert-links \
       --adjust-extension \
       --page-requisites \
       --no-parent \
       --no-host-directories \
       --cut-dirs=0 \
       --directory-prefix="$OUTPUT_DIR" \
       "$URL"
  echo ""
  echo "✅ Clone complete! Files saved to: $OUTPUT_DIR"
elif command -v curl &> /dev/null; then
  echo "✅ Using curl (simple download)..."
  mkdir -p "$OUTPUT_DIR"
  curl -L -o "$OUTPUT_DIR/index.html" "$URL"
  echo ""
  echo "✅ HTML downloaded to: $OUTPUT_DIR/index.html"
  echo "⚠️  Note: This only downloads the main HTML. For full clone, install wget:"
  echo "   brew install wget  # macOS"
  echo "   sudo apt-get install wget  # Linux"
else
  echo "❌ Neither wget nor curl found. Please install one:"
  echo "   brew install wget  # macOS"
  echo "   sudo apt-get install wget  # Linux"
  exit 1
fi
