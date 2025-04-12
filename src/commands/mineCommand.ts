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

    while (mined < amountInt) {
      if (
        agent.getBotInfo().inventory.filter((item) => item.name === blockName)
          .length >= amountInt
      ) {
        agent.sendChat(`Got All Blocks, stopping mining.`);
        break;
      }
      // Search for a block each time
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

          // Move close to the block first
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
        } else {
          agent.sendChat(
            `Can't reach or dig ${blockName} at ${block.position}`
          );
          break;
        }
      } catch (err) {
        agent.sendChat(`Error while mining: ${err.message}`);
        break;
      }

      // Short delay to ensure the block is removed from the world before continuing
      await bot.waitForTicks(10);
    }
    // After mining, check if we need to stop
    bot.stopDigging();
    agent.sendChat(
      `Finished mining ${mined} ${blockName}${mined !== 1 ? "s" : ""}.`
    );
  }

  async stop() {
    if (!this.agent) {
      return;
    }
    // Implement stop logic if needed
    // For example, you might want to clear the interval or stop mining
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.agent.sendChat("Stopped mining.");
  }
}
