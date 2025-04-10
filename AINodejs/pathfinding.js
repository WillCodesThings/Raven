export function findNearbyEnemies(range = 100, EntityName) {
  let enemies = Object.entries(bot.entities).filter((entity) => {
    // console.log("[BOT] Entity: ", entity[1].name);

    // console.log(
    //   "[BOT] DISTANCE: " + entity[1].position.distanceTo(bot.entity.position)
    // );
    // console.log("[BOT] ENTITY: ", entity[1].type);
    // console.log("[BOT] NAME: ", entity[1].name);
    // console.log("[BOT] MATCHES: ", entity[1].name === EntityName);

    // console.log(entity[1]);
    if (entity[1].type === "player") {
      const targetPlayer = entity[1];

      if (!targetPlayer.username) return false; // Sometimes it's not yet fully loaded

      console.log("[BOT] Found player:", targetPlayer.username);

      return (
        targetPlayer.username !== bot.username &&
        targetPlayer.username.toLowerCase() === EntityName.toLowerCase()
      );
    } else {
      return entity[1].name === EntityName;
    }
  });

  //ok

  // console.log("[BOT] Enemies found: ", enemies);
  // Filter out the ones that are too far away

  enemies = enemies.filter((entity) => {
    const distance = entity[1].position.distanceTo(bot.entity.position);
    return distance <= range;
  });

  // Sort by distance
  enemies.sort((a, b) => {
    return (
      a[1].position.distanceTo(bot.entity.position) -
      b[1].position.distanceTo(bot.entity.position)
    );
  });

  enemies = enemies.map((entity) => {
    return entity[1];
  });
  console.log("[BOT] Enemies within range: ", enemies);

  return enemies;
}

export function attackNearestEnemy(name) {
  // Find the nearest enemy within a specified range
  const enemies = findNearbyEnemies(10, name);

  // console.log("[BOT] Enemies found: ", enemies);

  if (enemies.length === 0) {
    console.log("[BOT] No enemies found nearby.");
    return;
  }

  const target = enemies[0]; // Get the first enemy (nearest)
  console.log("[BOT] Target enemy: " + target);

  if (target) {
    console.log(`[ATTACK] Engaging ${target.name} at ${target.position}`);
    bot.pvp.attack(target);
  } else {
    console.log("[ATTACK] No enemies nearby.");
  }
}
