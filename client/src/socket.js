// client/src/socket.js
import { io } from "socket.io-client";

const URL = process.env.REACT_APP_SOCKET_URL || "https://weatherlink.onrender.com";
export const socket = io(URL, { autoConnect: false });

// helper to safely join a user room once we have an id
export function joinUserRoom(userId) {
  if (!userId) return;
  if (!socket.connected) socket.connect();
  socket.emit("join-user", userId);
}
