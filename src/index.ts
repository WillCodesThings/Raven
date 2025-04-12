import { pathfinder } from "mineflayer-pathfinder";
import { plugin } from "mineflayer-pvp";
import { AgentManager } from "./agentManager";

AgentManager.createAgent(
  "Lily",
  "./data/Lily_config.json",
  "localhost",
  25565,
  [pathfinder, plugin]
);

/*

making a paper server,
please hold

*/
