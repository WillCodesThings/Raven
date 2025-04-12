"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mineflayer_pathfinder_1 = require("mineflayer-pathfinder");
const mineflayer_pvp_1 = require("mineflayer-pvp");
const agentManager_1 = require("./agentManager");
agentManager_1.AgentManager.createAgent("Lily", "./data/Lily_config.json", "localhost", 25565, [mineflayer_pathfinder_1.pathfinder, mineflayer_pvp_1.plugin]);
/*

making a paper server,
please hold

*/
