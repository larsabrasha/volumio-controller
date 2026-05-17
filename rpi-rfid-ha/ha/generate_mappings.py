#!/usr/bin/env python3
"""Generate a self-contained HA automation YAML from the old music.json.

Produces a single rfid_automation.yaml that can be pasted straight into Home
Assistant's automation editor (YAML mode). All 101 UID → {service, uri}
mappings live inline under `variables:`, so there are no !include paths to
manage and the whole thing can be edited inside HA later.

Conversions performed:
- Hex UIDs from the old Arduino sketch (e.g. "70F7ADE9") become the decimal
  form (UID + BCC) that SimpleMFRC522 publishes on MQTT
  (e.g. "485191707075").
- MPD URIs are rewritten from "music-library/INTERNAL/music/Artist/Album" to
  "albums://Artist/Album" with each segment URL-encoded.
"""

from __future__ import annotations

import json
import operator
import sys
from functools import reduce
from pathlib import Path
from urllib.parse import quote

SOURCE = Path(__file__).resolve().parent.parent.parent / "volumio-controller" / "music.json"
TARGET = Path(__file__).resolve().parent / "rfid_automation.yaml"
LEGACY_PREFIX = "music-library/INTERNAL/music/"


def hex_uid_to_decimal(hex_uid: str) -> str:
    """70F7ADE9 -> '485191707075' (UID + BCC as decimal int).

    Mirrors SimpleMFRC522.uid_to_num applied to the 4-byte UID plus the
    bit-correction-check byte (XOR of the four UID bytes). MIFARE Classic
    cards have 4-byte UIDs — the Arduino sketch prints exactly those four
    bytes as uppercase hex, so input must be 8 hex chars.
    """
    if len(hex_uid) != 8:
        raise ValueError(f"expected 8 hex chars, got {hex_uid!r} ({len(hex_uid)} chars)")
    uid_bytes = bytes.fromhex(hex_uid)
    bcc = reduce(operator.xor, uid_bytes)
    return str(int(hex_uid + f"{bcc:02X}", 16))


# Artist folders that don't correspond to a real MPD album-artist tag.
# Volumio groups multi-artist albums under "Compilations/" on disk, but the
# albums:// URI scheme uses the metadata album-artist, which is normally
# "Various Artists" for those releases. Verified empirically by trying the
# Frozen soundtrack card.
ARTIST_FOLDER_OVERRIDES = {
    "Compilations": "Various Artists",
    # Volumio shows files without an artist tag under "Unknown Artist/".
    # MPD's album-artist is typically empty in that case, giving
    # albums:///Album. If empty doesn't work for these entries, try
    # "Various Artists" or fall back to literal "Unknown Artist".
    "Unknown Artist": "",
}


def transform_mpd_uri(legacy_uri: str) -> str:
    """music-library/INTERNAL/music/Artist/Album -> albums://Artist/Album.

    Two fix-ups before encoding:
    - `_ ` (underscore-space) becomes `: ` (colon-space). The on-disk
      filename substitutes colons with underscores, but Volumio's albums://
      scheme uses the original tag. Safe because no entry in music.json has
      a non-colon underscore.
    - Artist folders listed in ARTIST_FOLDER_OVERRIDES are rewritten to
      their real metadata album-artist (e.g. "Compilations" → "Various
      Artists").
    """
    if not legacy_uri.startswith(LEGACY_PREFIX):
        return legacy_uri
    remainder = legacy_uri[len(LEGACY_PREFIX):]
    remainder = remainder.replace("_ ", ": ")
    segments = remainder.split("/")
    if segments and segments[0] in ARTIST_FOLDER_OVERRIDES:
        segments[0] = ARTIST_FOLDER_OVERRIDES[segments[0]]
    encoded = "/".join(quote(seg, safe="") for seg in segments)
    return f"albums://{encoded}"


def yaml_quote(s: str) -> str:
    """Double-quote a YAML scalar, escaping backslashes and quotes."""
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


HEADER = """# Generated from volumio-controller/music.json by generate_mappings.py.
# Paste the whole block into Home Assistant via the UI:
#   Settings → Automations → Create automation → "⋮ Edit in YAML"
#   → replace the placeholder content with this file → Save.
# Re-run generate_mappings.py to refresh the inline mappings, but bear in
# mind that any edits made inside HA will be overwritten.

alias: "RFID: play album on tag placed"
description: "Look up the UID from rfid/tag/placed in the inline mappings and play it on Volumio."
trigger:
  - platform: mqtt
    topic: rfid/tag/placed
variables:
  target_player: media_player.volumio_2
  mappings:
"""

FOOTER = """  selected: "{{ mappings.get(trigger.payload) }}"
condition: "{{ selected is not none }}"
action:
  - service: media_player.play_media
    target:
      entity_id: "{{ target_player }}"
    data:
      media_content_id: >-
        {{ {'service': selected.service, 'uri': selected.uri} | tojson }}
      media_content_type: music
mode: single
"""


def main() -> int:
    data = json.loads(SOURCE.read_text())

    body: list[str] = []
    stats = {"mpd": 0, "webradio": 0, "missing_service": 0, "skipped": 0}
    seen_new_uids: dict[str, str] = {}

    for hex_uid, entry in data.items():
        try:
            new_uid = hex_uid_to_decimal(hex_uid)
        except ValueError as err:
            print(f"SKIP {hex_uid}: {err}", file=sys.stderr)
            stats["skipped"] += 1
            continue

        if new_uid in seen_new_uids:
            print(
                f"WARN duplicate UID {new_uid}: {seen_new_uids[new_uid]} and {hex_uid}",
                file=sys.stderr,
            )
        seen_new_uids[new_uid] = hex_uid

        service = entry.get("service")
        uri = entry["uri"]

        if service is None:
            stats["missing_service"] += 1
            service = "mpd"
            inferred = " (service inferred as mpd)"
        else:
            inferred = ""

        if service == "mpd":
            stats["mpd"] += 1
            final_uri = transform_mpd_uri(uri)
        elif service == "webradio":
            stats["webradio"] += 1
            final_uri = uri
        else:
            print(f"SKIP {hex_uid}: unknown service {service!r}", file=sys.stderr)
            stats["skipped"] += 1
            continue

        comment_tail = uri[len(LEGACY_PREFIX):] if uri.startswith(LEGACY_PREFIX) else uri
        # 4-space indent under variables.mappings; 6 for child fields.
        body.append(f"    # {hex_uid} — {comment_tail}{inferred}")
        body.append(f"    {yaml_quote(new_uid)}:")
        body.append(f"      service: {service}")
        body.append(f"      uri: {yaml_quote(final_uri)}")

    TARGET.write_text(HEADER + "\n".join(body) + "\n" + FOOTER)

    print(f"Wrote {TARGET}")
    print(
        f"  mpd: {stats['mpd']}, webradio: {stats['webradio']}, "
        f"missing-service-inferred: {stats['missing_service']}, skipped: {stats['skipped']}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
