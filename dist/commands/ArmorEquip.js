"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArmorEquipCommand = void 0;
const command_1 = require("../utils/command");
var ArmorType;
(function (ArmorType) {
    ArmorType["HELMET"] = "head";
    ArmorType["CHESTPLATE"] = "torso";
    ArmorType["LEGGINGS"] = "legs";
    ArmorType["BOOTS"] = "feet";
})(ArmorType || (ArmorType = {}));
class ArmorEquipCommand extends command_1.Command {
    constructor() {
        super("aequip");
        this.agent = null;
    }
    execute(agent, itemToEquip) {
        return __awaiter(this, void 0, void 0, function* () {
            const bot = agent.getBot();
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
            }
            else if (itemToEquip.includes("chestplate")) {
                bot.equip(item, "torso");
            }
            else if (itemToEquip.includes("leggings")) {
                bot.equip(item, "legs");
            }
            else if (itemToEquip.includes("boots")) {
                bot.equip(item, "feet");
            }
        });
    }
}
exports.ArmorEquipCommand = ArmorEquipCommand;
