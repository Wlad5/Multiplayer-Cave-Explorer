import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Game } from './game/Game';

const app = express();
const port = 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});


const game = new Game();
let gameEnded = false;
let turnTimeLeft = 10000;
let gameTimeLeft = 1 * 60 * 1000;
let currentPlayerId: string | null = null;
let turnTimer: NodeJS.Timeout | null = null;
let gameTimer: NodeJS.Timeout | null = null;

io.on('connection', (socket) => {
  startGameTimer();
  console.log(`A user connected: ${socket.id}`);
  game.addPlayer(socket.id);

  const newPlayer = game.getPlayers().get(socket.id);
  io.emit('playerAdded', {
    id: newPlayer?.getId(),
    x: newPlayer?.getX(),
    y: newPlayer?.getY(),
    direction: newPlayer?.getDirection(),
    score: newPlayer?.getScore(),
  });

  if (!currentPlayerId) {
    currentPlayerId = socket.id;
    startTurnTimer(currentPlayerId);
  }

  socket.emit('playersUpdated', Array.from(game.getPlayers().values()).map(player => ({
    id: player.getId(),
    x: player.getX(),
    y: player.getY(),
    direction: player.getDirection(),
    score: player.getScore(),
  })));

  socket.on('playerMove', ({ playerId, move }) => {
    if (gameEnded) {
      console.log('Game has ended!');
      return;
    }
    if (playerId !== currentPlayerId) {
      console.log(`It's not player ${playerId}'s turn!`);
      socket.emit('message', `It's not your turn!`);
      return;
    }
    if (!game.getPlayers().has(playerId)) {
      return;
    }
    clearTimeout(turnTimer!);
    const resultMessage = game.playMove(move, playerId);
    const updatedGrid = game.getHiddenGrid();
    io.emit('gameState', updatedGrid);
    io.emit('message', resultMessage);
    nextPlayer();
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    game.removePlayer(socket.id);
    io.emit('playerRemoved', socket.id);
    console.log(game.getPlayers());
    io.emit('gameState', game.getGrid());

    if (currentPlayerId === socket.id) {
      const players = Array.from(game.getPlayers().keys());
      if (players.length > 0) {
        currentPlayerId = players[0];
        startTurnTimer(currentPlayerId);
      } else {
        currentPlayerId = null;
        clearInterval(gameTimer!);
        endGame();
      }
    }
    io.emit('currentPlayer', currentPlayerId);
  });
});

const startGameTimer = () => {
  if (gameTimer) return;
  gameTimer = setInterval(() => {
    gameTimeLeft -= 1000;
    io.emit('gameTimeUpdate', gameTimeLeft);
    if (gameTimeLeft <= 0) {
      clearInterval(gameTimer!);
      endGame();
    }
  }, 1000);
};

const startTurnTimer = (playerId: string) => {
  if (gameEnded || gameTimeLeft <= 0) {
    console.log('The game has ended!')
    return;
  }
  currentPlayerId = playerId;
  turnTimeLeft = 10000;
  io.emit('turnTimerUpdate', { playerId, timeLeft: turnTimeLeft });
  if (turnTimer) clearInterval(turnTimer);
  turnTimer = setInterval(() => {
    turnTimeLeft -= 1000;
    io.emit('turnTimerUpdate', { playerId, timeLeft: turnTimeLeft });
    if (turnTimeLeft <= 0) {
      clearInterval(turnTimer!);
      io.emit('turnMessage', `Player ${playerId} ran out of time!`);
      nextPlayer();
    }
  }, 1000);
};

const nextPlayer = () => {
  const players = Array.from(game.getPlayers().keys());
  if (players.length === 0) {
    console.error("No players left in the game!");
    currentPlayerId = null;
    return;
  }
  if (currentPlayerId) {
    io.emit('turnTimerUpdate', {playerId: currentPlayerId, timeLeft: 0});
  }
  const currentPlayerIndex = players.indexOf(currentPlayerId!);
  const nextPlayerIndex = currentPlayerIndex === -1
    ? 0
    : (currentPlayerIndex + 1) % players.length;
  const nextPlayerId = players[nextPlayerIndex];
  const nextPlayer = game.getPlayers().get(nextPlayerId);
  currentPlayerId = nextPlayerId;
  io.emit('currentPlayer', { id: currentPlayerId, x: nextPlayer?.getX(), y: nextPlayer?.getY() });
  startTurnTimer(nextPlayerId);
};

const endGame = () => {
  gameEnded = true;
  if (turnTimer) {
    clearInterval(turnTimer);
    io.emit('turnTimerUpdate', { playerId: currentPlayerId, timeLeft: 0 });
    turnTimer = null;
  }
  const playerScores = Array.from(game.getPlayers().values()).map(player => ({
    playerId: player.getId(),
    score: player.getScore(),
  }));
  io.emit('gameEnded', { playersScores: playerScores });
  io.emit('message', 'Game Over!');
};

httpServer.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});