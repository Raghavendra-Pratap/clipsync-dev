# ClipSync — local LAN chat

Minimal chat for devices on the **same Wi‑Fi / LAN**. Open the page in a browser on Windows, Mac, or Android—no app store build required for v1.

## Run (on one machine that stays reachable)

```bash
cd ClipSync
npm install
npm start
```

Default port: **3847** (override with `PORT=3000 npm start`).

The terminal prints URLs such as `http://192.168.x.x:3847`. On other devices, open that URL (not `localhost`).

## Text and code

- The composer is a **multiline** field: **Enter** inserts a newline; **Ctrl+Enter** or **⌘+Enter** sends (or use **Send**).
- Messages keep **spaces, tabs, and line breaks**. Wrap snippets in markdown-style **triple backticks** to show a monospace block:

  ````text
  ```ts
  const x = 1
  ```
  ````

## Evolving toward clipboard sync

- Reuse the same **WebSocket server** and add message types (e.g. `clip_push`, `clip_request`) instead of only `chat`.
- Add a **shared secret** or pairing flow before accepting clipboard payloads.
- Consider **SQLite** on the server for optional history and audit.

## Security note

This binds to all interfaces (`0.0.0.0`) so your LAN can connect. Do not expose the port to the public internet without TLS and authentication.
