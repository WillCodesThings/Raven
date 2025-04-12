"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentManager = void 0;
const Agent_1 = require("./utils/Agent");
const agents = new Map();
exports.AgentManager = {
    getBotCount() {
        return agents.size;
    },
    /**
     *
     *
     * @param {string} name - The name of the agent.
     * @param {string} configPath - The path to the config file.
     * @param {string} server - The server to connect to.
     * @param {number} port - The port to connect to.
     * @param {any[]} plugins - The plugins to use.
     * @return {*}
     */
    createAgent(name, configPath, server, port, plugins) {
        if (agents.has(name))
            return null;
        const agent = new Agent_1.Agent(configPath, name, server, port, plugins, this.getBotCount() + 1);
        agents.set(name, agent);
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
    },
};
