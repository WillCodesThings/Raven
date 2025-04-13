import { Agent } from "./Agent";

const agents = new Map<string, Agent>();
let updateCallback: () => void = () => {};

export const AgentManager = {
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
  createAgent(
    name: string,
    configPath: string,
    server: string,
    port: number,
    plugins: any[]
  ) {
    if (agents.has(name)) return null;

    let agent: Agent | null = null;
    if (agents.size >= 1) {
      setTimeout(() => {
        agent = new Agent(configPath, name, server, port, plugins);
        agents.set(name, agent);
      }, 6 * 1000); // 10 seconds delay
    } else {
      agent = new Agent(configPath, name, server, port, plugins);
      agents.set(name, agent);
    }

    return agent;
  },
  getAgent(name: string) {
    return agents.get(name);
  },
  deleteAgent(name: string) {
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
  setUpdateCallback(callback: () => void) {
    updateCallback = callback;
  },

  triggerUpdate() {
    if (updateCallback) updateCallback();
  },

  makeHud() {
    // Call this to start the HUD system
    console.log("HUD initialized");
  },
};
