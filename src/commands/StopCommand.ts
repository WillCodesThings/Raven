import { Command } from "../utils/command";
import { Agent } from "../utils/Agent";

export class StopCommand extends Command {
  constructor() {
    super("stop");
  }

  async execute(agent: Agent) {
    const lastCommandName = agent.getLastCommandName();
    const lastCommand = lastCommandName
      ? agent.getCommands().get(lastCommandName)
      : null;

    agent.sendChat(
      `Stopping command: ${lastCommandName || "No last command found."}`
    );

    if (lastCommand && typeof (lastCommand as any).stop === "function") {
      (lastCommand as any).stop();
      agent.sendChat(`Stopped ${lastCommandName}.`);
    } else {
      agent.sendChat(
        "No running command to stop or command doesn't support stopping."
      );
    }
  }
}
