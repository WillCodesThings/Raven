import { Bot, createBot } from "mineflayer";
import { pathfinder, Movements } from "mineflayer-pathfinder";
import fs from "fs";
import path from "path";
import { Command } from "./command";
import { Plugin } from "mineflayer";
import { AttackCommand } from "../commands/AttackCommand";
import { GoToCommand } from "../commands/GoToCommand";
import { FollowCommand } from "../commands/FollowCommand";
import prismarineViewer from "prismarine-viewer";
import { Item } from "prismarine-item";
import { Vec3 } from "vec3";
import { KillOnSight } from "../commands/KillOnSight";
import { StopCommand } from "../commands/StopCommand";
import { MineCommand } from "../commands/mineCommand";
import { ConversationManager } from "./ConversationManager";
import { MessageRouter } from "./MessageRouter";
import { SimonSaysCommand } from "../commands/SimonSaysCommand";
import { SetSkinCommand } from "../commands/SetSkinCommand";
import { PerpetualFollowCommand } from "../commands/PerpetualFollowCommand";
import { EquipCommand } from "../commands/EquipCommand";
import { ArmorEquipCommand } from "../commands/ArmorEquip";
import { GetAllInfoCommand } from "../commands/GetAllInfoCommand";
import { AIModel } from "./AIModel";

const mineflayerViewer = prismarineViewer.mineflayer;
export function addBrowserViewer(bot: Bot, count_id: number) {
  mineflayerViewer(bot, { port: 3000 + count_id, firstPerson: true });
}

let botsMade = 0;

export interface LoginInfo {
  username: string;
  password: string;
  email: string;
}
export interface AgentConfig {
  name: string;
  model: string;
  currentTask: string;
  previousTask: string;
  memory: string;
  systemPrompt: string;
  canExecuteCode: boolean;
  wasKicked: boolean;
  cleanDisconnect: boolean;
  disconnect: boolean;
  shouldRejoin: boolean;
}

interface BotInfo {
  name: string;
  health: number;
  model: string;
  // maxHealth: number;
  // maxFood: number;
  position: Vec3;
  rotation: {
    yaw: number;
    pitch: number;
  };
  height: number;
  dimension: string;
  gamemode: string;
  food: number;
  heldItem: Item | null;
  level: number;
  experience: number;
  inventory: Item[] | [];
  inventorySize: number;
  uuid: number;
}

export class Agent {
  private name: string;
  private bot: Bot;

  private model: AIModel;

  private config: AgentConfig;
  private commands = new Map<string, Command>();
  private currentTask: string;
  private previousTask: string;
  private messageRouter: MessageRouter;

  private lastCommandMessage: string | null = null;
  private lastCommand: string | null = null;
  private pendingCommand = false;

  private botInfo: BotInfo;

  constructor(
    configPath: string,
    loginInfo: LoginInfo,
    server: string,
    port: number,
    plugins: Plugin[],
    model: AIModel
  ) {
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
      position: new Vec3(0, 0, 0),
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
    }

    this.bot = this.createAndInitBot(loginInfo, server, port, plugins);
    this.registerDefaultCommands();

