import { Bot } from "mineflayer";
import { goals } from "mineflayer-pathfinder";
import { Command } from "../utils/command";
import { Agent } from "../utils/Agent";

export class GoToCommand extends Command {
  private agent: Agent | null = null;

  constructor() {
    super("goto");
  }

  async execute(agent: Agent, x: string, y: string, z: string) {
    this.agent = agent;
    const bot: Bot = agent.getBot();
    const coords = [parseInt(x), parseInt(y), parseInt(z)];

    if (coords.every((coord) => !isNaN(coord))) {
      const goal = new goals.GoalBlock(coords[0], coords[1], coords[2]);
      bot.pathfinder.setGoal(goal);
      agent.sendChat(`Moving to (${coords[0]}, ${coords[1]}, ${coords[2]})`);
    } else {
      agent.sendChat(`Invalid coordinates: ${x}, ${y}, ${z}`);
    }
  }

  async stop() {
    if (!this.agent) {
      return;
    }

    let bot: Bot = this.agent.getBot();
    if (!bot) {
      this.agent.sendChat("Bot is not initialized properly.");
      return;
    }

    this.agent.getBot().pathfinder.stop();
    this.agent.sendChat("Stopped moving.");
  }
}
