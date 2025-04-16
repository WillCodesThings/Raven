import { Bot } from "mineflayer";
import { goals } from "mineflayer-pathfinder";
import { Command } from "../utils/command";
import { Agent } from "../utils/Agent";

export class GetAllInfoCommand extends Command {
  private agent: Agent | null = null;

  constructor() {
    super("info");
  }

  async execute(agent: Agent, itemToEquip: string) {
    const bot: Bot = agent.getBot();
    agent.sendChat(JSON.stringify(bot.entity.metadata));
  }
}
