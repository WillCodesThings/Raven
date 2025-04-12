export abstract class Command {
  /**
   * Creates an instance of Command.
   * @param {string} name - The name of the command. Should be lowercase to be recognized by the bot. ( will fix later )
   * @memberof Command
   */
  constructor(public name: string) {}
  abstract execute(agent: any, ...args: any[]): void;
}
