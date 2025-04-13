import { Agent } from "../utils/Agent";
import { Command } from "../utils/command";
import { Bot } from "mineflayer";
import { goals } from "mineflayer-pathfinder";

export class MineCommand extends Command {
  private interval: NodeJS.Timeout | null = null;
  private agent: Agent | null = null;
  private mining: boolean = false;
  private initialBlockCounts: Map<string, number> = new Map();

  constructor() {
    super("mine");
  }

  async execute(agent: Agent, blockNamesArg: string[], amount: string) {
    const bot: Bot = agent.getBot();
    this.agent = agent;

    // Parse the amount to an integer
    let amountInt = parseInt(amount);
    if (isNaN(amountInt) || amountInt <= 0) {
      amountInt = -1; // Default to infinite mining mode
      agent.sendChat(
        "Infinite mining mode activated. I'll keep going until you stop me."
      );
    } else {
      agent.sendChat(`I'll mine ${amountInt} blocks.`);
    }

    // Handle block names error
    let blockNames: string[] = [];
    try {
      // Check if blockNamesArg is an array-like string and try to parse it
      blockNames = Array.isArray(blockNamesArg)
        ? blockNamesArg
        : JSON.parse(blockNamesArg);
    } catch (err) {
      agent.sendChat(
        "Error: Failed to parse block names. Please ensure they are provided as a valid array."
      );
      return;
    }

    // If no valid blocks are found, return early
    if (blockNames.length === 0) {
      agent.sendChat(
        "Error: No blocks provided for mining. Please specify at least one block name."
      );
      return;
    }

    // Store initial inventory counts before mining starts
    this.initialBlockCounts.clear();
    for (const blockName of blockNames) {
      this.initialBlockCounts.set(
        blockName,
        this.getItemCountByName(bot, blockName)
      );
    }

    agent.sendChat(
      `Starting with ${this.getTotalInitialBlocks(
        blockNames
      )} blocks in inventory.`
    );

    // Start mining
    this.mining = true;
    let mined = 0;

    // Mining loop
    while (this.mining && (amountInt === -1 || mined < amountInt)) {
      const block = bot.findBlock({
        matching: (block) => blockNames.includes(block.name),
        maxDistance: 64,
      });

      if (!block) {
        agent.sendChat(
          `Could not find more blocks of ${blockNames.join(", ")} nearby.`
        );
        break;
      }

      try {
        if (bot.canSeeBlock(block) && bot.canDigBlock(block)) {
          //   agent.sendChat(`Moving to ${block.name} at ${block.position}`);

          await bot.pathfinder.goto(
            new goals.GoalNear(
              block.position.x,
              block.position.y,
              block.position.z,
              2 // 2-block radius to pickup newly mined blocks
            )
          );

          if (amountInt !== -1 && amountInt % 10 === 0) {
            agent.sendChat(
              `Mining ${block.name} (${mined + 1}/${
                amountInt === -1 ? "∞" : amountInt
              })`
            );
          }
          await bot.dig(block, true);

          // Wait a bit to ensure the block disappears & item is picked up
          await bot.waitForTicks(10);

          // Only increment mined count if inventory count has increased
          const newlyMined = this.countNewlyMinedBlocks(bot, blockNames);
          if (newlyMined > mined) {
            mined = newlyMined;
          }
        } else if (bot.canDigBlock(block)) {
          agent.sendChat(`Can't dig ${block.name} at ${block.position}`);
          await bot.pathfinder.goto(
            new goals.GoalBlock(
              block.position.x,
              block.position.y,
              block.position.z
            )
          );
        } else {
          await bot.pathfinder.goto(
            new goals.GoalBlock(
              block.position.x,
              block.position.y,
              block.position.z
            )
          );
        }
      } catch (err: any) {
        console.warn("Error while mining:", err);
        agent.sendChat(`Error while mining: ${err.message}`);
        break;
      }
    }

    bot.stopDigging();

    // Final status after mining
    if (this.mining) {
      const newlyMined = this.countNewlyMinedBlocks(bot, blockNames);
      agent.sendChat(
        `Finished mining. Collected ${newlyMined} new blocks of ${blockNames.join(
          ", "
        )}.`
      );
    } else {
      agent.sendChat("Mining stopped.");
    }
  }

  async stop() {
    if (!this.agent) return;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.mining = false;
    this.agent.sendChat("Stopped mining.");
  }

  /**
   * Count the number of newly mined blocks by comparing current inventory with initial counts
   */
  private countNewlyMinedBlocks(bot: Bot, blockNames: string[]): number {
    let newlyMined = 0;

    for (const blockName of blockNames) {
      const initialCount = this.initialBlockCounts.get(blockName) || 0;
      const currentCount = this.getItemCountByName(bot, blockName);
      newlyMined += Math.max(0, currentCount - initialCount);
    }

    return newlyMined;
  }

  /**
   * Count the total number of blocks of the given types in the inventory
   */
  private getItemCount(bot: Bot, blockNames: string[]): number {
    return bot.inventory.items().reduce((total, item) => {
      if (blockNames.includes(item.name)) {
        total += item.count;
      }
      return total;
    }, 0);
  }

  /**
   * Count the number of blocks of a specific type in the inventory
   */
  private getItemCountByName(bot: Bot, blockName: string): number {
    return bot.inventory.items().reduce((total, item) => {
      if (item.name === blockName) {
        total += item.count;
      }
      return total;
    }, 0);
  }

  /**
   * Get the total initial blocks count
   */
  private getTotalInitialBlocks(blockNames: string[]): number {
    let total = 0;
    for (const blockName of blockNames) {
      total += this.initialBlockCounts.get(blockName) || 0;
    }
    return total;
  }
}
