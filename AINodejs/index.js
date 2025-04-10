const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const pvp = require("mineflayer-pvp").plugin;
const express = require("express");
const bodyParser = require("body-parser");

const { Ollama } = require("ollama-node");
const ollama = new Ollama();
ollama.setModel("llama3");

const { findNearbyEnemies, attackNearestEnemy } = require("./pathfinding");

const app = express();
app.use(bodyParser.json());

const bot = mineflayer.createBot({
  host: "localhost",
  port: 25565,
  username: "wolvesBot",
  version: "1.21.4",
});

let currentTarget = null;
let followInterval = null; // Variable to store the interval ID

bot.loadPlugin(pathfinder);
bot.loadPlugin(pvp);

bot.once("spawn", () => {
  const mcData = require("minecraft-data")(bot.version);
  const defaultMove = new Movements(bot, mcData);
  bot.pathfinder.setMovements(defaultMove);

  console.log("[BOT] Spawned in world.");
});

bot.on("whisper", async (username, message, rawMessage, jsonMsg, matches) => {
  if (username === bot.username) return; // Ignore self

  console.log(`[WHISPER] From ${username}: ${message}`);

  // Example: Check for specific commands
  if (message.startsWith("attack")) {
    const targetName = message.split(" ")[1];
    attackNearestEnemy(targetName);
    console.log(`[ATTACK] Attacking ${targetName}`);
  } else if (message.startsWith("goTo")) {
    const coords = message.match(/goTo\(([-\d]+),\s*([-\d]+),\s*([-\d]+)\)/);
    if (coords) {
      const x = parseInt(coords[1]);
      const y = parseInt(coords[2]);
      const z = parseInt(coords[3]);
      const goal = new goals.GoalBlock(x, y, z);
      bot.pathfinder.setGoal(goal);
      console.log(`[BOT] Moving to ${x}, ${y}, ${z}`);
    } else {
      console.log("[ERROR] Invalid goTo() format.");
    }
  } else if (message.startsWith("follow")) {
    const targetName = message.split(" ")[1];
    const target = bot.players[targetName]?.entity;

    if (target) {
      // Start following the player (with a tolerance of 1 block)
      const followGoal = new goals.GoalFollow(target, 1);
      bot.pathfinder.setGoal(followGoal);
      console.log(`[BOT] Following ${targetName}`);

      // Continuously follow the player by resetting the goal after reaching it
      followInterval = setInterval(() => {
        bot.pathfinder.setGoal(followGoal);
        console.log(`[BOT] Following ${targetName} continuously`);
      }, 1000); // Check every second (adjustable)
    }
  } else if (message.startsWith("stop")) {
    clearInterval(followInterval);

    currentTarget = null; // Clear the current target
    followInterval = null; // Clear the follow interval

    bot.pvp.stop();
    bot.pathfinder.setGoal(null);
    console.log("[BOT] Stopped moving.");
  } else if (message.startsWith("say")) {
    const text = message.split(" ").slice(1).join(" ");
    bot.chat(text);
    console.log(`[BOT] Saying: ${text}`);
  } else if (message.startsWith("help")) {
    const helpText = `
    Available commands:
    - attack <entity>: Attack the nearest entity of the specified type.
    - goTo(x, y, z): Move to the specified coordinates.
    - follow <player>: Follow the specified player.
    - stop: Stop moving.
    - say <message>: Say a message in chat.
    - help: Show this help message.
    `;
    bot.chat(helpText);
    console.log("[BOT] Help requested.");
  } else {
    await ollama
      .generate(message)
      .then((response) => {
        console.log("[BOT] Ollama response:", response);
        bot.chat(response.output.toString());
      })
      .catch((error) => {
        console.error("[BOT] Error with Ollama:", error);
      });
  }

  // Optional: respond or trigger logic
  bot.chat(`/msg ${username} I received your message: "${message}"`);
});

const mcData = require("minecraft-data")(bot.version);

// console.log("[BOT] Enemies found: ", enemies);

// // never use api
// app.post("/command", async (req, res) => {
//   const cmd = req.body.command.trim();

//   if (cmd.startsWith("goTO(")) {
//     // Parse goTO(x, y, z)
//     const match = cmd.match(/goTO\(([-\d]+),\s*([-\d]+),\s*([-\d]+)\)/);
//     if (match) {
//       const x = parseInt(match[1]);
//       const y = parseInt(match[2]);
//       const z = parseInt(match[3]);

//       const goal = new goals.GoalBlock(x, y, z);
//       bot.pathfinder.setGoal(goal);
//       console.log(`[BOT] Moving to ${x}, ${y}, ${z}`);
//     } else {
//       console.log("[ERROR] Invalid goTO() format.");
//     }
//   } else {
//     // Default fallback: just say it in chat
//     bot.chat(cmd);
//     console.log("[COMMAND]", cmd);
//   }

//   res.send({ status: "ok" });
// });

app.listen(3001, () => console.log("[BOT] Listening on port 3001"));
