# rpi-rfid-ha

Liten Python-tjänst som körs på en Raspberry Pi Zero WH, läser RFID-kort via en
RC522-modul (SPI) och publicerar `tag_placed` / `tag_removed`-events till MQTT.
Home Assistant prenumererar och styr musikuppspelning (Volumio/Sonos/Spotify) —
"Phoniebox"-stil: spela när kort läggs på, pausa när det tas bort.

## Hårdvarukoppling: RC522 → Pi Zero WH

| RC522 | Pi BCM | Pi fysisk pin |
|-------|--------|---------------|
| SDA   | GPIO 8 (CE0) | 24 |
| SCK   | GPIO 11      | 23 |
| MOSI  | GPIO 10      | 19 |
| MISO  | GPIO 9       | 21 |
| IRQ   | —            | — (ej använd) |
| GND   | —            | 6  |
| RST   | GPIO 25      | 22 |
| 3.3V  | —            | 1  |

**OBS:** RC522 drivs på 3.3 V — koppla inte 5 V.

## Setup på Home Assistant

1. **Settings → Add-ons → Add-on Store → Mosquitto broker → Install + Start.**
2. **Settings → People → Users → Add user** (t.ex. `rfid` med ett lösenord).
   Mosquitto-addonen tillåter inloggning för alla HA-användare som standard.
3. **Settings → Devices & Services → Add Integration → MQTT** — peka på
   `core-mosquitto`, port `1883`, med användaren från steg 2.

## Setup på Pi:n

1. Aktivera SPI: `sudo raspi-config` → Interface Options → SPI → Enable → Reboot.
2. Klona repot på Pi:n och `cd` in i `rpi-rfid-ha/`.
3. Kopiera konfigmallen och fyll i MQTT-uppgifterna:
   ```bash
   cp config.example.yaml config.yaml
   nano config.yaml
   ```
4. Kör installern:
   ```bash
   ./install.sh
   ```

Klar. Tjänsten startar automatiskt vid uppstart. Följ loggen med:
```bash
journalctl -u rfid-bridge -f
```

## MQTT-topics

| Topic | Payload | Retained |
|-------|---------|----------|
| `rfid/state` | `online` / `offline` (LWT) | ja |
| `rfid/tag/placed` | tag-UID | nej |
| `rfid/tag/removed` | tag-UID | nej |
| `rfid/tag/current` | tag-UID (eller tom sträng) | ja |

## Exempel: Home Assistant-automation

I `configuration.yaml` (eller via UI under Settings → Automations):

```yaml
automation:
  - alias: "RFID: spela skivan när kort X läggs på"
    trigger:
      - platform: mqtt
        topic: rfid/tag/placed
        payload: "123456789"   # ditt tag-UID
    action:
      - service: media_player.play_media
        target:
          entity_id: media_player.volumio
        data:
          media_content_id: "spotify:album:abc123"
          media_content_type: music

  - alias: "RFID: pausa när kort tas bort"
    trigger:
      - platform: mqtt
        topic: rfid/tag/removed
    action:
      - service: media_player.media_pause
        target:
          entity_id: media_player.volumio
```

## Felsökning

**Verifiera att RC522 läser kort (utan MQTT):**
```bash
.venv/bin/python -c "from mfrc522 import SimpleMFRC522; print(SimpleMFRC522().read())"
```

**Verifiera att events kommer fram till brokern** (från valfri maskin):
```bash
mosquitto_sub -h <ha-ip> -u <user> -P <pass> -t 'rfid/#' -v
```

**Service-status:**
```bash
sudo systemctl status rfid-bridge
journalctl -u rfid-bridge -n 100 --no-pager
```

## Filer

- `rfid_bridge.py` — huvudtjänsten
- `config.example.yaml` — konfigmall (kopiera till `config.yaml`)
- `requirements.txt` — Python-beroenden
- `install.sh` — sätter upp venv och systemd-service
