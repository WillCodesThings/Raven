import React, { useState } from "react";
import { createBot } from "../api";

const CreateBotForm = () => {
  const [name, setName] = useState("");
  const [config, setConfig] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createBot({ name, config });
    // Refresh bot list or provide feedback
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Bot Name"
      />
      {/* Add more config inputs as needed */}
      <button type="submit">Create Bot</button>
    </form>
  );
};

export default CreateBotForm;
