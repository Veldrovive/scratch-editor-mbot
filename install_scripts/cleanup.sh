#!/bin/bash
set -e

# Change to the project root directory so this script can be run from anywhere
cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "Starting cleanup of build artifacts and dependencies to free memory..."

echo "Removing node_modules..."
rm -rf node_modules
rm -rf packages/*/node_modules

echo "Removing build directories..."
rm -rf packages/*/build
rm -rf packages/*/dist

echo "Cleaning npm cache..."
npm cache clean --force || true

echo "Cleanup complete. SD card memory freed."
