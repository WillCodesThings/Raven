"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentManager = void 0;
const Agent_1 = require("./Agent");
const agents = new Map();
let updateCallback = () => { };
exports.AgentManager = {
    getBotCount() {
        return agents.size;
    },
    /**
     * Creates a new agent with the given parameters
     *
     * @param {string} name - The name of the agent.
     * @param {string} configPath - The path to the config file.
     * @param {string} server - The server to connect to.
     * @param {number} port - The port to connect to.
     * @param {any[]} plugins - The plugins to use.
     * @param {Object} [options] - Optional parameters like email and password
     * @return {Agent|null} The created agent or null if it already exists
     */
    createAgent(name, configPath, server, port, plugins, options) {
        if (agents.has(name))
            return null;
        // Create login info object
        const loginInfo = {
            username: name,
            email: (options === null || options === void 0 ? void 0 : options.email) || "",
            password: (options === null || options === void 0 ? void 0 : options.password) || "",
        };
        let agent = null;
        if (agents.size >= 1) {
            // Create with delay if not the first agent
            setTimeout(() => {
                agent = new Agent_1.Agent(configPath, loginInfo, server, port, plugins);
                agents.set(name, agent);
                this.triggerUpdate();
            }, 6 * 1000); // 6 seconds delay
        }
        else {
            // Create immediately if first agent
            agent = new Agent_1.Agent(configPath, loginInfo, server, port, plugins);
            agents.set(name, agent);
            this.triggerUpdate();
        }
        return agent;
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
        // Call this to start the HUD system
        console.log("HUD initialized");
    },
};
