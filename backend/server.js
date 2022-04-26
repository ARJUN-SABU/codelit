const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();

//middlewares
app.use(
  cors({
    origin: "*",
  })
);

//Request Routes
app.get("/", (req, res) => {
  res.send("Hello You are connected to the backend");
});

const server_new = app.listen(process.env.PORT || 3001, () => {
  console.log("Server is up and running!");
});

//----- Socket.io Settings ---------
const io = new Server(server_new, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  io.sockets.to(socket.id).emit("my-socket-id", { socketId: socket.id });

  socket.on("place-key", (data) => {
    // socket.broadcast.emit("place-key", data);
    io.sockets.to(data.friendSocketId).emit("place-key", data);
  });

  socket.on("handle-paste", (data) => {
    // socket.broadcast.emit("handle-paste", data);
    io.sockets.to(data.friendSocketId).emit("handle-paste", data);
  });

  socket.on("load-code", (data) => {
    io.sockets.to(data.friendSocketId).emit("load-code", data);
  });
});
