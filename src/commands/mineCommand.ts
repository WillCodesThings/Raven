import { Bot } from "mineflayer";
import { Command } from "../utils/command";
import { Agent } from "../utils/Agent";
import { goals } from "mineflayer-pathfinder";

export class MineCommand extends Command {
  private interval: NodeJS.Timeout | null = null;
  private agent: Agent | null = null;

  constructor() {
    super("mine");
  }

  async execute(agent: Agent, blockName: string, amount: string) {
    const bot: Bot = agent.getBot();
    this.agent = agent;
    const amountInt = parseInt(amount);

    if (amountInt <= 0 || isNaN(amountInt)) {
      agent.sendChat(`Invalid amount: ${amount}`);
      return;
    }

    let mined = 0;

    const getItemCount = () => {
      return bot.inventory.items().reduce((total, item) => {
        if (item.name === blockName) {
          total += item.count;
        }
        return total;
      }, 0);
    };

    while (getItemCount() < amountInt) {
      const block = bot.findBlock({
        matching: (block) => block.name === blockName,
        maxDistance: 64,
      });

      if (!block) {
        agent.sendChat(`Could not find more ${blockName} blocks nearby.`);
        break;
      }

      try {
        if (bot.canDigBlock(block) && bot.canSeeBlock(block)) {
          agent.sendChat(`Moving to ${blockName} at ${block.position}`);

          await bot.pathfinder.goto(
            new goals.GoalBlock(
              block.position.x,
              block.position.y,
              block.position.z
            )
          );

          agent.sendChat(`Mining ${blockName} (${mined + 1}/${amountInt})`);
          await bot.dig(block);
          mined++;

          // Wait a bit to ensure the block disappears & item is picked up
          await bot.waitForTicks(10);
        } else {
          agent.sendChat(
            `Can't reach or dig ${blockName} at ${block.position}`
          );
          break;
        }
      } catch (err: any) {
        agent.sendChat(`Error while mining: ${err.message}`);
        break;
      }
    }

    bot.stopDigging();

    agent.sendChat(
      `Finished mining. Collected ${getItemCount()} ${blockName}${
        getItemCount() !== 1 ? "s" : ""
      }.`
    );
  }

  async stop() {
    if (!this.agent) return;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.agent.sendChat("Stopped mining.");
  }
}
