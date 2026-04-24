const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const rooms = {};

function generateCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  socket.on("createRoom", (nickname, callback) => {
    const code = generateCode();
    rooms[code] = {
      players: {}
    };

    rooms[code].players[socket.id] = {
      x: 100,
      y: 100,
      nickname
    };

    socket.join(code);
    callback(code);
  });

  socket.on("joinRoom", ({ code, nickname }, callback) => {
    const room = rooms[code];

    if (!room || Object.keys(room.players).length >= 4) {
      return callback({ success: false });
    }

    room.players[socket.id] = {
      x: 100,
      y: 100,
      nickname
    };

    socket.join(code);
    callback({ success: true });

    io.to(code).emit("stateUpdate", room.players);
  });

  socket.on("move", ({ code, x, y }) => {
    const room = rooms[code];
    if (!room || !room.players[socket.id]) return;

    room.players[socket.id].x = x;
    room.players[socket.id].y = y;

    io.to(code).emit("stateUpdate", room.players);
  });

  socket.on("disconnect", () => {
    for (const code in rooms) {
      if (rooms[code].players[socket.id]) {
        delete rooms[code].players[socket.id];
        io.to(code).emit("stateUpdate", rooms[code].players);
      }
    }
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});