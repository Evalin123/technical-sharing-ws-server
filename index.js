const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const port = 3000;
const server = http.createServer(app).listen(port, () => {
  console.log("open server!");
});

const io = socketio(server);

io.on("connection", (socket) => {
  /*只回傳給發送訊息的 client*/
  socket.on("getMessage", (message) => {
    socket.emit("getMessage", message);
  });

  /*回傳給所有連結著的 client*/
  socket.on("getMessageAll", (message) => {
    io.sockets.emit("getMessageAll", message); //io.sockets === io.of("/")
  });

  /*回傳給除了發送者外所有連結著的 client*/
  socket.on("getMessageLess", (message) => {
    socket.broadcast.emit("getMessageLess", message);
  });

  socket.on("addRoom", (room) => {
    const roomToArr = [...socket.rooms];
    const nowRoom = roomToArr.find((room) => {
      return room !== socket.id;
    });

    if (nowRoom) {
      socket.leave(nowRoom);
    }
    socket.join(room);
    socket.to(room).emit("addRoom", "已有新人加入聊天室！");
    io.sockets.in(room).emit("addRoom", "已加入聊天室！");
  });

  socket.on("send", (message) => {
    if (message.room) {
      io.sockets.in(message.room).emit("receivedMessage", `${message.message}`);
    }
  });

  socket.on("disConnection", (message) => {
    const leaveRoomArr = [...socket.rooms];
    const room = leaveRoomArr.find((room) => {
      return room !== socket.id;
    });

    socket.to(room).emit("leaveRoom", `${message} 已離開聊天！`);
    socket.emit("disConnection", "");
  });

  socket.on("disconnect", () => {
    console.log("disconnection");
  });
});
