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
exports.FollowCommand = void 0;
const mineflayer_pathfinder_1 = require("mineflayer-pathfinder");
const command_1 = require("../utils/command");
class FollowCommand extends command_1.Command {
    constructor() {
        super("follow");
        this.agent = null;
    }
    execute(agent, playerName) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const bot = agent.getBot();
            this.agent = agent;
            const target = (_a = bot.players[playerName]) === null || _a === void 0 ? void 0 : _a.entity;
            if (target) {
                const followGoal = new mineflayer_pathfinder_1.goals.GoalFollow(target, 1); // 1 block tolerance
                bot.pathfinder.setGoal(followGoal);
                agent.sendChat(`Following ${playerName}`);
            }
            else {
                agent.sendChat(`Player ${playerName} not found.`);
            }
        });
    }
    stop() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.agent) {
                return;
            }
            let bot = this.agent.getBot();
            if (!bot) {
                this.agent.sendChat("Bot is not initialized properly.");
                return;
            }
            (_a = this.agent) === null || _a === void 0 ? void 0 : _a.getBot().pathfinder.stop();
            this.agent.sendChat("Stopped following.");
        });
    }
}
exports.FollowCommand = FollowCommand;
