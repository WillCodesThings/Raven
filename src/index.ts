import { Bot, createBot } from 'mineflayer';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';

const bot: Bot = createBot(
    {
        host: "localhost",
        port: 25565,
        username: "wolvesBot",
        version: "1.21.4",
    }
);

bot.loadPlugin(pathfinder);

bot.once("spawn", () => {
    const defaultMove = new Movements(bot);

    bot.pathfinder.setMovements(defaultMove);
})

bot.on("whisper", (username, message, translate, jsonMsg, matches):void => {
    let command = processMessage(username, message);

    execCommand(command);
})

function processMessage(username: string, message: string): string[] {


    return ["a"];
}

function execCommand(command: string[]) {

}