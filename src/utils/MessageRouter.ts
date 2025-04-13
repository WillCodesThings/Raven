import { Agent } from "./Agent";

export class MessageRouter {
  private agent: Agent;

  constructor(agent: Agent) {
    this.agent = agent;
  }

  /**
   * Deconstructs a function-style command into command name and arguments
   * @param message - The command text without the prefix (e.g. "mine([blockname1, blockname2], 2)")
   * @returns An array with the command name as first element and arguments as remaining elements
   */
  public deconstructCommand(message: string): {
    commandName: string;
    args: any[];
  } {
    // First, extract the command name and parameter string
    const cmdRegex = /^(\w+)\s*\((.*)\)$/;
    const match = message.trim().match(cmdRegex);

    if (!match) {
      // Fallback to simple space-separated parsing if not in function format
      const parts = message.trim().split(/\s+/);
      return { commandName: "", args: [] };
    }

    const commandName = match[1].toLowerCase();
    const paramString = match[2].trim();

    if (!paramString) {
      // Command with no parameters
      return { commandName, args: [] };
    }

    // Parse the parameters - this handles arrays and nested structures
    try {
      // First attempt to parse as JSON by wrapping in array brackets
      // This handles arrays, strings with commas, etc.
      const parsedArgs = this.parseParameters(paramString);
      return {
        commandName,
        args: parsedArgs,
      };
    } catch (e) {
      // If JSON parsing fails, fall back to simple comma separation
      const args = paramString.split(",").map((arg) => arg.trim());
      return {
        commandName,
        args: args.map((arg) => this.parseParam(arg)),
      };
    }
  }

  /**
   * Parse parameters from a function-style command
   * @param paramString - The parameter string (e.g. "[blockname1, blockname2], 2")
   * @returns An array of parsed parameters
   */
  private parseParameters(paramString: string): any[] {
    // Handle arrays in the parameters
    let inArray = false;
    let currentParam = "";
    const params: any[] = [];
    let depth = 0;

    for (let i = 0; i < paramString.length; i++) {
      const char = paramString[i];

      if (char === "[") {
        inArray = true;
        depth++;
        currentParam += char;
      } else if (char === "]") {
        depth--;
        currentParam += char;
        if (depth === 0) inArray = false;
      } else if (char === "," && !inArray && depth === 0) {
        params.push(this.parseParam(currentParam.trim()));
        currentParam = "";
      } else {
        currentParam += char;
      }
    }

    if (currentParam.trim()) {
      params.push(this.parseParam(currentParam.trim()));
    }

    return params;
  }

  /**
   * Parse a single parameter value
   * @param param - The parameter string
   * @returns The parsed parameter value
   */
  private parseParam(param: string): any {
    // Try to parse as array
    if (param.startsWith("[") && param.endsWith("]")) {
      try {
        return JSON.parse(param);
      } catch (e) {
        // If JSON parsing fails, handle as string array
        const items = param
          .slice(1, -1)
          .split(",")
          .map((item) => item.trim());
        return items;
      }
    }

    // Try to parse as number
    if (!isNaN(Number(param))) {
      return Number(param);
    }

    // Handle string values
    if (param.startsWith('"') && param.endsWith('"')) {
      return param.slice(1, -1);
    }

    // Return as is
    return param;
  }

  /**
   * Routes messages to the appropriate handler based on the sender and message content.
   * @param sender - The name of the sender.
   * @param message - The message content.
   */
  public routeMessage(sender: string, message: string): void {
    if (sender === this.agent.getName() || !message) return;

    // this.agent.sendChat(`Received message from ${sender}: ${message}`);
    // this.agent.sendChat(`Routing message: ${message}`);

    if (this.isUserCommand(message)) {
      this.agent.sendChat(`Processing user command: ${message}`);
      this.agent.processUserCommand(message);
    } else if (this.isAgentMessageForMe(message)) {
      this.agent.sendChat(`Processing agent message: ${message}`);
      this.agent.processAgentMessage(sender, message);
    }
  }

  /**
   * Checks if the message is a user command
   * @param message - The message to check
   * @returns true if the message is a user command, false otherwise
   */
  private isUserCommand(message: string): boolean {
    return message.startsWith(`<${this.agent.getName()}> !`);
  }

  /**
   * Checks if the message is directed to this agent or all agents
   * @param message - The message to check
   * @returns true if the message is directed to this agent or all agents, false otherwise
   */
  private isAgentMessageForMe(message: string): boolean {
    return (
      message.startsWith(`@${this.agent.getName()}:`) ||
      message.startsWith(`@all:`)
    );
  }

  /**
   * Extracts the command text from a user command message
   * @param message - The user command message
   * @returns The command text without the prefix
   */
  public extractUserCommandText(message: string): string {
    return message.slice(`<${this.agent.getName()}> `.length).trim();
  }

  /**
   * Extracts the target and content from an agent message
   * @param message - The agent message
   * @returns An object containing the target and content of the message
   */
  public parseAgentMessage(
    message: string
  ): { target: string; content: string } | null {
    const match = message.match(/^@(\w+|all):\s*(.*)$/);
    if (!match) return null;

    return {
      target: match[1],
      content: match[2].trim(),
    };
  }

  /**
   * Determines if an agent message is targeted at this agent
   * @param target - The target of the message
   * @returns true if the message is targeted at this agent, false otherwise
   */
  public isMessageTargetedAtMe(target: string): boolean {
    return target === this.agent.getName() || target === "all";
  }

  /**
   * Creates a formatted agent message
   * @param target - The target agent name or "all"
   * @param content - The message content
   * @returns A properly formatted agent message
   */
  public createAgentMessage(target: string, content: string): string {
    return `@${target}: ${content}`;
  }
}
