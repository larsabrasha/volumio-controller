#!/bin/bash
# Install / update the RFID-MQTT bridge as a systemd service.
# Run from inside the rpi-rfid-ha directory on the Raspberry Pi.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

CURRENT_USER="$(id -un)"

if [ ! -f config.yaml ]; then
  echo "ERROR: config.yaml is missing."
  echo "  cp config.example.yaml config.yaml"
  echo "  edit it with your MQTT broker details, then re-run this script."
  exit 1
fi

# Protect the MQTT password from other local users.
chmod 600 config.yaml

# Cache sudo credentials up front so the script doesn't pause for a prompt later.
sudo -v

# 1. Verify SPI is actually enabled (device node is the reliable check, not lsmod).
if [ ! -e /dev/spidev0.0 ]; then
  echo "ERROR: /dev/spidev0.0 not found — SPI is not enabled."
  echo "  Run 'sudo raspi-config' -> Interface Options -> SPI -> Enable, then reboot."
  exit 1
fi

# 2. Install system packages that pip / mfrc522 will need.
echo "Installing system packages (python3-venv, python3-dev for RPi.GPIO build)..."
sudo apt-get update -qq
sudo apt-get install -y --no-install-recommends \
  python3-venv python3-pip python3-dev

# 3. Ensure the user has SPI + GPIO access. systemd will pick up the new groups
#    when it spawns the service, even though the current shell won't until re-login.
for grp in spi gpio; do
  if ! id -nG "$CURRENT_USER" | grep -qw "$grp"; then
    echo "Adding $CURRENT_USER to '$grp' group..."
    sudo usermod -aG "$grp" "$CURRENT_USER"
  fi
done

# 4. Create venv and install Python deps.
if [ ! -d .venv ]; then
  echo "Creating virtualenv..."
  python3 -m venv .venv
fi
echo "Installing Python dependencies (RPi.GPIO compiles from source — can take a few minutes on Pi Zero)..."
.venv/bin/pip install -r requirements.txt

# 5. Write the systemd unit with the correct paths and user.
SERVICE_PATH=/etc/systemd/system/rfid-bridge.service
echo "Writing systemd unit to $SERVICE_PATH..."

sudo tee "$SERVICE_PATH" >/dev/null <<EOF
[Unit]
Description=RFID to MQTT bridge
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$SCRIPT_DIR
ExecStart=$SCRIPT_DIR/.venv/bin/python $SCRIPT_DIR/rfid_bridge.py $SCRIPT_DIR/config.yaml
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable rfid-bridge.service
sudo systemctl restart rfid-bridge.service

echo
echo "Done. Service status:"
sudo systemctl --no-pager status rfid-bridge.service || true
echo
echo "Follow logs with:  journalctl -u rfid-bridge -f"
