#!/bin/bash

# Build script for itch.io deployment
# Usage: ./build-itch.sh [upload]
# Add 'upload' argument to automatically push to itch.io using butler

echo "Building Network Simulator for itch.io..."

# Remove old zip if it exists
rm -f network-simulator.zip

# Create new zip with game files
zip -r network-simulator.zip index.html styles.css js/ -x "*.DS_Store"

echo "✓ Build complete: network-simulator.zip"

# Upload to itch.io if 'upload' argument provided
if [ "$1" = "upload" ]; then
    if ! command -v butler &> /dev/null; then
        echo "❌ butler not found. Install it first:"
        echo "   https://itch.io/docs/butler/installing.html"
        exit 1
    fi
    
    # Replace with your itch.io username and project name
    ITCH_USER="jst4rr"
    ITCH_PROJECT="network-simulator"
    
    echo "Uploading to itch.io..."
    butler push network-simulator.zip "$ITCH_USER/$ITCH_PROJECT:html5"
    echo "✓ Upload complete!"
else
    echo "Upload this file to itch.io manually, or run: ./build-itch.sh upload"
fi
