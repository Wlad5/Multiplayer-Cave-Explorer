import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Game } from './game/Game';
import { v4 } from 'uuid';
import { EMPTY_CELL, PlayerDirection } from './game/constants';
import { Player } from './game/Player';

const app = express();
const port = 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let gameEnded = false;
let turnTimeLeft = 10000;
let currentPlayerId: string | null = null;
let turnTimer: NodeJS.Timeout | null = null;
let gameTimer: NodeJS.Timeout | null = null;
const gameTimers = new Map<string, NodeJS.Timeout>();
const gameTimeLeftMap = new Map<string, number>();

const games = new Map<string, Game>();
const playerGameMap = new Map<string, string>();
const disconnectedPlayers = new Map<string, {gameId: string, x: number, y: number, direction: PlayerDirection, score: number, username: string}>();

io.on('connection', (socket) => {
  socket.on('createGame', ({ username }) => {
    const gameId = v4();
    gameEnded = false;
    currentPlayerId = null;
    if (turnTimer) {
      clearInterval(turnTimer);
      turnTimer = null;
    }
    if (gameTimer) {
      clearInterval(gameTimer);
      gameTimer = null;
    }
    turnTimeLeft = 10000;
    if (!currentPlayerId) {
      currentPlayerId = socket.id;
      startTurnTimer(currentPlayerId, gameId);
    }
    if (playerGameMap.has(socket.id)) {
      socket.emit('error', { message: `You are already in a game!` });
      return;
    }
    const newGame = new Game();
    startGameTimer(gameId);
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
    if (disconnectedPlayers.has(socket.id)) {
      const savedState = disconnectedPlayers.get(socket.id);
      let player = game.getPlayers().get(socket.id);

      if (!player) {
        player = new Player(socket.id, savedState?.username!);
        game.getPlayers().set(socket.id, player);
      }
    
      if (player) {
        player.setPosition(savedState?.x!, savedState?.y!);
        player.setDirection(savedState?.direction!);
        player.setScore(savedState?.score!);
        player.setUsername(savedState?.username!);
      }
      disconnectedPlayers.delete(socket.id);
    } else {
      game.addPlayer(socket.id, username);
    }
    playerGameMap.set(socket.id, gameId);
    socket.join(gameId);
    const player = game.getPlayers().get(socket.id);
    if (player) {
      game.getGrid()[player.getX()][player.getY()] = player.getDirection();
      game.getHiddenGrid()[player.getX()][player.getY()] = player.getDirection();
    }
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
    socket.emit('playerJoined', players);
    socket.emit('gameState', game.getHiddenGrid());
    if (!currentPlayerId) {
        currentPlayerId = socket.id;
        startTurnTimer(currentPlayerId, gameId);
    }
    const gameTimeLeft = gameTimeLeftMap.get(gameId) || 0;
    socket.emit('gameTimeUpdate', gameTimeLeft);
    console.log(`Player ${socket.id} joined game ${gameId}`);
  });

  socket.on('listGames', () => {
    const activeGames = Array.from(games.keys());
    socket.emit('activeGames', activeGames);
  })

  socket.on('playerMove', ({ move, playerId }) => {
    const gameId = playerGameMap.get(socket.id);
    const game = games.get(gameId!);
    if (!gameId || !games.has(gameId)) {
        socket.emit('error', { message: `You are not in a game!` });
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
    const updatedPlayer = game?.getPlayers().get(playerId);
    io.to(gameId).emit('gameState', updatedGrid);
    io.to(gameId).emit('message', resultMessage);
    if (updatedPlayer) {
        io.to(gameId).emit('playerUpdated', {
            id: updatedPlayer.getId(),
            x: updatedPlayer.getX(),
            y: updatedPlayer.getY(),
            direction: updatedPlayer.getDirection(),
            score: updatedPlayer.getScore(),
            username: updatedPlayer.getUsername(),
        });
    }
    nextPlayer();
  });

  socket.on('leaveGame', () => {
    const gameId = playerGameMap.get(socket.id);
    if (!gameId || !games.has(gameId)) {
      socket.emit('error', {message: `You are not in a game!`});
      return;
    }
    const game = games.get(gameId);
    const player = game?.getPlayers().get(socket.id);
    if (player) {
      disconnectedPlayers.set(socket.id, {
        gameId,
        x: player.getX(),
        y: player.getY(),
        direction: player.getDirection(),
        score: player.getScore(),
        username: player.getUsername(),
      })
      game?.removePlayer(socket.id);
      game!.getGrid()[player.getX()][player.getY()] = EMPTY_CELL;
      game!.getHiddenGrid()[player.getX()][player.getY()] = EMPTY_CELL;
    }
    playerGameMap.delete(socket.id);
    socket.leave(gameId);
    io.to(gameId).emit('playerLeft', socket.id);
    io.to(gameId).emit('gameState', game?.getHiddenGrid());
    console.log(`Player ${socket.id} left game ${gameId}`);
    if (currentPlayerId === socket.id) {
      const players = Array.from(game?.getPlayers().keys() || [])
      if (players.length > 0) {
        currentPlayerId = null;
        nextPlayer();
      } else {
        currentPlayerId = null;
        clearInterval(turnTimer!);
        turnTimer = null;
      }
    }
    io.emit('activeGames', Array.from(games.keys()));
  })

  socket.on('disconnect', () => {
    const gameId = playerGameMap.get(socket.id);
    if (!gameId || !games.has(gameId)) {
      return;
    }
  
    const game = games.get(gameId);
    const player = game?.getPlayers().get(socket.id);
  
    if (player) {
      game?.removePlayer(socket.id);
      game!.getGrid()[player.getX()][player.getY()] = EMPTY_CELL;
      game!.getHiddenGrid()[player.getX()][player.getY()] = EMPTY_CELL;
      playerGameMap.delete(socket.id);
      socket.leave(gameId);
      io.to(gameId).emit('playerLeft', { playerId: socket.id });
      io.to(gameId).emit('gameState', game?.getHiddenGrid());
      console.log(`Player ${socket.id} disconnected from game ${gameId}`);
    }
  
    if (currentPlayerId === socket.id) {
      const players = Array.from(game?.getPlayers().keys() || []);
      if (players.length > 0) {
        currentPlayerId = null;
        nextPlayer();
      } else {
        currentPlayerId = null;
        clearInterval(turnTimer!);
        turnTimer = null;
      }
    }
  
    io.emit('activeGames', Array.from(games.keys()));
  })
});

const startGameTimer = (gameId: string) => {
  if (gameTimers.has(gameId)) return;
  gameTimeLeftMap.set(gameId, 1 * 60 * 1000);
  const timer = setInterval(() => {
    const timeLeft = gameTimeLeftMap.get(gameId)! - 1000;
    gameTimeLeftMap.set(gameId, timeLeft);
    io.to(gameId).emit('gameTimeUpdate', timeLeft);
    if (timeLeft <= 0) {
      clearInterval(timer);
      gameTimers.delete(gameId);
      gameTimeLeftMap.delete(gameId);
      endGame(gameId);
    }
  }, 1000);
  gameTimers.set(gameId, timer);
};

const startTurnTimer = (playerId: string, gameId: string) => {
  const gameTimeLeft = gameTimeLeftMap.get(gameId)
  if (gameEnded || gameTimeLeft! <= 0) {
    console.log('The game has ended!');
    io.emit('turnTimerUpdate', { playerId, timeLeft: 0 });

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
    console.error(`No game found for the current player ID: ${currentPlayerId}`);
    currentPlayerId = null;
    return;
  }

  const currentGame = games.get(gameId);
  if (!currentGame) {
    console.error(`Game instance not found for game ID: ${gameId}`);
    currentPlayerId = null;
    return;
  }

  const players = Array.from(currentGame.getPlayers().keys());
  if (players.length === 0) {
    console.error(`No players left in the game with ID: ${gameId}`);
    currentPlayerId = null;
    clearInterval(turnTimer!);
    turnTimer = null;
    return;
  }

  if (currentPlayerId) {
    io.emit('turnTimerUpdate', { playerId: currentPlayerId, timeLeft: 0 });
  }

  const currentPlayerIndex = players.indexOf(currentPlayerId ?? '');
  const nextPlayerIndex = currentPlayerIndex >= 0 ? (currentPlayerIndex + 1) % players.length : 0;
  const nextPlayerId = players[nextPlayerIndex];
  const nextPlayer = currentGame.getPlayers().get(nextPlayerId);

  currentPlayerId = nextPlayerId;
  io.to(gameId).emit('currentPlayer', { id: currentPlayerId, x: nextPlayer?.getX(), y: nextPlayer?.getY() });
  io.to(gameId).emit('turnTimerUpdate', { playerId: currentPlayerId, timeLeft: turnTimeLeft });
  startTurnTimer(nextPlayerId, gameId);
};

const endGame = (gameId: string) => {
  const game = games.get(gameId);
  if (!game) {
    console.error(`Game ${gameId} not found!`);
    return;
  }
  const timer = gameTimers.get(gameId);
  if (timer) {
    clearInterval(timer);
    gameTimers.delete(gameId);
  }
  if (turnTimer) {
    clearInterval(turnTimer);
    turnTimer = null;
    turnTimeLeft = 0;
  }

  const players = Array.from(game.getPlayers().keys());
  players.forEach(playerId => {
    playerGameMap.delete(playerId);
  })

  gameTimeLeftMap.delete(gameId);
  games.delete(gameId);
  const playerScores = players.map(playerId => {
    const player = game.getPlayers().get(playerId);
    return {
      playerId: player?.getId(),
      score: player?.getScore(),
    }
  });
  io.to(gameId).emit('gameEnded', { playersScores: playerScores });
  io.to(gameId).emit('turnTimerUpdate', {playerId: currentPlayerId, timeLeft: 0});
  io.to(gameId).emit('message', 'Game Over!');
  games.delete(gameId);
  console.log(`Game ${gameId} deleted!`);
  io.emit('activeGames', Array.from(games.keys()));
};

httpServer.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});