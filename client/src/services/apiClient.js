import axios from "axios";

const api = axios.create({
  baseURL: "baseURL: https://weatherlink.onrender.com", // your backend
});

export default api;
