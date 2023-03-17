const express = require("express");
const http = require("http");
const moment = require("moment");
const socketio = require("socket.io");

const app = express();
const port = 3000;
const server = http.createServer(app).listen(port, () => {
  console.log("open server!");
});

const io = socketio(server);

io.on("connection", (socket) => {
  /*只回傳給發送訊息的 client*/
  socket.on("getMessage", (clientMsg) => {
    const msg = `server: ${clientMsg}, time:${moment().valueOf()}`;
    socket.emit("getMessage", msg);
  });

  /*回傳給所有連結著的 client*/
  socket.on("getMessageAll", (clientMsg) => {
    const msg = `server: ${clientMsg}, time:${moment().valueOf()}`;
    io.sockets.emit("getMessageAll", msg); //io.sockets === io.of("/")
  });

  /*回傳給除了發送者外所有連結著的 client*/
  socket.on("getMessageLess", (clientMsg) => {
    const msg = `server: ${clientMsg}, time:${moment().valueOf()}`;
    socket.broadcast.emit("getMessageLess", msg);
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
