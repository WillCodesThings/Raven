"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mineflayer_pathfinder_1 = require("mineflayer-pathfinder");
const mineflayer_pvp_1 = require("mineflayer-pvp");
const agentManager_1 = require("./utils/agentManager");
agentManager_1.AgentManager.createAgent("Lily", "./data/Lily_config.json", "localhost", 25565, [mineflayer_pathfinder_1.pathfinder, mineflayer_pvp_1.plugin]);
// Agent Manager will auto stagger
agentManager_1.AgentManager.createAgent("Andy", "./data/Lily_config.json", "localhost", 25565, [mineflayer_pathfinder_1.pathfinder, mineflayer_pvp_1.plugin]);
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const app = express_1.default();
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
const PORT = 8080;
// Serve frontend files
app.use(express_1.default.static(path_1.default.join(__dirname, "..", "public")));
// API route (optional fallback)
app.get("/api/agents", (req, res) => {
    const agents = agentManager_1.AgentManager.getAllAgents().map((a) => (Object.assign(Object.assign({}, a.getBotInfo()), { currentTask: a.getCurrentTask() })));
    res.json(agents);
});
// Broadcast helper
function broadcastToClients(data) {
    const message = JSON.stringify(data);
    wss.clients.forEach((client) => {
        if (client.readyState === 1)
            client.send(message);
    });
}
// Listen for updates from agents
// WebSocket connection handler
wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    setInterval(() => broadcastToClients({
        type: "update",
        agents: agentManager_1.AgentManager.getAllAgents().map((a) => (Object.assign(Object.assign({}, a.getBotInfo()), { currentTask: a.getLastCommandName() }))),
    }), 300);
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
