// import { Bot } from "mineflayer";
// import { goals } from "mineflayer-pathfinder";
// import { Command } from "../utils/command";
// import { Agent } from "../utils/Agent";

// enum ArmorType {
//     INVENTORY = "inventory",
//     CRAFTING_TABLE = "crafting_table",
//   }

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
