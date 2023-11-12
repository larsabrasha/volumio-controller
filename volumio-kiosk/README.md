# Volumio kiosk

## Develop

1. Download Tailwind CSS

    ```bash
    curl -sLO https://github.com/tailwindlabs/tailwindcss/releases/download/v3.3.5/tailwindcss-macos-arm64
    chmod +x tailwindcss-macos-arm64
    mv tailwindcss-macos-arm64 tailwindcss
    ```

2. Start tailwind

    ```bash
    ./tailwindcss -i input.css -o output.css --watch
    ```

3. Start http-server

    ```bash
    http-server .
    ```

## Deploy

1. Install http-server

   ```bash
   sudo npm install --global http-server
   ```

2. Minify css

   ```bash
   ./tailwindcss -i input.css -o output.css --minify
   ```

3. Register volumio-kiosk as a service and start it

   ```bash
   sudo cp /data/INTERNAL/programs/volumio-kiosk-service/volumio-kiosk.service /lib/systemd/system
   sudo chown root:root /lib/systemd/system/volumio-kiosk.service

   sudo systemctl enable volumio-kiosk.service
   sudo systemctl start volumio-kiosk.service
   ```

4. Enable volumio-kiosk when RFID-reader via USB is connected

   ```bash
   sudo cp /data/INTERNAL/programs/volumio-kiosk-service/100-volumio-kiosk.rules /etc/udev/rules.d
   sudo chown root:root /etc/udev/rules.d/100-volumio-kiosk.rules
   ```

5. Watch log

   ```bash
   sudo journalctl -f -u volumio-kiosk.service
   ```
