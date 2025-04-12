import React from "react";
import BotCard from "./BotCard";

const BotTabs = ({ bots }) => {
  return (
    <div>
      {bots.map((bot) => (
        <BotCard key={bot.name} bot={bot} />
      ))}
    </div>
  );
};

export default BotTabs;
