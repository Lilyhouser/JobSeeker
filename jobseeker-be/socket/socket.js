const { Server } = require("socket.io");
const allowedOrigins = require("../config/allowedOrigins");

let ioInstance;

const initSocket = (server) => {
  if (ioInstance) {
    console.log("Socket Io already initialized. Return existing one");
    return ioInstance;
  }
  console.log("connect socket io...");

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    socket.userId = socket.handshake.auth.userId;
    next();
  });

  io.on("connection", (socket) => {
    console.log("A user connected: " + socket.userId);
    socket.join(socket.userId);

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });

  ioInstance = io;
  return io;
};

module.exports = {
  initSocket,
  getIo: () => {
    if (!ioInstance) {
      throw new Error("Socket.IO not initialized! Call initSocket first.");
    }
    return ioInstance;
  },
};
