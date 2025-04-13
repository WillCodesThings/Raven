import { Agent } from "../utils/Agent";
import { Command } from "../utils/command";

export class SimonSaysCommand extends Command {
  private interval: NodeJS.Timeout | null = null;
  private agent: Agent | null = null;
  private mining: boolean = false;
  private initialBlockCounts: Map<string, number> = new Map();

  constructor() {
    super("simonsays");
  }

  async execute(agent: Agent, arg: string) {
    agent.sendChat(arg);
  }

  async stop() {}
}
