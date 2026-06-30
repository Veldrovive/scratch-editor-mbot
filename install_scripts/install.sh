#!/bin/bash
set -e

# Change to the project root directory so this script can be run from anywhere
cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Load NVM and use Node 22 to match start_service.sh, so 'serve' is installed in the right environment
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  echo "Sourcing NVM and setting Node version to 22..."
  source "$HOME/.nvm/nvm.sh"
  nvm install 22
  nvm use 22
else
  echo "WARNING: NVM is not installed. Using system Node."
fi

# Install 'serve' globally during the build step. This ensures 'serve' is available offline when the robot boots up, avoiding network requests via 'npx -y' inside the service.
echo "Installing 'serve' globally for offline use..."
npm install -g serve

echo "Building the Scratch GUI..."
npm install
npm run --workspaces build

echo "Installing the Scratch GUI..."
if [ ! -d "/data/www/scratch" ]; then
  sudo mkdir -p /data/www/scratch
else
  sudo rm -rf /data/www/scratch/*
fi
sudo cp -r packages/scratch-gui/build/* /data/www/scratch

# Ensure the mbot user owns the web files. By default, sudo commands make files owned by root. The systemd service runs as 'mbot', so 'mbot' should own these files to prevent permission issues.
sudo chown -R mbot:mbot /data/www/scratch
