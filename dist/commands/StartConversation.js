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
exports.StartConversation = void 0;
const command_1 = require("../utils/command");
const agentManager_1 = require("../utils/agentManager");
const ConversationManager_1 = require("../utils/ConversationManager");
class StartConversation extends command_1.Command {
    constructor() {
        super("startConversation");
        this.agent = null;
    }
    execute(agent, otherPlayerName) {
        return __awaiter(this, void 0, void 0, function* () {
            const bot = agent.getBot();
            this.agent = agent;
            agentManager_1.AgentManager.getAllAgents().forEach((otherAgent) => {
                if (otherAgent.getBotInfo().name === otherPlayerName) {
                    ConversationManager_1.ConversationManager.getInstance().startConversation(agent.getName(), otherAgent.getName());
                }
            });
            this.agent.sendChat(` ${otherPlayerName}.`);
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.agent)
                return;
            this.agent.sendChat("Stopped mining.");
        });
    }
}
exports.StartConversation = StartConversation;
