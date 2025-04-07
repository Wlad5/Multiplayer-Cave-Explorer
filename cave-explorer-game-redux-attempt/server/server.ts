import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { Game } from "./game/Game";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
export const PORT = 3000;

const game = new Game();

io.on("connection", (socket: Socket) => {
  console.log(`Player connected: ${socket.id}`);

  const player = game.addPlayer(socket.id);
  io.emit("gameState", game.getGameState());

  socket.on("playerMove", (move: string) => {
    game.handleMove(move, socket.id);
    io.emit("gameState", game.getGameState());
  });

  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
    game.removePlayer(socket.id);
    io.emit("gameState", game.getGameState());
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});