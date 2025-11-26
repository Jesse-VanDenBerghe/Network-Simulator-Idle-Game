#!/bin/bash

# Build script for itch.io deployment
# Usage: ./build-itch.sh [upload]
# Add 'upload' argument to automatically push to itch.io using butler

echo "Building Network Simulator for itch.io..."

# Extract version from git tag
VERSION=$(git describe --tags --abbrev=0 2>/dev/null || echo "unknown")

# Remove old zips if they exist
rm -f network-simulator*.zip

# Create new zip with game files and version tag
ZIP_NAME="network-simulator-${VERSION}.zip"
zip -r "$ZIP_NAME" index.html styles.css js/ -x "*.DS_Store"

echo "✓ Build complete: $ZIP_NAME"

echo "Upload this file to itch.io manually at:"
echo "   https://itch.io/game/edit/4067729"
