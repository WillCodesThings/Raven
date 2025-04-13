import { Bot } from "mineflayer";
import { goals } from "mineflayer-pathfinder";
import { Command } from "../utils/command";
import { Agent } from "../utils/Agent";

export class PerpetualFollowCommand extends Command {
  private agent: Agent | null = null;

  constructor() {
    super("pfollow");
  }

  async execute(agent: Agent, playerName: string) {
    const bot: Bot = agent.getBot();
    this.agent = agent;
    const target = bot.players[playerName]?.entity;

    if (target) {
      const followGoal = new goals.GoalFollow(target, 1); // 1 block tolerance
      bot.pathfinder.setGoal(followGoal);
      agent.sendChat(`Perpetually Following ${playerName}`);
      bot.on("goal_reached", () => {
        const followGoal = new goals.GoalFollow(target, 1); // 1 block tolerance
        bot.pathfinder.setGoal(followGoal);
      });
    } else {
      agent.sendChat(`Player ${playerName} not found.`);
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

    this.agent?.getBot().pathfinder.stop();
    bot.removeListener("goal_reached", () => {});
    this.agent.sendChat("Stopped following.");
  }
}
