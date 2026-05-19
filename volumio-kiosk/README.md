# Volumio kiosk

A static web UI that shows what Volumio is playing and offers basic playback
controls. The browser connects to Volumio's Socket.io endpoint on port 3000,
so the kiosk follows whichever host the page was loaded from
(`window.location.hostname`) — no hardcoded IP.

## Develop

1. Download Tailwind CSS (one-time; example is macOS arm64)

    ```bash
    curl -sLO https://github.com/tailwindlabs/tailwindcss/releases/download/v3.3.5/tailwindcss-macos-arm64
    chmod +x tailwindcss-macos-arm64
    mv tailwindcss-macos-arm64 tailwindcss
    ```

2. Watch and recompile Tailwind

    ```bash
    ./tailwindcss -i input.css -o output.css --watch
    ```

3. Serve the files locally with any static server. Python 3 ships with one:

    ```bash
    python3 -m http.server 8080
    ```

   Open `http://localhost:8080/` — the page will try to reach a Volumio
   instance at `http://localhost:3000`. For real development point your
   browser at the Volumio Pi instead (`http://<pi-host>:8080/` after deploy).

## Deploy (on the Volumio Pi)

The kiosk runs as a systemd service on the same Pi as Volumio and serves the
static files with Python 3's built-in HTTP server — no npm dependency.

1. Build minified CSS

   ```bash
   ./tailwindcss -i input.css -o output.css --minify
   ```

2. Sync the kiosk and service files to the Pi

   ```bash
   rsync -av --delete \
     --exclude tailwindcss --exclude node_modules --exclude .git \
     ./ volumio@<pi-host>:/data/INTERNAL/programs/volumio-kiosk/

   rsync -av \
     ../volumio-kiosk-service/ \
     volumio@<pi-host>:/data/INTERNAL/programs/volumio-kiosk-service/
   ```

3. Register the systemd service and enable it at boot

   ```bash
   sudo cp /data/INTERNAL/programs/volumio-kiosk-service/volumio-kiosk.service /lib/systemd/system/
   sudo chown root:root /lib/systemd/system/volumio-kiosk.service

   sudo systemctl daemon-reload
   sudo systemctl enable --now volumio-kiosk.service
   ```

4. (Optional) Install the udev rule so the service is also started when a
   USB RFID reader enumerated as `ttyACM0` is plugged in

   ```bash
   sudo cp /data/INTERNAL/programs/volumio-kiosk-service/101-volumio-kiosk.rules /etc/udev/rules.d/
   sudo chown root:root /etc/udev/rules.d/101-volumio-kiosk.rules
   ```

5. Open the kiosk in a browser on any device on the LAN

   ```text
   http://<pi-host>:8080/
   ```

## Logs

```bash
sudo journalctl -f -u volumio-kiosk.service
```
