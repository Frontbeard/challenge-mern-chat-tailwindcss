import express from "express";
import { Server as SocketServer } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import router from "./routes/message.js";

const url = process.env.MONGODB_URI;

mongoose.Promise = global.Promise;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api", router);

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

const io = new SocketServer(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(socket.id);
  console.log("Cliente conectado");

  socket.on("message", (message, nickname) => {
    socket.broadcast.emit("message", {
      body: message,
      from: nickname,
    });
  });

  socket.on("typing", (data) => {
    const { isTyping, user } = data;
    socket.broadcast.emit("typing", { isTyping, user });
  });
});

mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Conectado con éxito a la base de datos");
  })
  .catch((error) => {
    console.error("Error conectando a la base de datos:", error);
  });

export default app;
