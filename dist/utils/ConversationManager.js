"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationManager = void 0;
class ConversationManager {
    constructor() {
        this.conversations = new Map();
    }
    static getInstance() {
        if (!ConversationManager.instance) {
            ConversationManager.instance = new ConversationManager();
        }
        return ConversationManager.instance;
    }
    /**
     * Starts a conversation between two agents.
     * @param agent1 - The first agent's name.
     * @param agent2 - The second agent's name.
     */
    startConversation(agent1, agent2) {
        var _a, _b;
        if (!this.conversations.has(agent1)) {
            this.conversations.set(agent1, []);
        }
        if (!this.conversations.has(agent2)) {
            this.conversations.set(agent2, []);
        }
        (_a = this.conversations.get(agent1)) === null || _a === void 0 ? void 0 : _a.push(agent2);
        (_b = this.conversations.get(agent2)) === null || _b === void 0 ? void 0 : _b.push(agent1);
    }
    /**
     * Ends a conversation between two agents.
     * @param agent1 - The first agent's name.
     * @param agent2 - The second agent's name.
     */
    endConversation(agent1, agent2) {
        if (this.conversations.has(agent1)) {
            this.conversations.set(agent1, this.conversations.get(agent1).filter((agent) => agent !== agent2));
        }
        if (this.conversations.has(agent2)) {
            this.conversations.set(agent2, this.conversations.get(agent2).filter((agent) => agent !== agent1));
        }
    }
    /**
     * Gets the list of agents in a conversation with a specific agent.
     * @param agent - The agent's name.
     * @returns An array of agent names in the conversation.
     */
    getConversations(agent) {
        return this.conversations.get(agent) || [];
    }
    /**
     * Checks if two agents are in a conversation.
     * @param agent1 - The first agent's name.
     * @param agent2 - The second agent's name.
     * @returns True if they are in a conversation, false otherwise.
     */
    areInConversation(agent1, agent2) {
        return (this.conversations.has(agent1) &&
            this.conversations.get(agent1).includes(agent2) &&
            this.conversations.has(agent2) &&
            this.conversations.get(agent2).includes(agent1));
    }
}
exports.ConversationManager = ConversationManager;
ConversationManager.instance = null;
