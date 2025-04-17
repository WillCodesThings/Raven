import { Bot } from "mineflayer";
import { goals } from "mineflayer-pathfinder";
import { Command } from "../utils/command";
import { Agent } from "../utils/Agent";
import minecraftData from "minecraft-data";

enum ArmorType {
    INVENTORY = "inventory",
    CRAFTING_TABLE = "crafting_table",
}

export class CraftCommand extends Command {
    private agent: Agent | null = null;
    constructor() {
        super("craft");
    }

    async execute(agent: Agent, item: string, number: number) {
        const bot: Bot = agent.getBot();
        const mcData = minecraftData('1.21');
        const recipesWithoutCraftingTable = bot.recipesFor(mcData.itemsByName[item].id, null, number, null);
        const craftingTable = bot.findBlock({
            matching: (block) => (block.name === "crafting_table"),
        maxDistance: 64,
      });
        const recipesWithCraftingTable = bot.recipesFor(mcData.itemsByName[item].id, null, number, craftingTable);
        if (recipesWithoutCraftingTable.length !== 0) {
            // @ts-ignore
            await bot.craft(recipesWithoutCraftingTable[0], number, null);
        } else if (recipesWithCraftingTable.length !== 0) {
            // @ts-ignore
            await bot.craft(recipesWithCraftingTable[0], number, craftingTable);
        } else {
            // cannot craft
        }
    }
}
// export class FollowCommand extends Command {
//   private agent: Agent | null = null;

//   constructor() {
//     super("craft");
//   }

//   async execute(agent: Agent, type: ) {
//     const bot: Bot = agent.getBot();
//     this.agent = agent;
//     const target = bot.players[playerName]?.entity;

//     if (target) {
//       const followGoal = new goals.GoalFollow(target, 1); // 1 block tolerance
//       bot.pathfinder.setGoal(followGoal);
//       agent.sendChat(`Following ${playerName}`);
//     } else {
//       agent.sendChat(`Player ${playerName} not found.`);
//     }
//   }

//   async stop() {
//     if (!this.agent) {
//       return;
//     }

//     let bot: Bot = this.agent.getBot();
//     if (!bot) {
//       this.agent.sendChat("Bot is not initialized properly.");
//       return;
//     }

//     this.agent?.getBot().pathfinder.stop();
//     this.agent.sendChat("Stopped following.");
//   }
// }