    console.log(
      `Agent ${this.name} created and connected to ${server}:${port}`
    );
  }

  private createAndInitBot(
    loginInfo: LoginInfo,
    server: string,
    port: number,
    plugins: Plugin[]
  ) {
    let bot: Bot;
    if (loginInfo.email && loginInfo.password) {
      // Microsoft authentication
      bot = createBot({
        host: server,
        port,
        username: loginInfo.username,
        password: loginInfo.password,
        auth: "microsoft",
        version: "1.21.4",
      });
    } else {
      // Offline mode
      bot = createBot({
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

  private setupListeners(bot: Bot) {
    bot.on("login", () => {
      //   setImmediate(() => addBrowserViewer(bot, ++botsMade));
    });

    bot.on("spawn", () => {
      bot.pathfinder.setMovements(new Movements(bot));
      this.initBotInfo();
      this.sendChat(
        `Hello! I am ${this.name}. Current task: ${this.currentTask}`
      );
    });

    bot.on("death", () => this.sendChat("I have died!"));
    bot.on("chat", (username: string, message: string) =>
      this.messageRouter.routeMessage(username, message)
    );
    bot.on("physicsTick", () => this.updateBotInfo());
    bot.on("kicked", () => {
      this.config = {
        ...this.config,
        wasKicked: true,
        cleanDisconnect: false,
        disconnect: true,
        shouldRejoin: true,
      };
    });
  }

  private registerDefaultCommands() {
    [
      new AttackCommand(),
      new GoToCommand(),
      new FollowCommand(),
      new KillOnSight(),
      new MineCommand(),
      new StopCommand(),
      new SimonSaysCommand(),
      new SetSkinCommand(),
      new PerpetualFollowCommand(),
      new EquipCommand(),
      new ArmorEquipCommand(),
      new GetAllInfoCommand(),
    ].forEach((cmd) => this.registerCommand(cmd));

    this.messageRouter = new MessageRouter(this, this.commands);
    
    let modelSystemPrompt = this.model.getPrompt();

    this.model.setSystemPrompt(`

        You are an autonomous Minecraft agent named ${this.name}. Respond to natural language goals by outputting a sequence of mineflayer commands in the format: !command_name(arg1, arg2, ...)   Only respond with commands you can run. Do not explain unless asked. Examples: mine([diamond_ore], 10) -> !searchFor(iron_pickaxe,1) -> !mine(diamond_ore, 10)
        ${this.config.systemPrompt}

        List of commands:
        ${this.commands.keys().join(", ")}
        
        Current task: ${this.currentTask}
        Previous task: ${this.previousTask}

        Memory: ${JSON.stringify(this.getMemory())}
      `);
  }

  public getMemory() {
    return JSON.parse(fs.readFileSync(this.config.memory, "utf-8"));
  }

  public getCommands() {
    return this.commands;
  }
  public getName() {
    return this.name;
  }
  public getCurrentTask() {
    return this.currentTask;
  }
  public getPreviousTask() {
    return this.previousTask;
  }

  public registerCommand(command: Command) {
    this.commands.set(command.name, command);
  }

  public async processUserMessage(message: string) {
    message = message.replace(`<${this.name}>`, "")
    let res: string = await this.model.generate(message, {}, (response: string) => {
      this.sendChat(response);
      this.newAction(response, message);
      return response;
    });
    
  }

  public newAction(action: string, message: string) {
    this.sendChat(`New action: ${action}`);
  }

  public processUserCommand(message: string) {
    // if (username === this.name) return;
    // if (username !== "oWolves") return; // TODO: Remove this line

    const commandText = this.messageRouter
      .extractUserCommandText(message)
      .trim();

    // this.sendChat(`Received command: ${commandText}`);

    // Use MessageRouter to deconstruct the command
    const { commandName, args } = this.messageRouter.deconstructCommand(
      commandText.slice(1)
    );

    // this.sendChat(`Command name: ${commandName}`);
    // this.sendChat(`Command args: ${args.join(", ")}`);

    if (this.pendingCommand && commandName !== "stop")
      return this.sendChat(`Still processing previous command.`);

    const command = this.commands.get(commandName);
    if (!command) return this.sendChat(`Unknown command: ${commandName}`);

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

  public processAgentMessage(sender: string, message: string) {
    const parsedMessage = this.messageRouter.parseAgentMessage(message);
    if (!parsedMessage) return;

    // Use MessageRouter to deconstruct the command
    const { commandName: command, args } =
      this.messageRouter.deconstructCommand(parsedMessage.content);

    switch (command) {
      case "startconvo":
        ConversationManager.getInstance().startConversation(this.name, sender);
        this.sendChat(`Started conversation with ${sender}`);
        break;
      case "endconvo":
        ConversationManager.getInstance().endConversation(this.name, sender);
        this.sendChat(`Ended conversation with ${sender}`);
        break;
      case "goal":
        this.processSharedGoal(args, sender);
        break;
      default:
        this.sendChat(`Unknown agent command: ${command}`);
    }
  }

  public processSharedGoal(args: string[], sender: string) {
    const goal = args[0]?.toLowerCase();
    const goalArgs = args.slice(1);

    if (goal === "mine" && this.currentTask !== "mine") {
      this.sendChat(`Joining ${sender} to mine ${goalArgs.join(" ")}`);
      this.executeCommand("mine", ...goalArgs);
    } else {
      this.sendChat(`Don't know how to help with ${goal}`);
    }
  }

  public async executeCommand(commandName: string, ...args: any[]) {
    const command = this.commands.get(commandName);
    if (!command) return this.sendChat(`Unknown command: ${commandName}`);

    this.pendingCommand = true;
    await command.execute(this, ...args);
    this.pendingCommand = false;
    this.lastCommandMessage = commandName;
  }

  private initBotInfo() {
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

  private updateBotInfo() {
    if (!this.botInfo) return;
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

  public sendChat(message: string) {
    this.bot.chat(message);
  }

  public getBot() {
    return this.bot;
  }

  public getConfig() {
    return this.config;
  }

  public getBotInfo() {
    return this.botInfo;
  }

  public getLastCommandName() {
    return this.lastCommand;
  }

  public getMessageRouter() {
    return this.messageRouter;
  }

  private loadConfig(configPath: string): AgentConfig {
    return JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }
}
