import http from "node:http";
import path from "node:path";
import { randomUUID } from "node:crypto";
import os from "node:os";
import { fileURLToPath } from "node:url";
import express from "express";
import { WebSocketServer } from "ws";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3847;
const MAX_HISTORY = 200;
const MAX_MESSAGE_CHARS = 100_000;

const app = express();
const publicDir = path.join(__dirname, "public");

function listLanIPv4() {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const list of Object.values(nets)) {
    for (const n of list || []) {
      if (n.family === "IPv4" && !n.internal) ips.push(n.address);
    }
  }
  return ips;
}

app.get("/api/lan-info", (_req, res) => {
  res.json({ addresses: listLanIPv4(), port: PORT });
});

app.use(express.static(publicDir));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

/** @type {{ id: string, name: string, color: string }[]} */
let history = [];

function broadcast(obj) {
  const raw = JSON.stringify(obj);
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(raw);
  }
}

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "history", messages: history }));

  ws.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(String(data));
    } catch {
      return;
    }
    if (msg.type !== "chat" || typeof msg.text !== "string") return;

    const text = msg.text.slice(0, MAX_MESSAGE_CHARS);
    if (!text) return;

    const entry = {
      id: randomUUID(),
      name: typeof msg.name === "string" ? msg.name.trim().slice(0, 32) || "Anonymous" : "Anonymous",
      text,
      ts: Date.now(),
      color: typeof msg.color === "string" ? msg.color.slice(0, 7) : "#6b7280",
    };

    history.push(entry);
    if (history.length > MAX_HISTORY) history = history.slice(-MAX_HISTORY);

    broadcast({ type: "message", message: entry });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  const ips = listLanIPv4();
  const [first, ...rest] = ips;
  if (first) {
    console.log(`ClipSync chat: http://${first}:${PORT}`);
    console.log(`  on this machine: http://localhost:${PORT}`);
    for (const ip of rest) console.log(`  also: http://${ip}:${PORT}`);
  } else {
    console.log(`ClipSync chat: http://localhost:${PORT}`);
  }
});
