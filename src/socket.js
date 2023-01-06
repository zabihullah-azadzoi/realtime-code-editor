import { io } from "socket.io-client";

export const socketInit = async () => {
  const options = {
    "force new Connection": true,
    reconnectionAttempt: "Infinity",
    timeout: 10000,
    transport: ["websocket"],
  };

  return io(process.env.REACT_APP_SERVER_URL, options);
};
