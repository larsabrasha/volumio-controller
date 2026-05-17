#!/usr/bin/env python3
"""RFID-to-MQTT bridge for Raspberry Pi + RC522."""

import logging
import signal
import sys
import time

import paho.mqtt.client as mqtt
import yaml
from mfrc522 import SimpleMFRC522

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
log = logging.getLogger("rfid-bridge")


def load_config(path):
    with open(path) as f:
        return yaml.safe_load(f)


def make_client(cfg):
    state_topic = cfg["topics"]["state"]
    client = mqtt.Client(client_id=cfg["mqtt"].get("client_id", "rfid-bridge"))

    if cfg["mqtt"].get("username"):
        client.username_pw_set(cfg["mqtt"]["username"], cfg["mqtt"].get("password"))

    client.will_set(state_topic, payload="offline", qos=1, retain=True)

    def on_connect(c, userdata, flags, rc):
        if rc == 0:
            log.info("MQTT connected to %s:%s", cfg["mqtt"]["host"], cfg["mqtt"].get("port", 1883))
            c.publish(state_topic, "online", qos=1, retain=True)
        else:
            log.error("MQTT connect failed rc=%s", rc)

    def on_disconnect(c, userdata, rc):
        if rc != 0:
            log.warning("MQTT disconnected unexpectedly rc=%s (auto-reconnecting)", rc)

    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.reconnect_delay_set(min_delay=1, max_delay=30)
    client.connect_async(cfg["mqtt"]["host"], cfg["mqtt"].get("port", 1883), keepalive=30)
    client.loop_start()
    return client


def main():
    config_path = sys.argv[1] if len(sys.argv) > 1 else "config.yaml"
    cfg = load_config(config_path)

    placed_topic = cfg["topics"]["placed"]
    removed_topic = cfg["topics"]["removed"]
    current_topic = cfg["topics"]["current"]
    state_topic = cfg["topics"]["state"]
    poll_interval = cfg["reader"].get("poll_interval", 0.1)
    removal_threshold = cfg["reader"].get("removal_threshold", 5)

    client = make_client(cfg)
    reader = SimpleMFRC522()

    current_uid = None
    miss_count = 0
    running = True

    def shutdown(signum, frame):
        nonlocal running
        log.info("Signal %s received, shutting down", signum)
        running = False

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    log.info("RFID bridge started, polling every %.2fs (removal threshold=%d)",
             poll_interval, removal_threshold)

    try:
        while running:
            uid = reader.read_id_no_block()
            if uid is not None:
                miss_count = 0
                uid_str = str(uid)
                if uid_str != current_uid:
                    if current_uid is not None:
                        log.info("Tag swapped: %s -> %s", current_uid, uid_str)
                        client.publish(removed_topic, current_uid, qos=1)
                    current_uid = uid_str
                    log.info("Tag placed: %s", uid_str)
                    client.publish(placed_topic, uid_str, qos=1)
                    client.publish(current_topic, uid_str, qos=1, retain=True)
                else:
                    log.debug("Tag still present: %s", uid_str)
            elif current_uid is not None:
                miss_count += 1
                log.debug("Empty read %d/%d (current=%s)", miss_count, removal_threshold, current_uid)
                if miss_count >= removal_threshold:
                    log.info("Tag removed: %s", current_uid)
                    client.publish(removed_topic, current_uid, qos=1)
                    client.publish(current_topic, "", qos=1, retain=True)
                    current_uid = None
                    miss_count = 0
            time.sleep(poll_interval)
    finally:
        log.info("Publishing offline state and disconnecting")
        client.publish(state_topic, "offline", qos=1, retain=True)
        time.sleep(0.3)
        client.loop_stop()
        client.disconnect()


if __name__ == "__main__":
    main()
