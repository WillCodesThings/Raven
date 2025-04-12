import { Bot } from "mineflayer";
import { Command } from "../utils/command";
import { Agent } from "../utils/Agent";

export class KillOnSight extends Command {
  private interval: NodeJS.Timeout | null = null;

  constructor() {
    super("kos");
  }

  async execute(agent: Agent, targetName: string) {
    const bot: Bot = agent.getBot();

    if (!bot.pvp) {
      agent.sendChat("PVP plugin is not loaded.");
      return;
    }

    // Clear previous interval if it exists
    if (this.interval) {
      clearInterval(this.interval);
    }

    this.interval = setInterval(() => {
      const target = bot.nearestEntity((entity) => {
        return entity.username === targetName || entity.name === targetName;
      });

      if (target) {
        bot.pvp.attack(target);
        agent.sendChat(`Attacking ${targetName}`);
      } else {
        agent.sendChat(`No entity named ${targetName} found.`);
      }
    }, 1000);
  }

  // Optional: You could provide a way to stop the interval
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
