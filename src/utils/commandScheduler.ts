import { Agent } from "./Agent";
import { Command } from "./command";

class commandScheduler {
  private queue: Command[] = [];
  private isRunning = false;

  private static instance: commandScheduler | null = null;

  public schedule(command: Command) {
    this.queue.push(command);
    this.runNext();
  }

  public static getInstance(): commandScheduler {
    if (!commandScheduler.instance) {
      commandScheduler.instance = new commandScheduler();
    }
    return commandScheduler.instance;
  }

  private async runNext() {
    if (this.isRunning || this.queue.length === 0) {
      return;
    }
    this.isRunning = true;
    const command = this.queue.shift();
    if (command) {
      await command.execute(Agent);
    }
    this.isRunning = false;
    this.runNext();
  }
}
