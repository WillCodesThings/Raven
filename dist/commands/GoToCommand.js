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
exports.GoToCommand = void 0;
const mineflayer_pathfinder_1 = require("mineflayer-pathfinder");
const command_1 = require("../utils/command");
class GoToCommand extends command_1.Command {
    constructor() {
        super("goto");
    }
    execute(agent, x, y, z) {
        return __awaiter(this, void 0, void 0, function* () {
            const bot = agent.getBot();
            const coords = [parseInt(x), parseInt(y), parseInt(z)];
            if (coords.every((coord) => !isNaN(coord))) {
                const goal = new mineflayer_pathfinder_1.goals.GoalBlock(coords[0], coords[1], coords[2]);
                bot.pathfinder.setGoal(goal);
                agent.sendChat(`Moving to (${coords[0]}, ${coords[1]}, ${coords[2]})`);
            }
            else {
                agent.sendChat(`Invalid coordinates: ${x}, ${y}, ${z}`);
            }
        });
    }
}
exports.GoToCommand = GoToCommand;
