import { io } from "socket.io-client";

export const socketInit = async () => {
  const options = {
    "force new Connection": true,
    reconnectionAttempt: "Infinity",
    timeout: 10000,
    transport: ["websocket"],
  };

  return io("http://localhost:5000", options);
};
