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
Object.defineProperty(exports, "__esModule", { value: true });
const Agent_1 = require("./Agent");
class commandScheduler {
    constructor() {
        this.queue = [];
        this.isRunning = false;
    }
    schedule(command) {
        this.queue.push(command);
        this.runNext();
    }
    static getInstance() {
        if (!commandScheduler.instance) {
            commandScheduler.instance = new commandScheduler();
        }
        return commandScheduler.instance;
    }
    runNext() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isRunning || this.queue.length === 0) {
                return;
            }
            this.isRunning = true;
            const command = this.queue.shift();
            if (command) {
                yield command.execute(Agent_1.Agent);
            }
            this.isRunning = false;
            this.runNext();
        });
    }
}
commandScheduler.instance = null;
