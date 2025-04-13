"use strict";
/*
    Need to spawn bot workers, as mineflayer is not thread-safe.
*/
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const Agent_1 = require("./utils/Agent");
const { name, configPath, server, port, plugins } = worker_threads_1.workerData;
// Initialize the agent inside the worker
const agent = new Agent_1.Agent(configPath, name, server, port, plugins);
