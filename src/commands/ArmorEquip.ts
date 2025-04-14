import { Bot } from "mineflayer";
import { goals } from "mineflayer-pathfinder";
import { Command } from "../utils/command";
import { Agent } from "../utils/Agent";

enum ArmorType {
  HELMET = "head",
  CHESTPLATE = "torso",
  LEGGINGS = "legs",
  BOOTS = "feet",
}

export class ArmorEquipCommand extends Command {
  private agent: Agent | null = null;

  constructor() {
    super("aequip");
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

    agent.sendChat(`Equipping ${itemToEquip}...`);

    console.log("[ARMOR TYPE]: ");

    if (itemToEquip.includes("helmet")) {
      bot.equip(item, "head");
    } else if (itemToEquip.includes("chestplate")) {
      bot.equip(item, "torso");
    } else if (itemToEquip.includes("leggings")) {
      bot.equip(item, "legs");
    } else if (itemToEquip.includes("boots")) {
      bot.equip(item, "feet");
    }
  }
}
