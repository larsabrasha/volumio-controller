# Home Assistant: RFID → Volumio

A single self-contained HA automation. It is triggered by the MQTT topic
`rfid/tag/placed` (published by `rfid_bridge.py` on the Raspberry Pi), looks
up the UID in an inline mapping table, and tells Volumio to play the
corresponding album or web-radio stream.

Everything lives in one YAML block — no `!include`, no extra files in the
HA config directory. After pasting it once, edit further in the HA UI.

## Files

- `rfid_automation.yaml` — the automation, with all 101 UID → `{service, uri}`
  mappings inline. Paste this whole block into HA.
- `generate_mappings.py` — one-shot generator. Re-run after editing
  `music.json` (overwrites the YAML file; any edits made inside HA after the
  paste will be lost on re-run, so prefer editing in HA once it is in place).

## Installation

1. Open the file `rfid_automation.yaml` and copy its contents.
2. In HA: Settings → Automations & scenes → Create automation → ⋮ menu →
   Edit in YAML → paste, replacing the placeholder, save.
3. Disable the existing "Man of the Woods" automation in the HA UI —
   otherwise both fire for that card and Volumio gets duplicate play calls.

The automation expects the Volumio media player entity to be
`media_player.volumio_2`. If yours differs, change the value of
`target_player` near the top of the automation.

## Verification — 5 sample cards before full rollout

- **`70F7ADE9` → `485191707075`** — Justin Timberlake / Man of the Woods.
  Sanity: already-working card, proves the minimal `media_content_id` form
  is enough.
- **`14728453` → `87820620721`** — Steven Curtis Chapman / Signs of Life.
  Confirms "numeric-looking" hex UIDs convert correctly.
- **`27B34F51` → `170512044426`** — Nigel Kennedy & The Kroke Band / East
  Meets East. Standard hex UID.
- **`57D42E3E` → `377221955219`** — Henry Jackman / Uncharted 4_ A Thief's
  End. Album with `_` in the name — proves URI encoding for special
  characters.
- **`44F517DF` → `296169758585`** — SR P1 (web radio). Verifies the
  web-radio format.

For each card:

1. Place the card on the reader.
2. Confirm the HA log shows the automation triggered (Settings → System →
   Logs, filter by "RFID").
3. Confirm Volumio starts playing the right content.

**Watch MQTT in real time:** Settings → Devices & Services → MQTT →
Configure → "Listen to a topic" → enter `rfid/#`.

## Troubleshooting

- **No MQTT event when tagging** — Hardware or RFID bridge issue. Check
  `journalctl -u rfid-bridge -f` on the Pi.
- **MQTT event published but UID doesn't match any inline entry** — Card is
  likely a 7-byte UID (NTAG203/213/215/216) or simply a new card. Add it
  manually in the HA UI, or extend `generate_mappings.py` to handle 7-byte
  UIDs.
- **Automation doesn't fire** — YAML syntax error. Run Developer Tools →
  Check Configuration.
- **Automation fires but Volumio does nothing** — The minimal
  `media_content_id` form isn't accepted by the integration. Extend the
  template with `title` + `artist` fields (derivable from the URI).
- **Volumio tries but can't find the album** — URI transformation doesn't
  match the real MPD album (`_` vs `:` etc.). Fix that album's URI in the
  HA UI.

## Adding new cards

Once the automation is pasted into HA, add new cards directly in the HA UI:

1. Place the card on the reader and note the UID published on
   `rfid/tag/placed` (a decimal string).
2. Edit the automation in HA → YAML mode → add an entry under `mappings`:

   ```yaml
   "<new-uid>":
     service: mpd
     uri: "albums://<artist-url>/<album-url>"
   ```

3. Save. HA reloads the automation automatically.

Editing in HA is the source of truth from this point on. Only re-run
`generate_mappings.py` if you want to start over from `music.json`.

## Out of scope

The following are migrated in a separate pass:

- The control cards (playpause / next / previous / startRegisterMusic) from
  `controls.json`.
- `rfid/tag/removed` handling (pause on removal; stop for web radio).
