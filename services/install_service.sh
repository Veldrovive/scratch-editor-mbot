#!/bin/bash
set -e  # Quit on error

if [ ! -f "/etc/systemd/system/mbot-scratch-gui.service" ]; then
  # This is the first time installing.
  sudo cp mbot-scratch-gui.service /etc/systemd/system/

  echo "Enabling MBot Scratch GUI service."
  # Reload the service.
  sudo systemctl daemon-reload
  sudo systemctl enable mbot-scratch-gui.service
  sudo systemctl start mbot-scratch-gui.service
else
  # This service has already been installed. Pull new changes then restart it.
  sudo cp mbot-scratch-gui.service /etc/systemd/system/
  # Fill in the path to this env.
  echo "MBot Scratch GUI service is already enabled. Restarting it."
  sudo systemctl daemon-reload
  sudo systemctl restart mbot-scratch-gui.service
fi

echo
echo "Done! The MBot Scratch GUI  is now available at http://localhost:8602 on this computer or http://[MBOT_IP]:8602 on the network."
