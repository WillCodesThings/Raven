"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
class Command {
    /**
     * Creates an instance of Command.
     * @param {string} name - The name of the command. Should be lowercase to be recognized by the bot. ( will fix later )
     * @memberof Command
     */
    constructor(name) {
        this.name = name;
    }
}
exports.Command = Command;
