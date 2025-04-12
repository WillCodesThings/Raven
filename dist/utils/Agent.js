"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = exports.addBrowserViewer = void 0;
const mineflayer_1 = require("mineflayer");
const mineflayer_pathfinder_1 = require("mineflayer-pathfinder");
const fs_1 = __importDefault(require("fs"));
const AttackCommand_1 = require("../commands/AttackCommand");
const GoToCommand_1 = require("../commands/GoToCommand");
const FollowCommand_1 = require("../commands/FollowCommand");
const prismarine_viewer_1 = __importDefault(require("prismarine-viewer"));
const KillOnSight_1 = require("../commands/KillOnSight");
const StopCommand_1 = require("../commands/StopCommand");
const mineCommand_1 = require("../commands/mineCommand");
const mineflayerViewer = prismarine_viewer_1.default.mineflayer;
function addBrowserViewer(bot, count_id) {
    mineflayerViewer(bot, { port: 3000 + count_id, firstPerson: true });
}
exports.addBrowserViewer = addBrowserViewer;
let botsMade = 0;
class Agent {
    constructor(configPath, name, server, port, plugins, botsMade = 0) {
        this.commands = new Map();
        this.lastCommandMessage = null;
        this.lastCommand = null;
        this.pendingCommand = false;
        // server webviews differently
        botsMade++;
        this.bot = mineflayer_1.createBot({
            host: server,
            port: port,
            username: name,
            version: "1.21.4",
        });
        // load all passed in plugins
        this.bot.loadPlugins(plugins);
        this.config = this.loadConfig(configPath);
        this.name = this.config.name;
        this.currentTask = this.config.currentTask;
        this.previousTask = this.config.previousTask;
        // Set up the bot with all the available commands
        this.registerCommand(new AttackCommand_1.AttackCommand());
        this.registerCommand(new GoToCommand_1.GoToCommand());
        this.registerCommand(new FollowCommand_1.FollowCommand());
        this.registerCommand(new KillOnSight_1.KillOnSight());
        this.registerCommand(new mineCommand_1.MineCommand());
        this.registerCommand(new StopCommand_1.StopCommand());
        // Set up Listeners
        this.bot.on("spawn", () => {
            const defaultMove = new mineflayer_pathfinder_1.Movements(this.bot);
            this.bot.pathfinder.setMovements(defaultMove);
            addBrowserViewer(this.bot, botsMade);
            this.sendChat(`Hello! I am ${this.name}.`);
            this.sendChat(`Hello! I am ${this.name}.`);
            this.sendChat(`Current task: ${this.currentTask}`);
            this.sendChat(`Previous task: ${this.previousTask}`);
            this.botInfo = {
                name: this.name,
                health: this.bot.health,
                position: this.bot.entity.position,
                height: this.bot.entity.height,
                yaw: this.bot.entity.yaw,
                pitch: this.bot.entity.pitch,
                dimension: this.bot.game.dimension,
                gamemode: this.bot.game.gameMode,
                food: this.bot.food,
                heldItem: this.bot.entity.heldItem,
                level: this.bot.experience.level,
                experience: this.bot.experience.points,
                inventory: this.bot.inventory.items(),
                inventorySize: this.bot.inventory.slots.length,
            };
        });
        console.log(`Agent ${this.name} initialized with config:`, this.config);
        this.bot.on("chat", (username, message) => {
            this.handleChat(username, message);
        });
        this.bot.on("physicsTick", () => {
            this.updateBotInfo();
        });
        this.bot.on("kicked", (reason) => {
            this.config.wasKicked = true;
            this.config.cleanDisconnect = false;
            this.config.disconnect = true;
            this.config.shouldRejoin = true;
        });
        this.bot.on("end", () => {
            if (this.config.shouldRejoin) {
                this.bot = mineflayer_1.createBot({
                    host: server,
                    port: port,
                    username: name,
                    version: "1.21.4",
                });
                this.bot.loadPlugins(plugins);
            }
        });
    }
    registerCommand(command) {
        this.commands.set(command.name, command);
    }
    getLastCommandName() {
        return this.lastCommand;
    }
    loadConfig(configPath) {
        const raw = fs_1.default.readFileSync(configPath, "utf-8");
        return JSON.parse(raw);
    }
    getBot() {
        return this.bot;
    }
    getConfig() {
        return this.config;
    }
    getBotInfo() {
        return this.botInfo;
    }
    sendChat(message) {
        this.bot.chat(message);
    }
    handleChat(username, message) {
        var _a;
        if (username === this.name)
            return;
        const command = message.split(" ")[0].toLowerCase();
        const args = message.split(" ").slice(1);
        if (this.commands.has(command)) {
            this.pendingCommand = true;
            (_a = this.commands.get(command)) === null || _a === void 0 ? void 0 : _a.execute(this, ...args);
            this.lastCommandMessage = message;
            this.lastCommand = command;
            this.pendingCommand = false;
        }
        else {
            this.sendChat(`Unknown command: ${command}`);
        }
    }
    updateBotInfo() {
        if (!this.botInfo)
            return;
        this.botInfo.health = this.bot.health;
        this.botInfo.position = this.bot.entity.position;
        this.botInfo.height = this.bot.entity.height;
        this.botInfo.yaw = this.bot.entity.yaw;
        this.botInfo.pitch = this.bot.entity.pitch;
        this.botInfo.dimension = this.bot.game.dimension;
        this.botInfo.gamemode = this.bot.game.gameMode;
        this.botInfo.food = this.bot.food;
        this.botInfo.heldItem = this.bot.entity.heldItem;
        this.botInfo.level = this.bot.experience.level;
        this.botInfo.experience = this.bot.experience.points;
        this.botInfo.inventory = this.bot.inventory.items();
        // this.botInfo.inventorySize = this.bot.inventory.slots.length; // dont need to update this
    }
    getNextAction() {
        // gonna be the AI stuff
        // Logic to determine the next action based on the current task
        // This is a placeholder and should be replaced with actual logic
        return "idle";
    }
    executeCommand(command, ...args) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.commands.has(command)) {
                this.pendingCommand = true;
                yield ((_a = this.commands.get(command)) === null || _a === void 0 ? void 0 : _a.execute(this, ...args));
                this.lastCommandMessage = command;
                this.pendingCommand = false;
            }
            else {
                this.sendChat(`Unknown command: ${command}`);
            }
        });
    }
}
exports.Agent = Agent;
