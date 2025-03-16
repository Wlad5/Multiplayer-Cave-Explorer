import { useDispatch, useSelector} from "react-redux";
import { Controls } from "./components/control/Controls";
import { StartScreen } from "./components/startScreen/StartScreen";
import GameBoard from "./components/gameBoard/GameBoard";
import { useEffect, useRef, useState } from "react";
import { clearCellAC, placeRandomItemsAC, revealCurrentCellAC, revealLineOfSightAC } from "./reducers/gridActions";
import { OBSTACLE, TRAP, TREASURE } from "../../server/game/constants";
import { movePlayerAC, turnPlayerAC, updateScoreAC } from "./reducers/playerActions";
import { RootState } from "./store";
import { nextTurnAC, showMessageAC} from "./reducers/gameActions";
import { Message } from "./components/message/Message";

function App() {
  const dispatch = useDispatch();
  const [username, setUsername]   = useState("");
  const [startGame, setStartGame] = useState(false);
  const players                   = useSelector((state: RootState) => state.player) || [];
  const grid                      = useSelector((state: RootState) => state.grid.grid);
  const currentPlayer             = useSelector((state: RootState) => state.game.currentPlayer);
  const previousPlayerStatus      = useRef(players.map(player => player.status));
  
  const handleMove = (playerId: number, move: string) => {
    if (playerId !== currentPlayer) return;
    const player = players.find(player => player.playerId === playerId);
    if (!player) return;
    const previousX = player.x;
    const previousY = player.y;
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
      dispatch(nextTurnAC(players.length));
    }
    dispatch(showMessageAC(""));
  };

  useEffect(() => {
    players.forEach((player, index) => {
      if (player.status !== previousPlayerStatus.current[index]) {
        if (player.status === 'hitObstacle') {
          dispatch(showMessageAC("You hit an obstacle"));
        } else if (player.status === 'outOfBounds') {
          dispatch(showMessageAC("You cannot go out of bounds"));
        } else if (player.status === 'foundTreasure') {
          dispatch(updateScoreAC(player.playerId, 5));
          dispatch(showMessageAC("You found the treasure!"));
        } else if (player.status === 'hitTrap') {
          dispatch(updateScoreAC(player.playerId, -10));
          dispatch(showMessageAC("You hit a trap"));
        } else {
          dispatch(showMessageAC(''));
        }
      }
    });
    previousPlayerStatus.current = players.map(player => player.status);
  }, [players]);
  
  const exit = () => {
    setStartGame(false);
  };
  
  const play = () => {
    setStartGame(true);
  };
  
  useEffect(() => {
    dispatch(placeRandomItemsAC(TREASURE, 5));
    dispatch(placeRandomItemsAC(TRAP, 10));
    dispatch(placeRandomItemsAC(OBSTACLE, 15));
  }, []);
  
  useEffect(() => {
    players.forEach(player => {
      dispatch(revealCurrentCellAC({playerId: player.playerId, x: player.x, y: player.y, direction: player.direction}));
      console.log(`Player ${player.playerId} moved to: (${player.x}, ${player.y}) - Status: ${player.status}`);
    })
  }, [players]);
  
  return (
    <div className="app">
      {startGame ? (
        <StartScreen play={play} username={username} setUsername={setUsername} />
      ) : (
        <div>
          <GameBoard exit={exit} />          
          {
            players.map(player => (
              <div key={player.playerId}>
                <Controls
                  playerId={player.playerId}
                  onMove={handleMove}
                  onExit={exit}
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


