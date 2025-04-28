import { useDispatch, useSelector} from "react-redux";
import { AppDispatch, RootState } from "./store";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { initializeGridAC } from "./reducers/gridActions";
import { endGameAC, setActiveGamesAC, setCurrentPlayerAC, setGameTimerAC, setTurnTimerAC, showMessageAC, startGameAC } from "./reducers/gameActions";
import Gameboard from "./components/gameBoard/GameBoard";
import { addPlayerAC, movePlayerAC, removePlayerAC, turnPlayerAC } from "./reducers/playerActions";
import { Player } from "./reducers/playerReducer";
import { StartScreen } from "./components/startScreen/StartScreen";


const socket = io('http://localhost:3000');

function App() {
  const dispatch: AppDispatch     = useDispatch();
  const [username, setUsername] = useState('');
  const gameStatus = useSelector((state: RootState) => state.game.gameStatus);
  const activeGames = useSelector((state: RootState) => state.game.activeGames);
  const grid = useSelector((state: RootState) => state.grid.grid);
  const players = useSelector((state: RootState) => state.player);
  const message = useSelector((state: RootState) => state.game.message);
  const gameTimeLeft = useSelector((state: RootState) => state.game.gameTimeLeft);
  const turnTimeLeft = useSelector((state: RootState) => state.game.turnTimeLeft);

  useEffect(() => {

    socket.on('activeGames', (activeGames: string[]) => {
      dispatch(setActiveGamesAC(activeGames));
    })

    socket.on('playerAdded', (newPlayer) => {
      console.log(`New player added: ${newPlayer}`);
      dispatch(addPlayerAC(newPlayer));
    })

    socket.on('playersUpdated', (players) => {
      console.log('Updated players list:', players);
      players.forEach((player: Player) => {
        dispatch(addPlayerAC(player));
      });
    });

    socket.on('currentPlayer', (playerId) => {
      dispatch(setCurrentPlayerAC(playerId));
    });
    socket.on('gameTimeUpdate', (timeLeft) => {
      dispatch(setGameTimerAC(timeLeft));
    })
    socket.on('turnTimerUpdate', ({ playerId, timeLeft }) => {
      if (playerId === socket.id) {
        dispatch(setTurnTimerAC(timeLeft));
      }
    });
    socket.on('playerRemoved', (playerId: string) => {
      dispatch(removePlayerAC(playerId));
    })
    socket.on('gameState', (updatedGrid) => {
      dispatch(initializeGridAC(updatedGrid.length, updatedGrid, updatedGrid));
    })
    socket.on('message', (message) => {
      dispatch(showMessageAC(message));
    })
    socket.on('gameCreated', (currentPlayerId) => {
      dispatch(setCurrentPlayerAC(currentPlayerId))
    })
    socket.on('gameEnded', (scores) => {
      dispatch(endGameAC(scores))
    })

    return () => {
      socket.off('activeGames');
      socket.off('playerAdded');
      socket.off('playersUpdated');
      socket.off('currentPlayer');
      socket.off('gameState');
      socket.off('message');
      socket.off('gameTimeUpdate');
      socket.off('turnTimeUpdate');
    }
  }, [dispatch]);
  const handleMove = ( move: string) => {
    socket.emit('playerMove', { playerId: socket.id, move });
    switch(move) {
      case 'L': {
        dispatch(turnPlayerAC(socket.id!, true));
        break;
      }
      case 'R': {
        dispatch(turnPlayerAC(socket.id!, false));
        break;
      }
      case 'F': {
        dispatch(movePlayerAC(socket.id!, grid));
      }
    }
  }
  useEffect(() => {
    console.log('redux', players)
  }, [players])

  const play = () => {
    if (username.trim()) {
      socket.emit('createGame', {username});
      dispatch(startGameAC());
      dispatch(setCurrentPlayerAC(socket.id!));
    } else {
      alert(`Please enter a username!`);
    }
  }

  const joinGame = (gameId: string) => {
    if (username.trim()) {
      socket.emit('joinGame', {username, gameId});
      dispatch(startGameAC());
    }
  }

  return (
    <div className="app">
      {gameStatus === 'not_started' ? (
        <StartScreen
          play={play}
          join={joinGame}
          username={username}
          setUsername={setUsername}
          activeGames={activeGames}
        />
      ) : (
        <>
          <div>Game Time Left: {gameTimeLeft / 1000}s</div>
          <div>Turn Time Left: {turnTimeLeft / 1000}s</div>
          <Gameboard/>
          {message && <div className="message">{message}</div>}
          <button onClick={() => handleMove('L')}>Left</button>
          <button onClick={() => handleMove('R')}>Right</button>
          <button onClick={() => handleMove('F')}>Forward</button>
        </>
      )}
    </div>
  );
}
export default App;