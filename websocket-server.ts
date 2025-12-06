import { WebSocketServer } from "ws";
import { createServer } from "http";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { appRouter } from "./server/routers/_app";
import { createWSContext } from "./server/trpc";
import { eventEmitter } from "./server/event-emitter";

const WS_PORT = 3001;
const HTTP_PORT = 3002; // HTTP port for internal notifications

// Create WebSocket server
const wss = new WebSocketServer({ port: WS_PORT });

const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext: createWSContext,
  // Enable heartbeat messages to keep connection open (disabled by default)
  keepAlive: {
    enabled: true,
    // server ping message interval in milliseconds
    pingMs: 30000,
    // connection is terminated if pong message is not received in this many milliseconds
    pongWaitMs: 5000,
  },
});

wss.on("connection", (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`);

  ws.once("close", () => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});

// Create HTTP server for internal notifications from Next.js
const httpServer = createServer((req, res) => {
  // CORS headers for local development
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/emit") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const { event, data } = JSON.parse(body);
        eventEmitter.emit(event, data);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

httpServer.listen(HTTP_PORT, () => {
  console.log(`✅ WebSocket Server listening on ws://localhost:${WS_PORT}`);
  console.log(
    `✅ HTTP Notification Server listening on http://localhost:${HTTP_PORT}`
  );
});

process.on("SIGTERM", () => {
  console.log("SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
  httpServer.close();
});
