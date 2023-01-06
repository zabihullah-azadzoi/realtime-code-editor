const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server, {
  cors: {
    origin: process.env.CLIENT_SIDE_URL,
  },
});

app.use(cors());

const clients = {};
const getAllClientsInRoom = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: clients[socketId],
      };
    }
  );
};

io.on("connection", (socket) => {
  socket.on("join", ({ roomId, username }) => {
    socket.join(roomId);
    clients[socket.id] = username;

    const allMembersInRoom = getAllClientsInRoom(roomId);

    allMembersInRoom.forEach(({ socketId }) => {
      io.to(socketId).emit("joined", {
        clients: allMembersInRoom,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on("code_change", ({ roomId, code }) => {
    socket.in(roomId).emit("code_change", code);
  });

  socket.on("code_sync", ({ code, socketId }) => {
    io.to(socketId).emit("code_sync", code);
  });

  socket.on("output_changed", ({ output, roomId }) => {
    socket.in(roomId).emit("output_received", output);
  });

  socket.on("processing", ({ roomId, isProcessing }) => {
    socket.in(roomId).emit("processing", isProcessing);
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit("disconnected", {
        socketId: socket.id,
        username: clients[socket.id],
      });
    });
    delete clients[socket.id];
    socket.leave();
  });
});

const port = process.env.SERVER_PORT || 5000;
server.listen(port, () => {
  console.log(`Server is connected on port ${port}`);
});
