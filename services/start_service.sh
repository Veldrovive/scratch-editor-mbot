#!/bin/bash

# This script serves as the entrypoint for the systemd service. It safely loads NVM, 
# checks for the correct Node version, and then launches the server. Any echo statements here 
# will be captured by the systemd journal and visible when running 'systemctl status'.

echo "Starting MBot Scratch GUI service..."

# 1. Load NVM safely
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  echo "Sourcing NVM..."
  source "$HOME/.nvm/nvm.sh"
else
  echo "ERROR: NVM is not installed or nvm.sh cannot be found at $HOME/.nvm/nvm.sh"
  echo "Please install NVM for the 'mbot' user."
  exit 1
fi

# 2. Use Node 22
echo "Switching to Node 22..."
if ! nvm use 22; then
  echo "ERROR: Node version 22 is not installed."
  echo "Please run: nvm install 22"
  exit 1
fi

# 3. Check if 'serve' is installed globally
if ! command -v serve &> /dev/null; then
  echo "ERROR: 'serve' is not installed globally for this Node version."
  echo "Please run: npm install -g serve"
  exit 1
fi

# 4. Start the server
echo "Starting 'serve' on port 8602..."
exec serve -s /data/www/scratch/ -l 8602
