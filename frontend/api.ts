import axios from "axios";

const api = axios.create({
  // baseURL: import.meta.env.VITE_API_URL,
  baseURL: "https://ausar2.onrender.com",
  withCredentials: true,
});

export default api;
