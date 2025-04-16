import { Agent, LoginInfo } from "./Agent";

const agents = new Map<string, Agent>();
let updateCallback: () => void = () => {};
let pendingAgentCount = 0; // <-- Tracks agents waiting to be created

export const AgentManager = {
  getBotCount() {
    return agents.size;
  },

  createAgent(
    name: string,
    configPath: string,
    server: string,
    port: number,
    plugins: any[],
    options?: { email?: string; password?: string }
  ) {
    if (agents.has(name)) return null;

    const loginInfo: LoginInfo = {
      username: name,
      email: options?.email || "",
      password: options?.password || "",
    };

    const create = () => {
      const agent = new Agent(configPath, loginInfo, server, port, plugins);
      agents.set(name, agent);
      this.triggerUpdate();
      pendingAgentCount = Math.max(0, pendingAgentCount - 1); // Reduce pending count
      return agent;
    };

    if (agents.size + pendingAgentCount >= 1) {
      const delayMs = 6_000 * (pendingAgentCount + 1); // Delay per pending position
      console.log(`Agent "${name}" scheduled to join in ${delayMs}ms`);
      pendingAgentCount++;
      setTimeout(() => {
        create();
      }, delayMs);
      return null; // Not created yet
    } else {
      return create(); // Create immediately
    }
  },

  getAgentById(id: number) {
    return Array.from(agents.values()).find((a) => a.getBot().entity.id === id);
  },

  getAgent(name: string) {
    return agents.get(name);
  },

  deleteAgent(name: string) {
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

  setUpdateCallback(callback: () => void) {
    updateCallback = callback;
  },

  triggerUpdate() {
    if (updateCallback) updateCallback();
  },

  makeHud() {
    console.log("HUD initialized");
  },
};
