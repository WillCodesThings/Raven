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
class MineCommand extends command_1.Command {
    constructor() {
        super("mine");
        this.interval = null;
        this.agent = null;
        this.mining = false;
        this.initialBlockCounts = new Map();
    }
    execute(agent, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            agent.sendChat(arg);
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.MineCommand = MineCommand;
