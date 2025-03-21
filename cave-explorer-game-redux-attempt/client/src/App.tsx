import { useDispatch, useSelector} from "react-redux";
import { Controls } from "./components/control/Controls";
import { StartScreen } from "./components/startScreen/StartScreen";
import GameBoard from "./components/gameBoard/GameBoard";
import { useEffect, useRef, useState } from "react";
import { clearCellAC, placeRandomItemsTC, revealCurrentCellAC, revealLineOfSightAC } from "./reducers/gridActions";
import { OBSTACLE, TRAP, TREASURE } from "../../server/game/constants";
import { movePlayerAC, turnPlayerAC, updateScoreAC } from "./reducers/playerActions";
import { AppDispatch, RootState } from "./store";
import { exitGameAC, gameTimerTC, nextTurnAC, setMoveMadeAC, showMessageAC, startGameAC, turnTimerTC} from "./reducers/gameActions";
import { Message } from "./components/message/Message";

function App() {
  const dispatch: AppDispatch     = useDispatch();
  const [username, setUsername]   = useState("");
  const grid                      = useSelector((state: RootState) => state.grid.grid);
  const players                   = useSelector((state: RootState) => state.player);
  const gameTime                  = useSelector((state: RootState) => state.game.gameTimeLeft);
  const turnTime                  = useSelector((state: RootState) => state.game.turnTimeLeft);
  const gameStatus                = useSelector((state: RootState) => state.game.gameStatus);
  const playerMoved               = useSelector((state: RootState) => state.game.playerMoved);
  const leaderBoard               = useSelector((state: RootState) => state.game.leaderBoard);
  const playersCount              = players.length;
  const turnTimerRef              = useRef<number | null>(null);
  const currentPlayer             = useSelector((state: RootState) => state.game.currentPlayer);
  const existingGameTimer         = useSelector((state: RootState) => state.game.gameTimer);
  const previousPlayerStatus      = useRef(players.map(player => player.status));

  const handleMove = (playerId: number, move: string) => {
    if (gameStatus !== 'in_progress') return;
    const player = players.find(player => player.playerId === playerId);
    if (!player) return;
    const previousX = player.x;
    const previousY = player.y;
    if (playerId !== currentPlayer) return;
    if (move === 'R') {
      dispatch(turnPlayerAC(playerId,false));
    }
    if (move === 'L') {
      dispatch(turnPlayerAC(playerId,true));
    }
    if (move === 'F') {
      dispatch(movePlayerAC(playerId,grid));
      dispatch(revealLineOfSightAC(player));
      if (player.status === 'hitObstacle' || player.status === 'outOfBounds') {
        return;
      } else {
        dispatch(clearCellAC(player.playerId, previousX, previousY));
      }
      dispatch(setMoveMadeAC(true));
    }
    dispatch(showMessageAC(""));
  };

  const play = () => {
    dispatch(startGameAC());
  };
  
  const exit = () => {
    dispatch(exitGameAC());
  };
  
  useEffect(() => {
    if (gameStatus === 'in_progress' && !existingGameTimer) {
      dispatch(gameTimerTC());
    }
  }, [existingGameTimer, dispatch, gameStatus]);

  useEffect(() => {
    if (gameStatus === 'in_progress') {
      if (turnTimerRef.current) clearInterval(turnTimerRef.current);
      dispatch(turnTimerTC());
    }
  }, [currentPlayer, dispatch, gameStatus]);
  
  useEffect(() => {
    dispatch(placeRandomItemsTC(TRAP, 10));
    dispatch(placeRandomItemsTC(TREASURE, 40));
    dispatch(placeRandomItemsTC(OBSTACLE, 10));
  }, [dispatch]);

  useEffect(() => {
    if (playerMoved) {
      dispatch(setMoveMadeAC(false));
      dispatch(nextTurnAC(playersCount));
      dispatch(turnTimerTC());
    } 
  }, [playerMoved, dispatch, playersCount])

  useEffect(() => {
    players.forEach((player, index) => {
      if (player.status !== previousPlayerStatus.current[index]) {
        let message = '';
        switch (player.status) {
          case 'hitObstacle':
            message = "You hit an obstacle";
            break;
          case 'outOfBounds':
            message = "You cannot go out of bounds";
            break;
          case 'foundTreasure':
            dispatch(updateScoreAC(player.playerId, 5));
            message = "You found the treasure!";
            break;
          case 'hitTrap':
            dispatch(updateScoreAC(player.playerId, -10));
            message = "You hit a trap";
            break;
          default:
            message = '';
        }
        dispatch(showMessageAC(message));
      }
    });
    previousPlayerStatus.current = players.map(player => player.status);
  }, [players, dispatch]);

  useEffect(() => {
    players.forEach(player => {
      dispatch(revealCurrentCellAC({
        playerId: player.playerId,
        x: player.x,
        y: player.y,
        direction: player.direction
      }));
      console.log(`Player ${player.playerId} moved to: (${player.x}, ${player.y}) - Status: ${player.status}`);
    })
  }, [players, dispatch]);
  
  return (
    <div className="app">
      {gameStatus === 'not_started' ? (
        <StartScreen play={play} username={username} setUsername={setUsername} />
      ) : (
        <div>
          <GameBoard exit={exit} />
          <div className="game-info">
            <h2>Game Time: {Math.floor(gameTime / 1000)}s</h2>
            <h2>Turn Time: {Math.floor(turnTime / 1000)}s</h2>
          </div>
          
          {/* Show leaderboard if the game has ended */}
          {gameStatus === 'ended' && leaderBoard.length > 0 && (
            <div className="leaderboard">
              <h3>Game Over! Final Leaderboard:</h3>
              <ul>
                {leaderBoard.map((player, index) => (
                  <li key={index}>
                    {`Player ${player.playerId}: ${player.score} points`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {
            players.map(player => (
              <div key={player.playerId}>
                <Controls
                  playerId={player.playerId}
                  onMove={handleMove}
                  onExit={exit}
                  disabled={gameStatus !== 'in_progress'}
                />
                <Message message={player.status}/>
                <div>Score: {player.score}</div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}
export default App;

// some shit (do not delete)

// useEffect(() => {
//   let message = '';
//   const actions: any[] = []; // Store dispatch actions to batch updates

//   players.forEach((player, index) => {
//     if (player.status !== previousPlayerStatus.current[index]) {
//       if (player.status === 'hitObstacle') message = "You hit an obstacle";
//       else if (player.status === 'outOfBounds') message = "You cannot go out of bounds";
//       else if (player.status === 'foundTreasure') {
//         message = "You found the treasure!";
//         actions.push(updateScoreAC(player.playerId, 5)); // Add score update action
//       } else if (player.status === 'hitTrap') {
//         message = "You hit a trap";
//         actions.push(updateScoreAC(player.playerId, -10)); // Subtract score update action
//       }
//     }
//   });

//   if (message) dispatch(showMessageAC(message));
//   actions.forEach(action => dispatch(action)); // Dispatch all score updates at once

//   previousPlayerStatus.current = players.map(player => player.status);
// }, [players, dispatch]);

// useEffect(() => {
//   players.forEach((player, index) => {
//     if (player.status !== previousPlayerStatus.current[index]) {
//       if (player.status === 'hitObstacle') {
//         dispatch(showMessageAC("You hit an obstacle"));
//       } else if (player.status === 'outOfBounds') {
//         dispatch(showMessageAC("You cannot go out of bounds"));
//       } else if (player.status === 'foundTreasure') {
//         dispatch(updateScoreAC(player.playerId, 5));
//         dispatch(showMessageAC("You found the treasure!"));
//       } else if (player.status === 'hitTrap') {
//         dispatch(updateScoreAC(player.playerId, -10));
//         dispatch(showMessageAC("You hit a trap"));
//       } else {
//         dispatch(showMessageAC(''));
//       }
//     }
//   });
//   previousPlayerStatus.current = players.map(player => player.status);
// }, [players, dispatch]);