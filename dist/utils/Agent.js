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
const vec3_1 = require("vec3");
const KillOnSight_1 = require("../commands/KillOnSight");
const StopCommand_1 = require("../commands/StopCommand");
const mineCommand_1 = require("../commands/mineCommand");
const ConversationManager_1 = require("./ConversationManager");
const MessageRouter_1 = require("./MessageRouter");
const SimonSaysCommand_1 = require("../commands/SimonSaysCommand");
const SetSkinCommand_1 = require("../commands/SetSkinCommand");
const PerpetualFollowCommand_1 = require("../commands/PerpetualFollowCommand");
const EquipCommand_1 = require("../commands/EquipCommand");
const ArmorEquip_1 = require("../commands/ArmorEquip");
const GetAllInfoCommand_1 = require("../commands/GetAllInfoCommand");
const mineflayerViewer = prismarine_viewer_1.default.mineflayer;
function addBrowserViewer(bot, count_id) {
    mineflayerViewer(bot, { port: 3000 + count_id, firstPerson: true });
}
exports.addBrowserViewer = addBrowserViewer;
let botsMade = 0;
class Agent {
    constructor(configPath, loginInfo, server, port, plugins, model) {
        this.commands = new Map();
        this.lastCommandMessage = null;
        this.lastCommand = null;
        this.pendingCommand = false;
        this.config = this.loadConfig(configPath);
        this.name = loginInfo.username;
        this.currentTask = this.config.currentTask;
        this.previousTask = this.config.previousTask;
        this.model = model;
        this.botInfo = {
            name: "Offline",
            health: 0,
            model: this.config.model,
            // maxHealth: 0,
            // maxFood: 0,
            position: new vec3_1.Vec3(0, 0, 0),
            height: 0.0,
            rotation: { yaw: 0, pitch: 0 },
            dimension: "overworld",
            gamemode: "survival",
            food: 0,
            heldItem: null,
            level: 0,
            experience: 0,
            inventory: [],
            inventorySize: 0,
            uuid: 0,
        };
        this.bot = this.createAndInitBot(loginInfo, server, port, plugins);
        this.registerDefaultCommands();
        console.log(`Agent ${this.name} created and connected to ${server}:${port}`);
    }
    createAndInitBot(loginInfo, server, port, plugins) {
        let bot;
        if (loginInfo.email && loginInfo.password) {
            // Microsoft authentication
            bot = (0, mineflayer_1.createBot)({
                host: server,
                port,
                username: loginInfo.username,
                password: loginInfo.password,
                auth: "microsoft",
                version: "1.21.4",
            });
        }
        else {
            // Offline mode
            bot = (0, mineflayer_1.createBot)({
                host: server,
                port,
                username: loginInfo.username,
                version: "1.21.4",
            });
        }
        console.log(`Creating bot ${this.name}...`);
        bot.loadPlugins(plugins);
        this.setupListeners(bot);
        return bot;
    }
    setupListeners(bot) {
        bot.on("login", () => {
            //   setImmediate(() => addBrowserViewer(bot, ++botsMade));
        });
        bot.on("spawn", () => {
            bot.pathfinder.setMovements(new mineflayer_pathfinder_1.Movements(bot));
            this.initBotInfo();
            this.sendChat(`Hello! I am ${this.name}. Current task: ${this.currentTask}`);
        });
        bot.on("death", () => this.sendChat("I have died!"));
        bot.on("chat", (username, message) => this.messageRouter.routeMessage(username, message));
        bot.on("physicsTick", () => this.updateBotInfo());
        bot.on("kicked", () => {
            this.config = Object.assign(Object.assign({}, this.config), { wasKicked: true, cleanDisconnect: false, disconnect: true, shouldRejoin: true });
        });
    }
    registerDefaultCommands() {
        [
            new AttackCommand_1.AttackCommand(),
            new GoToCommand_1.GoToCommand(),
            new FollowCommand_1.FollowCommand(),
            new KillOnSight_1.KillOnSight(),
            new mineCommand_1.MineCommand(),
            new StopCommand_1.StopCommand(),
            new SimonSaysCommand_1.SimonSaysCommand(),
            new SetSkinCommand_1.SetSkinCommand(),
            new PerpetualFollowCommand_1.PerpetualFollowCommand(),
            new EquipCommand_1.EquipCommand(),
            new ArmorEquip_1.ArmorEquipCommand(),
            new GetAllInfoCommand_1.GetAllInfoCommand(),
        ].forEach((cmd) => this.registerCommand(cmd));
        this.messageRouter = new MessageRouter_1.MessageRouter(this, this.commands);
    }
    getMemory() {
        return JSON.parse(fs_1.default.readFileSync(this.config.memory, "utf-8"));
    }
    getCommands() {
        return this.commands;
    }
    getName() {
        return this.name;
    }
    getCurrentTask() {
        return this.currentTask;
    }
    getPreviousTask() {
        return this.previousTask;
    }
    registerCommand(command) {
        this.commands.set(command.name, command);
    }
    processUserMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            message = message.replace(`<${this.name}>`, "");
            let res = yield this.model.generate(message, {}, (response) => {
                this.sendChat(response);
                this.newAction(response, message);
                return response;
            });
        });
    }
    newAction(action, message) {
        this.sendChat(`New action: ${action}`);
    }
    processUserCommand(message) {
        // if (username === this.name) return;
        // if (username !== "oWolves") return; // TODO: Remove this line
        const commandText = this.messageRouter
            .extractUserCommandText(message)
            .trim();
        // this.sendChat(`Received command: ${commandText}`);
        // Use MessageRouter to deconstruct the command
        const { commandName, args } = this.messageRouter.deconstructCommand(commandText.slice(1));
        // this.sendChat(`Command name: ${commandName}`);
        // this.sendChat(`Command args: ${args.join(", ")}`);
        if (this.pendingCommand && commandName !== "stop")
            return this.sendChat(`Still processing previous command.`);
        const command = this.commands.get(commandName);
        if (!command)
            return this.sendChat(`Unknown command: ${commandName}`);
        // this.sendChat(`Executing command: ${commandName} ${args.join(" ")}`);
        this.pendingCommand = true;
        Promise.resolve(command.execute(this, ...args))
            .catch((err) => this.sendChat(`Command error: ${err.message}`))
            .finally(() => {
            this.pendingCommand = false;
            this.lastCommandMessage = message;
            this.lastCommand = commandName;
        });
        this.lastCommand = commandName;
        this.lastCommandMessage = message;
    }
    processAgentMessage(sender, message) {
        const parsedMessage = this.messageRouter.parseAgentMessage(message);
        if (!parsedMessage)
            return;
        // Use MessageRouter to deconstruct the command
        const { commandName: command, args } = this.messageRouter.deconstructCommand(parsedMessage.content);
        switch (command) {
            case "startconvo":
                ConversationManager_1.ConversationManager.getInstance().startConversation(this.name, sender);
                this.sendChat(`Started conversation with ${sender}`);
                break;
            case "endconvo":
                ConversationManager_1.ConversationManager.getInstance().endConversation(this.name, sender);
                this.sendChat(`Ended conversation with ${sender}`);
                break;
            case "goal":
                this.processSharedGoal(args, sender);
                break;
            default:
                this.sendChat(`Unknown agent command: ${command}`);
        }
    }
    processSharedGoal(args, sender) {
        var _a;
        const goal = (_a = args[0]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        const goalArgs = args.slice(1);
        if (goal === "mine" && this.currentTask !== "mine") {
            this.sendChat(`Joining ${sender} to mine ${goalArgs.join(" ")}`);
            this.executeCommand("mine", ...goalArgs);
        }
        else {
            this.sendChat(`Don't know how to help with ${goal}`);
        }
    }
    executeCommand(commandName, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = this.commands.get(commandName);
            if (!command)
                return this.sendChat(`Unknown command: ${commandName}`);
            this.pendingCommand = true;
            yield command.execute(this, ...args);
            this.pendingCommand = false;
            this.lastCommandMessage = commandName;
        });
    }
    initBotInfo() {
        const { bot } = this;
        this.botInfo = {
            name: this.name,
            model: this.config.model,
            health: bot.health,
            position: bot.entity.position,
            height: bot.entity.height,
            rotation: { yaw: bot.entity.yaw, pitch: bot.entity.pitch },
            dimension: bot.game.dimension,
            gamemode: bot.game.gameMode,
            food: bot.food,
            heldItem: bot.entity.heldItem,
            level: bot.experience.level,
            experience: bot.experience.points,
            inventory: bot.inventory.items(),
            inventorySize: bot.inventory.slots.length,
            uuid: bot.entity.id || -1,
        };
    }
    updateBotInfo() {
        if (!this.botInfo)
            return;
        Object.assign(this.botInfo, {
            health: this.bot.health,
            model: this.config.model,
            position: this.bot.entity.position,
            height: this.bot.entity.height,
            rotation: {
                yaw: this.bot.entity.yaw,
                pitch: this.bot.entity.pitch,
            },
            dimension: this.bot.game.dimension,
            gamemode: this.bot.game.gameMode,
            food: this.bot.food,
            heldItem: this.bot.entity.heldItem,
            level: this.bot.experience.level,
            experience: this.bot.experience.points,
            inventory: this.bot.inventory.items(),
            uuid: this.bot.entity.id,
        });
    }
    sendChat(message) {
        this.bot.chat(message);
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
    getLastCommandName() {
        return this.lastCommand;
    }
    getMessageRouter() {
        return this.messageRouter;
    }
    loadConfig(configPath) {
        return JSON.parse(fs_1.default.readFileSync(configPath, "utf-8"));
    }
}
exports.Agent = Agent;
