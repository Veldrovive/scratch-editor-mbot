#!/bin/bash
set -e

echo "Building the Scratch GUI..."
npm install
npm run --workspaces build

echo "Installing the Scratch GUI..."
if [ ! -d "/data/www/scratch" ]; then
  mkdir /data/www/scratch
else
  sudo rm -rf /data/www/scratch/*
fi
sudo cp -r packages/scratch-gui/build/* /data/www/scratch
