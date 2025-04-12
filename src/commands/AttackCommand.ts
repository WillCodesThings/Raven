import { Bot } from "mineflayer";
import { Command } from "../utils/command";
import { Agent } from "../utils/Agent";

export class AttackCommand extends Command {
  constructor() {
    super("attack");
  }

  async execute(agent: Agent, targetName: string) {
    const bot: Bot = agent.getBot();
    const target = bot.nearestEntity(
      (entity) => entity && entity.name === targetName
    );

    if (target) {
      bot.pvp.attack(target);
      agent.sendChat(`Attacking ${targetName}`);
    } else {
      agent.sendChat(`No entity named ${targetName} found.`);
    }
  }
}
