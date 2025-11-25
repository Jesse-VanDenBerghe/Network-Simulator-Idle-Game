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

echo "Upload this file to itch.io manually at:"
echo "   https://itch.io/game/edit/4067729"
