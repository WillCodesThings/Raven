import axios from "axios";

export const fetchBots = async () => axios.get("/api/bots");
export const createBot = async (data) => axios.post("/api/bots", data);
export const getBot = async (name: string) => axios.get(`/api/bots/${name}`);
export const sendChat = async (name: string, message: string) =>
  axios.post(`/api/bots/${name}/chat`, { message });
export const deleteBot = async (name: string) =>
  axios.delete(`/api/bots/${name}`);
