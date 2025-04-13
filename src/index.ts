import { pathfinder } from "mineflayer-pathfinder";
import { plugin } from "mineflayer-pvp";
import { AgentManager } from "./utils/agentManager";

AgentManager.createAgent(
  "Lily",
  "./data/Lily_config.json",
  "localhost",
  25565,
  [pathfinder, plugin]
);

// Agent Manager will auto stagger
AgentManager.createAgent(
  "Andy",
  "./data/Lily_config.json",
  "localhost",
  25565,
  [pathfinder, plugin]
);

import express from "express";
import path from "path";
import http from "http";
import { WebSocketServer } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = 8080;

// Serve frontend files
app.use(express.static(path.join(__dirname, "..", "public")));

// API route (optional fallback)
app.get("/api/agents", (req, res) => {
  const agents = AgentManager.getAllAgents().map((a) => ({
    ...a.getBotInfo(),
    currentTask: a.getCurrentTask(),
  }));
  res.json(agents);
});

// Broadcast helper
function broadcastToClients(data: any) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(message);
  });
}

// Listen for updates from agents

// WebSocket connection handler
wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  setInterval(
    () =>
      broadcastToClients({
        type: "update",
        agents: AgentManager.getAllAgents().map((a) => ({
          ...a.getBotInfo(),
          currentTask: a.getLastCommandName(),
        })),
      }),
    300
  );

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });

  // Optionally, handle any messages from the client here
  ws.on("message", (message) => {
    console.log("Received message:", message);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
