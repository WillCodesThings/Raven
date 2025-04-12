import React, { useEffect, useState } from "react";
import { fetchBots } from "./api";
import BotTabs from "./components/BotTabs";
import CreateBotForm from "./components/CreateBotForm";

const App = () => {
  const [bots, setBots] = useState([]);

  useEffect(() => {
    const loadBots = async () => {
      const response = await fetchBots();
      setBots(response.data);
    };
    loadBots();
  }, []);

  return (
    <div>
      <h1>Minecraft Bot Manager</h1>
      <CreateBotForm />
      <BotTabs bots={bots} />
    </div>
  );
};

export default App;
