import { Bot } from "mineflayer";
import { Command } from "../utils/command";
import { Agent } from "../utils/Agent";
import { goals } from "mineflayer-pathfinder";
import { AgentManager } from "../utils/agentManager";
import { ConversationManager } from "../utils/ConversationManager";

export class StartConversation extends Command {
  private agent: Agent | null = null;

  constructor() {
    super("startConversation");
  }

  async execute(agent: Agent, otherPlayerName: string) {
    const bot: Bot = agent.getBot();
    this.agent = agent;

    AgentManager.getAllAgents().forEach((otherAgent) => {
      if (otherAgent.getBotInfo().name === otherPlayerName) {
        ConversationManager.getInstance().startConversation(
          agent.getName(),
          otherAgent.getName()
        );
      }
    });

    this.agent.sendChat(` ${otherPlayerName}.`);
  }

  async stop() {
    if (!this.agent) return;

    this.agent.sendChat("Stopped mining.");
  }
}
