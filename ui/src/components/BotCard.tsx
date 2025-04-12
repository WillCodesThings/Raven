import React from "react";

const BotCard = ({ bot }) => {
  return (
    <div>
      <h2>{bot.name}</h2>
      <p>Health: {bot.health}</p>
      <p>
        Position: {bot.position.x}, {bot.position.y}, {bot.position.z}
      </p>
      {/* Add more bot details as needed */}
    </div>
  );
};

export default BotCard;
