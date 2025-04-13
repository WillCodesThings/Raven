export class ConversationManager {
  private conversations: Map<string, string[]>;

  private static instance: ConversationManager | null = null;

  constructor() {
    this.conversations = new Map();
  }

  public static getInstance() {
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
  startConversation(agent1: string, agent2: string) {
    if (!this.conversations.has(agent1)) {
      this.conversations.set(agent1, []);
    }
    if (!this.conversations.has(agent2)) {
      this.conversations.set(agent2, []);
    }
    this.conversations.get(agent1)?.push(agent2);
    this.conversations.get(agent2)?.push(agent1);
  }
  /**
   * Ends a conversation between two agents.
   * @param agent1 - The first agent's name.
   * @param agent2 - The second agent's name.
   */
  endConversation(agent1: string, agent2: string) {
    if (this.conversations.has(agent1)) {
      this.conversations.set(
        agent1,
        this.conversations.get(agent1)!.filter((agent) => agent !== agent2)
      );
    }
    if (this.conversations.has(agent2)) {
      this.conversations.set(
        agent2,
        this.conversations.get(agent2)!.filter((agent) => agent !== agent1)
      );
    }
  }

  /**
   * Gets the list of agents in a conversation with a specific agent.
   * @param agent - The agent's name.
   * @returns An array of agent names in the conversation.
   */
  getConversations(agent: string): string[] {
    return this.conversations.get(agent) || [];
  }

  /**
   * Checks if two agents are in a conversation.
   * @param agent1 - The first agent's name.
   * @param agent2 - The second agent's name.
   * @returns True if they are in a conversation, false otherwise.
   */
  areInConversation(agent1: string, agent2: string): boolean {
    return (
      this.conversations.has(agent1) &&
      this.conversations.get(agent1)!.includes(agent2) &&
      this.conversations.has(agent2) &&
      this.conversations.get(agent2)!.includes(agent1)
    );
  }
}
