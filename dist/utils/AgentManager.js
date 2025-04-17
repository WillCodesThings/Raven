"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentManager = void 0;
const Agent_1 = require("./Agent");
const agents = new Map();
let updateCallback = () => { };
let pendingAgentCount = 0; // <-- Tracks agents waiting to be created
exports.AgentManager = {
    getBotCount() {
        return agents.size;
    },
    createAgent(name, configPath, server, port, plugins, options, model) {
        if (agents.has(name))
            return null;
        if (!model)
            throw new Error("Model not provided");
        const loginInfo = {
            username: name,
            email: (options === null || options === void 0 ? void 0 : options.email) || "",
            password: (options === null || options === void 0 ? void 0 : options.password) || "",
        };
        const create = () => {
            const agent = new Agent_1.Agent(configPath, loginInfo, server, port, plugins, model);
            agents.set(name, agent);
            this.triggerUpdate();
            pendingAgentCount = Math.max(0, pendingAgentCount - 1); // Reduce pending count
            return agent;
        };
        if (agents.size + pendingAgentCount >= 1) {
            const delayMs = 6000 * (pendingAgentCount + 1); // Delay per pending position
            console.log(`Agent "${name}" scheduled to join in ${delayMs}ms`);
            pendingAgentCount++;
            setTimeout(() => {
                create();
            }, delayMs);
            return null; // Not created yet
        }
        else {
            return create(); // Create immediately
        }
    },
    getAgentById(id) {
        return Array.from(agents.values()).find((a) => a.getBot().entity.id === id);
    },
    getAgent(name) {
        return agents.get(name);
    },
    deleteAgent(name) {
        const agent = agents.get(name);
        if (agent) {
            agent.getBot().quit();
            agents.delete(name);
            this.triggerUpdate();
        }
    },
    listAgents() {
        return Array.from(agents.values()).map((a) => a.getBotInfo());
    },
    getAllAgents() {
        return Array.from(agents.values());
    },
    clearAgents() {
        agents.clear();
        this.triggerUpdate();
    },
    setUpdateCallback(callback) {
        updateCallback = callback;
    },
    triggerUpdate() {
        if (updateCallback)
            updateCallback();
    },
    makeHud() {
        console.log("HUD initialized");
    },
};
