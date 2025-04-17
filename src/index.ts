import { pathfinder } from "mineflayer-pathfinder";
import { plugin } from "mineflayer-pvp";
import { AgentManager } from "./utils/AgentManager";
import { AIModel } from "./utils/AIModel";


let model = new AIModel("ollama-7b-v2", {
  systemPrompt:
    "You are playing minecraft, you are given commands that will be given everytime a message is sent, you can also use the !help(commandName) to get more information about a command, and you can use !stop to stop the bot, and any inputs are treated as strings or arrays, and any numbers will be treated as numbers",
  server: "10.65.64.238",
  port: 5001,
  name: "ollama-7b-v2",
  route: "/api/gen/mc",
  method: "POST",
});

AgentManager.createAgent(
  "Lily",
  "./data/Lily_config.json",
  "localhost",
  25565,
  [pathfinder, plugin],
  {},
  model
);

// Agent Manager will auto stagger
// AgentManager.createAgent(
//   "Andy",
//   "./data/Lily_config.json",
//   "localhost",
//   25565,
//   [pathfinder, plugin]
// );

import express from "express";
import { Request, Response } from "express"; 
import path from "path";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = 8080;

app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "..", "public")));

// API route (optional fallback)
app.get("/api/agents", (req: any, res: { json: (arg0: any) => void; }) => {
  const agents = AgentManager.getAllAgents().map((a: { getBotInfo: () => any; getCurrentTask: () => any; }) => ({
    ...a.getBotInfo(),
    currentTask: a.getCurrentTask(),
  }));
  res.json(agents);
});

app.post("/api/getAIInfrence", (req: Request, res: Response) => {
  const {id} = req.body;

  console.log(req);
  console.log(req.body);
  console.log(req.query);

  if (!id) {
    return res.status(400).send("No id provided");
  }

  const agent = AgentManager.getAgent(id);
  if (!agent) {
    return res.status(404).send("Agent not found");
  }

  return res.json(agent.getBotInfo());
});


// Broadcast helper
function broadcastToClients(data: any) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client: { readyState: number; send: (arg0: string) => void; }) => {
    if (client.readyState === 1) client.send(message);
  });
}

// Listen for updates from agents

// WebSocket connection handler
wss.on("connection", (ws: WebSocket) => {
  console.log("WebSocket client connected");

  setInterval(() => {
    broadcastToClients({
      type: "update",
      agents: AgentManager.getAllAgents().map((a) => ({
        ...a.getBotInfo(),
        currentTask: a.getLastCommandName(),
      })),
    });
  }, 300);

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });

  ws.on("message", (message) => {
    console.log("Received message:", message.toString());
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
