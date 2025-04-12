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
exports.MineCommand = void 0;
const command_1 = require("../utils/command");
const mineflayer_pathfinder_1 = require("mineflayer-pathfinder");
class MineCommand extends command_1.Command {
    constructor() {
        super("mine");
        this.interval = null;
        this.agent = null;
    }
    execute(agent, blockName, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const bot = agent.getBot();
            this.agent = agent;
            const amountInt = parseInt(amount);
            if (amountInt <= 0 || isNaN(amountInt)) {
                agent.sendChat(`Invalid amount: ${amount}`);
                return;
            }
            let mined = 0;
            while (mined < amountInt) {
                if (agent.getBotInfo().inventory.filter((item) => item.name === blockName)
                    .length >= amountInt) {
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
                        yield bot.pathfinder.goto(new mineflayer_pathfinder_1.goals.GoalBlock(block.position.x, block.position.y, block.position.z));
                        agent.sendChat(`Mining ${blockName} (${mined + 1}/${amountInt})`);
                        yield bot.dig(block);
                        mined++;
                    }
                    else {
                        agent.sendChat(`Can't reach or dig ${blockName} at ${block.position}`);
                        break;
                    }
                }
                catch (err) {
                    agent.sendChat(`Error while mining: ${err.message}`);
                    break;
                }
                // Short delay to ensure the block is removed from the world before continuing
                yield bot.waitForTicks(10);
            }
            // After mining, check if we need to stop
            bot.stopDigging();
            agent.sendChat(`Finished mining ${mined} ${blockName}${mined !== 1 ? "s" : ""}.`);
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
}
exports.MineCommand = MineCommand;
