import express from "express";
import morgan from "morgan";
import { Server as Socketserver } from "socket.io";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import router from "./routes/message.js";

const url =
  "mongodb+srv://Frontbeard:Fordfalcon1$@cluster0.ruuahj8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.Promise = global.Promise;

const app = express();
const PORT = 4000;

const server = http.createServer(app);
const io = new Socketserver(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/api", router);

mongoose
  .connect(url)
  .then(() => {
    console.log("Conectado con éxito");
    server.listen(PORT, () => {
      console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error conectando a la base de datos:", error);
  });
