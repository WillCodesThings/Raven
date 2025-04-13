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
exports.KillOnSight = void 0;
const command_1 = require("../utils/command");
class KillOnSight extends command_1.Command {
    constructor() {
        super("kos");
        this.interval = null;
    }
    execute(agent, targetName) {
        return __awaiter(this, void 0, void 0, function* () {
            const bot = agent.getBot();
            if (!bot.pvp) {
                agent.sendChat("PVP plugin is not loaded.");
                return;
            }
            targetName = Array.isArray(targetName)
                ? targetName
                : JSON.parse(targetName);
            // Clear previous interval if it exists
            if (this.interval) {
                clearInterval(this.interval);
            }
            this.interval = setInterval(() => {
                const target = bot.nearestEntity((entity) => {
                    if (!entity)
                        return false;
                    if (!entity.name)
                        return false;
                    if (entity.name === "player" && entity.username) {
                        return (entity &&
                            targetName.includes(entity.username) &&
                            entity.position.distanceTo(bot.entity.position) < 10);
                    }
                    else {
                        return (entity &&
                            targetName.includes(entity.name) &&
                            entity.position.distanceTo(bot.entity.position) < 10);
                    }
                });
                if (target) {
                    bot.pvp.attack(target);
                    agent.sendChat(`Attacking ${targetName}`);
                }
                else {
                    agent.sendChat(`No entity named ${targetName} found.`);
                }
            }, 1000);
        });
    }
    // Optional: You could provide a way to stop the interval
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}
exports.KillOnSight = KillOnSight;
