"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mineflayer_pathfinder_1 = require("mineflayer-pathfinder");
const mineflayer_pvp_1 = require("mineflayer-pvp");
const AgentManager_1 = require("./utils/AgentManager");
const AIModel_1 = require("./utils/AIModel");
let model = new AIModel_1.AIModel("ollama-7b-v2", {
    systemPrompt: "You are playing minecraft, you are given commands that will be given everytime a message is sent, you can also use the !help(commandName) to get more information about a command, and you can use !stop to stop the bot, and any inputs are treated as strings or arrays, and any numbers will be treated as numbers",
    server: "10.65.64.238",
    port: 5001,
    name: "ollama-7b-v2",
    route: "/api/gen/mc",
    method: "POST",
});
AgentManager_1.AgentManager.createAgent("Lily", "./data/Lily_config.json", "localhost", 25565, [mineflayer_pathfinder_1.pathfinder, mineflayer_pvp_1.plugin], {}, model);
// Agent Manager will auto stagger
// AgentManager.createAgent(
//   "Andy",
//   "./data/Lily_config.json",
//   "localhost",
//   25565,
//   [pathfinder, plugin]
// );
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
const PORT = 8080;
app.use(express_1.default.json());
// Serve frontend files
app.use(express_1.default.static(path_1.default.join(__dirname, "..", "public")));
// API route (optional fallback)
app.get("/api/agents", (req, res) => {
    const agents = AgentManager_1.AgentManager.getAllAgents().map((a) => (Object.assign(Object.assign({}, a.getBotInfo()), { currentTask: a.getCurrentTask() })));
    res.json(agents);
});
app.post("/api/getAIInfrence", (req, res) => {
    const { id } = req.body;
    console.log(req);
    console.log(req.body);
    console.log(req.query);
    if (!id) {
        return res.status(400).send("No id provided");
    }
    const agent = AgentManager_1.AgentManager.getAgent(id);
    if (!agent) {
        return res.status(404).send("Agent not found");
    }
    return res.json(agent.getBotInfo());
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
    setInterval(() => {
        broadcastToClients({
            type: "update",
            agents: AgentManager_1.AgentManager.getAllAgents().map((a) => (Object.assign(Object.assign({}, a.getBotInfo()), { currentTask: a.getLastCommandName() }))),
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
