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

const mineflayerViewer = prismarineViewer.mineflayer;
export function addBrowserViewer(bot: Bot, count_id: number) {
  mineflayerViewer(bot, { port: 3000 + count_id, firstPerson: true });
}

let botsMade = 0;

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
export class Agent {
  public name: string;
  public bot: Bot;
  public config: AgentConfig;
  public commands = new Map<string, Command>();
  public currentTask: string;
  public previousTask: string;
  private lastCommandMessage: string | null = null;
  private lastCommand: string | null = null;
  private pendingCommand = false;

  private botInfo: {
    name: string;
    health: number;
    position: { x: number; y: number; z: number };
    height: number;
    yaw: number;
    pitch: number;
    dimension: string;
    gamemode: string;
    food: number;
    heldItem: Item;
    level: number;
    experience: number;
    inventory: Item[];
    inventorySize: number;
  };

  constructor(
    configPath: string,
    name: string,
    server: string,
    port: number,
    plugins: Plugin[],
    botsMade: number = 0
  ) {
    // server webviews differently
    botsMade++;
    this.bot = createBot({
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
    this.registerCommand(new AttackCommand());
    this.registerCommand(new GoToCommand());
    this.registerCommand(new FollowCommand());
    this.registerCommand(new KillOnSight());
    this.registerCommand(new MineCommand());
    this.registerCommand(new StopCommand());

    // Set up Listeners
    this.bot.on("spawn", () => {
      const defaultMove = new Movements(this.bot);
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
    this.bot.on("chat", (username: string, message: string) => {
      this.handleChat(username, message);
    });

    this.bot.on("physicsTick", () => {
      this.updateBotInfo();
    });

    this.bot.on("kicked", (reason: string) => {
      this.config.wasKicked = true;
      this.config.cleanDisconnect = false;
      this.config.disconnect = true;
      this.config.shouldRejoin = true;
    });

    this.bot.on("end", () => {
      if (this.config.shouldRejoin) {
        this.bot = createBot({
          host: server,
          port: port,
          username: name,
          version: "1.21.4",
        });
        this.bot.loadPlugins(plugins);
      }
    });
  }

  public registerCommand(command: Command) {
    this.commands.set(command.name, command);
  }

  public getLastCommandName() {
    return this.lastCommand;
  }

  public loadConfig(configPath: string): AgentConfig {
    const raw = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(raw);
  }

  public getBot(): Bot {
    return this.bot;
  }

  public getConfig(): AgentConfig {
    return this.config;
  }

  public getBotInfo() {
    return this.botInfo;
  }

  public sendChat(message: string) {
    this.bot.chat(message);
  }

  public handleChat(username: string, message: string) {
    if (username === this.name) return;

    const command = message.split(" ")[0].toLowerCase();
    const args = message.split(" ").slice(1);

    if (this.commands.has(command)) {
      this.pendingCommand = true;
      this.commands.get(command)?.execute(this, ...args);
      this.lastCommandMessage = message;
      this.lastCommand = command;
      this.pendingCommand = false;
    } else {
      this.sendChat(`Unknown command: ${command}`);
    }
  }

  private updateBotInfo() {
    if (!this.botInfo) return;

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

  private getNextAction() {
    // gonna be the AI stuff

    // Logic to determine the next action based on the current task
    // This is a placeholder and should be replaced with actual logic
    return "idle";
  }

  public async executeCommand(command: string, ...args: any[]) {
    if (this.commands.has(command)) {
      this.pendingCommand = true;
      await this.commands.get(command)?.execute(this, ...args);
      this.lastCommandMessage = command;
      this.pendingCommand = false;
    } else {
      this.sendChat(`Unknown command: ${command}`);
    }
  }
}
