import { Bot } from "mineflayer";
import { goals } from "mineflayer-pathfinder";
import { Command } from "../utils/command";
import { Agent } from "../utils/Agent";

export class EquipCommand extends Command {
  private agent: Agent | null = null;

  constructor() {
    super("equip");
  }

  async execute(agent: Agent, itemToEquip: string) {
    const bot: Bot = agent.getBot();
    const inventory = agent.getBotInfo().inventory;

    if (!inventory) {
      agent.sendChat("Inventory not found.");
      return;
    }

    if (!itemToEquip) {
      agent.sendChat("Please specify an item to equip.");
      return;
    }

    const item = inventory.find((item) => item.name === itemToEquip);

    if (!item) {
      agent.sendChat(`Item ${itemToEquip} not found in inventory.`);
      return;
    }

    bot.equip(item || inventory[0], "hand");
  }
}
