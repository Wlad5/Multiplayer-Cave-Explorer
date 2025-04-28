import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Game } from './game/Game';
import { v4 } from 'uuid';

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

const games = new Map<string, Game>();
const playerGameMap = new Map<string, string>();

io.on('connection', (socket) => {

  socket.on('createGame', ({ username }) => {
    startGameTimer();
    if (!currentPlayerId) {
      currentPlayerId = socket.id;
      startTurnTimer(currentPlayerId);
    }
    if (playerGameMap.has(socket.id)) {
      socket.emit('error', { message: `You are already in a game!` });
      return;
    }
    const gameId = v4();
    const newGame = new Game();
    games.set(gameId, newGame);
    playerGameMap.set(socket.id, gameId);
    newGame.addPlayer(socket.id, username);
    socket.join(gameId);
    const player = newGame.getPlayers().get(socket.id);
    const playerData = {
      id: player?.getId(),
      x: player?.getX(),
      y: player?.getY(),
      direction: player?.getDirection(),
      score: player?.getScore(),
      username,
    };
    socket.emit('gameCreated', { gameId });
    socket.emit('gameState', newGame.getHiddenGrid());
    io.to(gameId).emit('currentPlayer', { id: currentPlayerId, x: player?.getX(), y: player?.getY() });
    io.emit('activeGames', Array.from(games.keys()));
    io.to(gameId).emit('message', `Game ${gameId} created!`);
    io.to(gameId).emit('playerAdded', playerData);
    console.log(`Game ${gameId} created by player ${socket.id}`);
});

socket.on('joinGame', ({ gameId, username }) => {
  if (!games.has(gameId)) {
      socket.emit('error', { message: `Game not found!` });
      return;
  }
  if (playerGameMap.has(socket.id)) {
      socket.emit('error', { message: `You are already in a game!` });
      return;
  }
  const game = games.get(gameId);
  if (!game) {
      socket.emit('error', { message: `Game not found!` });
      return;
  }
  game.addPlayer(socket.id, username);
  playerGameMap.set(socket.id, gameId);
  socket.join(gameId);
  const newPlayer = game.getPlayers().get(socket.id);
  const newPlayerData = {
      id: newPlayer?.getId(),
      x: newPlayer?.getX(),
      y: newPlayer?.getY(),
      direction: newPlayer?.getDirection(),
      score: newPlayer?.getScore(),
      username: newPlayer?.getUsername(),
  };
  io.to(gameId).emit('playerAdded', newPlayerData);
  const players = Array.from(game.getPlayers().values()).map(player => ({
      id: player.getId(),
      x: player.getX(),
      y: player.getY(),
      direction: player.getDirection(),
      score: player.getScore(),
      username: player.getUsername(),
  }));
  socket.emit('playersUpdated', players);
  socket.emit('gameState', game.getHiddenGrid());
  if (!currentPlayerId) {
      currentPlayerId = socket.id;
      startTurnTimer(currentPlayerId);
  }
  console.log(`Player ${socket.id} joined game ${gameId}`);
});

  socket.on('listGames', () => {
    const activeGames = Array.from(games.keys());
    socket.emit('activeGames', activeGames);
  })

  socket.on('playerMove', ({move, playerId}) => {
    const gameId = playerGameMap.get(socket.id);
    const game = games.get(gameId!);
    if (!gameId || !games.has(gameId)) {
      socket.emit('error', {message: `You are not in a game!`});
      return;
    }
    if (gameEnded) {
      console.log('Game has ended!');
      return;
    }
    if (playerId !== currentPlayerId) {
      console.log(`It's not player ${playerId}'s turn!`);
      socket.emit('message', `It's not your turn!`);
      return;
    }
    if (!game?.getPlayers().has(playerId)) {
      return;
    }
    clearInterval(turnTimer!);
    const resultMessage = game?.playMove(move, socket.id);
    const updatedGrid = game?.getHiddenGrid();
    io.to(gameId).emit('gameState', updatedGrid);
    io.to(gameId).emit('message', resultMessage);
    nextPlayer();
  })

  socket.on('leaveGame', () => {
    const gameId = playerGameMap.get(socket.id);
    if (!gameId || !games.has(gameId)) {
      socket.emit('error', {message: `You are not in a game!`});
      return;
    }
    const game = games.get(gameId);
    game?.removePlayer(socket.id);
    playerGameMap.delete(socket.id);
    socket.leave(gameId);
    io.to(gameId).emit('playerLeft', socket.id);
    console.log(`Player ${socket.id} left game ${gameId}`);
    if (game?.getPlayers().size === 0) {
      games.delete(gameId);
      console.log(`Game ${gameId} deleted`);
    io.emit('activeGames', Array.from(games.keys()));
    }
  })

  socket.on('disconnect', () => {
    const gameId = playerGameMap.get(socket.id);
    if (!gameId || !games.has(gameId)) {
      return;
    }
    const game = games.get(gameId);
    game?.removePlayer(socket.id);
    playerGameMap.delete(socket.id);
    socket.leave(gameId);
    io.to(gameId).emit('playerLeft', {playerId: socket.id});
    console.log(`Player ${socket.id} disconnected from game ${gameId}`);
    if (game?.getPlayers().size === 0) {
      games.delete(gameId);
      console.log(`Game ${gameId} deleted`);
      io.emit('activeGames', Array.from(games.keys()));
    }
  })
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
  if (!currentPlayerId) {
    console.error("No current player ID!");
    return;
  }

  const gameId = playerGameMap.get(currentPlayerId);
  if (!gameId) {
    console.error("No game found for the current player!");
    return;
  }

  const currentGame = games.get(gameId);
  if (!currentGame) {
    console.error("Game instance not found!");
    return;
  }

  const players = Array.from(currentGame.getPlayers().keys());
  if (players.length === 0) {
    console.error("No players left in the game!");
    currentPlayerId = null;
    return;
  }

  if (currentPlayerId) {
    io.emit('turnTimerUpdate', { playerId: currentPlayerId, timeLeft: 0 });
  }

  const currentPlayerIndex = players.indexOf(currentPlayerId);
  const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
  const nextPlayerId = players[nextPlayerIndex];
  const nextPlayer = currentGame.getPlayers().get(nextPlayerId);

  currentPlayerId = nextPlayerId;
  io.to(gameId).emit('currentPlayer', { id: currentPlayerId, x: nextPlayer?.getX(), y: nextPlayer?.getY() });
  io.to(gameId).emit('turnTimerUpdate', { playerId: currentPlayerId, timeLeft: turnTimeLeft });
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