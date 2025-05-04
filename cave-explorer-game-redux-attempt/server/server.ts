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

const MIN_PLAYERS = 3;
const games               = new Map<string, Game>();
const gameTimers          = new Map<string, NodeJS.Timeout>();
const gameTimeLeftMap     = new Map<string, number>();
const turnTimers          = new Map<string, NodeJS.Timeout>();
const turnTimeLeftMap     = new Map<string, number>();
const waitingPlayersMap   = new Map<string, Player>();
const playerGameMap       = new Map<string, string>();
const currentPlayerMap    = new Map<string, string | null>();
const disconnectedPlayers = new Map<string, {gameId: string, x: number, y: number, direction: PlayerDirection, score: number, username: string}>();

io.on('connection', (socket) => {
  socket.on('createGame', ({ username }) => {
    const gameId = v4();
    let currentPlayerId = currentPlayerMap.get(gameId);
    currentPlayerId = null;
    if (turnTimers.has(gameId)) {
      clearInterval(turnTimers.get(gameId));
      turnTimers.delete(gameId);
    }
    if (gameTimers.has(gameId)) {
      clearInterval(gameTimers.get(gameId));
      gameTimers.delete(gameId);
    }

    turnTimeLeftMap.set(gameId, 10000);
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

    if (waitingPlayersMap.size >= MIN_PLAYERS - 1) {
      const playersToAdd = Array.from(waitingPlayersMap.values()).slice(0, MIN_PLAYERS - 1);
      playersToAdd.forEach((waitingPlayer) => {
        newGame.addPlayer(waitingPlayer.getId(), waitingPlayer.getUsername());
        playerGameMap.set(waitingPlayer.getId(), gameId);
    
        waitingPlayersMap.delete(waitingPlayer.getId());
    
        io.sockets.sockets.get(waitingPlayer.getId())?.join(gameId);
    
        io.to(waitingPlayer.getId()).emit('gameJoined', { gameId });
        io.to(waitingPlayer.getId()).emit('gameState', newGame.getHiddenGrid());
        io.to(gameId).emit('playerAdded', {
          id: waitingPlayer.getId(),
          x: waitingPlayer.getX(),
          y: waitingPlayer.getY(),
          direction: waitingPlayer.getDirection(),
          score: waitingPlayer.getScore(),
          username: waitingPlayer.getUsername(),
        });
    });
    
      io.to(gameId).emit('gameState', newGame.getHiddenGrid());
    
      let countdown = 3;
      const countdownInterval = setInterval(() => {
        io.to(gameId).emit('message', `Game starting in ${countdown}...`);
        countdown--;
        if (countdown < 0) {
          clearInterval(countdownInterval);
          io.to(gameId).emit('message', `Game started!`);
          io.to(gameId).emit('gameState', newGame.getHiddenGrid());
        }
      }, 1000);
    }
  });

  socket.on('joinActiveGame', ({ gameId, username }) => {
    let currentPlayerId = currentPlayerMap.get(gameId);
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
    io.to(gameId).emit('gameState', game.getHiddenGrid());
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
    if (currentPlayerId) {
      const currentPlayer = game.getPlayers().get(currentPlayerId);
      socket.emit('currentPlayer', {id: currentPlayerId, x: currentPlayer?.getX(), y: currentPlayer?.getY() });
    }

    if (!currentPlayerId) {
        currentPlayerId = socket.id;
        startTurnTimer(currentPlayerId, gameId);
    }
    const gameTimeLeft = gameTimeLeftMap.get(gameId) || 0;
    socket.emit('gameTimeUpdate', gameTimeLeft);
    console.log(`Player ${socket.id} joined game ${gameId}`);
  });

  socket.on('waitingRoom', ({username}) => {
    const player = new Player(socket.id, username);
    waitingPlayersMap.set(socket.id, player);
    socket.join(socket.id);
    // waitingPlayersMap.forEach((value, key) => {
    //   console.log('waiting players', key, {
    //     x: value.getX(),
    //     y: value.getY(),
    //     playerDirection: value.getDirection(),
    //     score: value.getScore(),
    //     playerId: value.getId(),
    //     username: value.getUsername(),
    //   });
    // });
    io.emit('waitingPlayers', Array.from(waitingPlayersMap.entries()) );
  })

  socket.on('listGames', () => {
    const activeGames = Array.from(games.keys());
    socket.emit('activeGames', activeGames);
  })

  socket.on('playerMove', ({ move, playerId }) => {
    const gameId = playerGameMap.get(socket.id);
    const game = games.get(gameId!);
    let currentPlayerId = currentPlayerMap.get(gameId!);
    if (!gameId || !games.has(gameId)) {
        socket.emit('error', { message: `You are not in a game!` });
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
    if (turnTimers.has(gameId)) {
      clearInterval(turnTimers.get(gameId));
      turnTimers.delete(gameId);
    }
    const resultMessage = game?.playMove(move, socket.id);
    const updatedGrid = game?.getHiddenGrid();
    const updatedPlayer = game?.getPlayers().get(playerId);
    io.to(gameId).emit('gameState', updatedGrid);
    socket.emit('message', resultMessage);
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
    nextPlayer(gameId);
  });

  socket.on('leaveWaitingRoom', ({playerId}) => {
    if (waitingPlayersMap.has(playerId)) {
      waitingPlayersMap.delete(playerId);
      socket.leave(playerId);
      io.emit('waitingPlayers', Array.from(waitingPlayersMap.entries()));
      console.log(`Player ${playerId} left the waiting room!`);
    }
  })

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
    if (currentPlayerMap.get(gameId) === socket.id) {
      const game = games.get(gameId);
      if (game?.getPlayers().size! > 0) {
        nextPlayer(gameId);
      } else {
        currentPlayerMap.delete(gameId);
        if (turnTimers.has(gameId)) {
          clearInterval(turnTimers.get(gameId)!);
          turnTimers.delete(gameId);
        }
      }
    }
    io.emit('activeGames', Array.from(games.keys()));
  })

  socket.on('disconnect', () => {
    if (waitingPlayersMap.has(socket.id)) {
      waitingPlayersMap.delete(socket.id);
      io.emit('waitingPlayers', Array.from(waitingPlayersMap.entries()));
    }
    // waitingPlayersMap.forEach((value, key) => {
    //   console.log('waiting players', key, {
    //     x: value.getX(),
    //     y: value.getY(),
    //     playerDirection: value.getDirection(),
    //     score: value.getScore(),
    //     playerId: value.getId(),
    //     username: value.getUsername(),
    //   });
    // });

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
  
    if (currentPlayerMap.get(gameId) === socket.id) {
      const game = games.get(gameId);
      if (game?.getPlayers().size! > 0) {
        nextPlayer(gameId);
      } else {
        currentPlayerMap.delete(gameId);
        if (turnTimers.has(gameId)) {
          clearInterval(turnTimers.get(gameId)!);
          turnTimers.delete(gameId);
        }
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
  if (gameTimeLeft! <= 0) {
    console.log('The game has ended!');
    io.emit('turnTimerUpdate', { playerId, timeLeft: 0 });
    return;
  }
  currentPlayerMap.set(gameId, playerId);
  turnTimeLeftMap.set(gameId, 10000);
  io.to(gameId).emit('turnTimerUpdate', {playerId, timeLeft: 10000})

  if (turnTimers.has(gameId)) clearInterval(turnTimers.get(gameId));
  const interval = setInterval(() => {
    const timeLeft = (turnTimeLeftMap.get(gameId) ?? 0) - 1000;
    turnTimeLeftMap.set(gameId, timeLeft);
    io.emit('turnTimerUpdate', {playerId, timeLeft});
    if (timeLeft <= 0) {
      clearInterval(interval);
      turnTimers.delete(gameId);
      io.emit('turnMessage', `Player ${playerId} ran out of time!`);
      nextPlayer(gameId);
    }
  }, 1000)
  turnTimers.set(gameId, interval);
};

const nextPlayer = (gameId: string) => {
  const game = games.get(gameId);
  
  const players = Array.from(game!.getPlayers().keys());
  if (players.length === 0) return;

  const currentPlayerId = currentPlayerMap.get(gameId);
  const currentPlayerIndex = players.indexOf(currentPlayerId ?? '');
  const nextPlayerIndex = currentPlayerIndex >= 0 ? (currentPlayerIndex + 1) % players.length : 0;
  const nextPlayerId = players[nextPlayerIndex];
  const nextPlayer = game!.getPlayers().get(nextPlayerId);

  currentPlayerMap.set(gameId, nextPlayerId);
  io.to(gameId).emit('currentPlayer', { id: nextPlayerId, x: nextPlayer?.getX(), y: nextPlayer?.getY() });
  startTurnTimer(nextPlayerId, gameId);
};

const endGame = (gameId: string) => {
  const game = games.get(gameId);
  let currentPlayerId = currentPlayerMap.get(gameId);
  if (!game) {
    console.error(`Game ${gameId} not found!`);
    return;
  }
  const timer = gameTimers.get(gameId);
  if (timer) {
    clearInterval(timer);
    gameTimers.delete(gameId);
  }
  if (turnTimers.has(gameId)) {
    clearInterval(turnTimers.get(gameId));
    turnTimers.delete(gameId);
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
  console.log(`Game ${gameId} ended!`);
  console.log(`Game ${gameId} deleted!`);
  io.emit('activeGames', Array.from(games.keys()));
};

httpServer.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});