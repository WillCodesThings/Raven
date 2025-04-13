import { Bot } from "mineflayer";
import { goals } from "mineflayer-pathfinder";
import { Command } from "../utils/command";
import { Agent } from "../utils/Agent";

export class SetSkinCommand extends Command {
  constructor() {
    super("skin");
  }

  async execute(agent: Agent, url: string) {
    agent.sendChat(`/skin url "${url}"`);
  }
}
