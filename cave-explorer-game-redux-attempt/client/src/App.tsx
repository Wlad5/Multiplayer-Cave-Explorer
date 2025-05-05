import { useDispatch, useSelector} from "react-redux";
import { AppDispatch, RootState } from "./store";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { initializeGridAC } from "./reducers/gridActions";
import { 
  endGameAC,
  exitGameAC,
  setActiveGamesAC,
  setCurrentPlayerAC,
  setGameTimerAC,
  setTurnTimerAC,
  setWaitingPlayersAC,
  showMessageAC,
  startGameAC 
} from "./reducers/gameActions";
import Gameboard from "./components/gameBoard/GameBoard";
import { 
  addPlayerAC,
  movePlayerAC,
  removePlayerAC,
  turnPlayerAC,
  updateScoreAC 
} from "./reducers/playerActions";
import { Player } from "./reducers/playerReducer";
import { StartScreen } from "./components/startScreen/StartScreen";
import { PlayerDirection } from "../../server/game/constants";

const socket = io('http://localhost:3000');

function App() {
  const dispatch: AppDispatch     = useDispatch();
  const [username, setUsername]   = useState('');
  const gameStatus                = useSelector((state: RootState) => state.game.gameStatus);
  const activeGames               = useSelector((state: RootState) => state.game.activeGames);
  const grid                      = useSelector((state: RootState) => state.grid.grid);
  const players                   = useSelector((state: RootState) => state.player);
  const message                   = useSelector((state: RootState) => state.game.message);
  const gameTimeLeft              = useSelector((state: RootState) => state.game.gameTimeLeft);
  const turnTimeLeft              = useSelector((state: RootState) => state.game.turnTimeLeft);
  const waitingPlayers            = useSelector((state: RootState) => state.game.waitingPlayers);

  useEffect(() => {

    socket.on('waitingPlayers', (waitingPlayers) => {
      const playersMap = new Map<string, Player>(waitingPlayers);
      dispatch(setWaitingPlayersAC(playersMap));
    });

    socket.on('gameJoined', ({gameId}) => {
      console.log(`Joined game: ${gameId}`);
      dispatch(startGameAC());
    })
    
    socket.on('activeGames', (activeGames: string[]) => {
      dispatch(setActiveGamesAC(activeGames));
    })

    socket.on('playerAdded', (newPlayer) => {
      console.log(`New player added: ${newPlayer}`);
      dispatch(addPlayerAC(newPlayer));
    })

    socket.on('playerJoined', (players) => {
      console.log('Updated players list:', players);
      players.forEach((player: Player) => {
        dispatch(addPlayerAC(player));
      });
    });

    socket.on('playerUpdated', (updatedPlayer) => {
      console.log(`Player updated: ${updatedPlayer}`);
      dispatch(updateScoreAC(updatedPlayer.id, updatedPlayer.score));
    });

    socket.on('currentPlayer', (playerId) => {
      dispatch(setCurrentPlayerAC(playerId));
    });

    socket.on('gameTimeUpdate', (timeLeft) => {
      dispatch(setGameTimerAC(timeLeft));
    });

    socket.on('turnTimerUpdate', ({ playerId, timeLeft }) => {
      if (playerId === socket.id) {
        dispatch(setTurnTimerAC(timeLeft));
      }
    });

    socket.on('playerRemoved', (playerId: string) => {
      dispatch(removePlayerAC(playerId));
    });

    socket.on('gameState', (updatedGrid) => {
      dispatch(initializeGridAC(updatedGrid.length, updatedGrid, updatedGrid));
    });

    socket.on('message', (message) => {
      dispatch(showMessageAC(message));
    });

    socket.on('gameCreated', (currentPlayerId) => {
      dispatch(setCurrentPlayerAC(currentPlayerId))
      dispatch(startGameAC());
    });

    socket.on('gameEnded', (scores) => {
      dispatch(endGameAC(scores));
      dispatch(setWaitingPlayersAC(waitingPlayers));
    });

    return () => {
      socket.off('activeGames');
      socket.off('playerAdded');
      socket.off('playerJoined');
      socket.off('playerUpdated');
      socket.off('currentPlayer');
      socket.off('gameState');
      socket.off('playerAddedToWaitingRoom');
      socket.off('message');
      socket.off('gameJoined');
      socket.off('gameTimeUpdate');
      socket.off('turnTimeUpdate');
      socket.off('waitingPlayers');
    }
  }, [dispatch, waitingPlayers]);
  
  useEffect(() => {
    players.forEach((player: Player) => {
      console.log(`Player ID: ${player.id}, Score: ${player.score}`);
    });
  }, [players])

  const handleInput = (move: string) => {
    let serverMove = move;
  
    // Map PlayerDirection to server-compatible move strings
    switch (move) {
      case PlayerDirection.NORTH: serverMove = "ArrowUp"; break;
      case PlayerDirection.SOUTH: serverMove = "ArrowDown"; break;
      case PlayerDirection.WEST:  serverMove = "ArrowLeft"; break;
      case PlayerDirection.EAST:  serverMove = "ArrowRight"; break;
    }
  
    socket.emit('playerMove', { playerId: socket.id, move: serverMove });
  
    switch (move) {
      case PlayerDirection.NORTH:
      case PlayerDirection.SOUTH:
      case PlayerDirection.WEST:
      case PlayerDirection.EAST:
        dispatch(turnPlayerAC(socket.id!, move));
        break;
      case 'F':
        dispatch(movePlayerAC(socket.id!, grid));
        break;
      case 'E':
        exitGame();
        break;
      default:
        console.log('Invalid move');
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp'    :
        case 'w'          : handleInput(PlayerDirection.NORTH);   break;
        case 'ArrowDown'  :
        case 's'          : handleInput(PlayerDirection.SOUTH);   break;
        case 'ArrowLeft'  :
        case 'a'          : handleInput(PlayerDirection.WEST);    break;
        case 'ArrowRight' :
        case 'd'          : handleInput(PlayerDirection.EAST);    break;
        case 'f'          : handleInput('F');                     break;
        case 'e'          : handleInput('E');                     break;
        default:  console.log('Invalid key');
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  const play = () => {
    if (username.trim()) {
      socket.emit('createGame', {username});
      dispatch(startGameAC());
      dispatch(setCurrentPlayerAC(socket.id!));
    } else {
      alert(`Please enter a username!`);
    }
  }

  const join = () => {
    if (username.trim()) {
      socket.emit('waitingRoom', {username});
      const playersMap = new Map<string, Player>(waitingPlayers);
      dispatch(setWaitingPlayersAC(playersMap));
    } else {
      alert(`Please enter a username!`);
    }
  }

  const joinActiveGame = (gameId: string) => {
    if (username.trim()) {
      socket.emit('joinActiveGame', {gameId, username});
      dispatch(startGameAC())
    } else {
      alert(`Please enter a username!`);
    }
  }

  const leaveWaitingRoom = () => {
    socket.emit('leaveWaitingRoom', {playerId: socket.id});
    const playerMap = new Map<string, Player>(waitingPlayers);
    dispatch(setWaitingPlayersAC(playerMap));
  }

  const exitGame = () => {
    dispatch(exitGameAC());
    socket.emit('leaveGame', {playerId: socket.id});
  }
  const playerScore = players.get(socket.id!)?.score || 0;
  const playerUsername = players.get(socket.id!)?.username || username

  return (
    <div className="app">
      {gameStatus === 'not_started' || gameStatus === 'ended' ? (
        <StartScreen
          play={play}
          join={join}
          joinActiveGame={joinActiveGame}
          username={username}
          setUsername={setUsername}
          activeGames={activeGames}
          leaveWaitingRoom={leaveWaitingRoom}
        />
      ) : (
        <>
          <div>Game Time Left: {gameTimeLeft / 1000}s</div>
          <div>Turn Time Left: {turnTimeLeft / 1000}s</div>
          <Gameboard exit={exitGame}/>
          {message && <div className="message">{message}</div>}
          <button onClick={() => handleInput(PlayerDirection.WEST)}>←</button>
          <button onClick={() => handleInput(PlayerDirection.EAST)}>→</button>
          <button onClick={() => handleInput(PlayerDirection.NORTH)}>↑</button>
          <button onClick={() => handleInput(PlayerDirection.SOUTH)}>↓</button>
          <button onClick={() => handleInput('F')}>Forward</button>
          <div>
            {`${playerUsername}: ${playerScore}`}
          </div>
        </>
      )}
    </div>
  );
}
export default App;