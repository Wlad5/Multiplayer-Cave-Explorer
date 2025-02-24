import { useDispatch, useSelector} from "react-redux";
import { Controls } from "./components/control/Controls";
import { Message } from "./components/message/Message";
import { StartScreen } from "./components/startScreen/StartScreen";
import GameBoard from "./components/gameBoard/GameBoard";
import { useEffect, useState } from "react";
import { clearCellAC, placeRandomItemsAC, revealCurrentCellAC } from "./reducers/gridActions";
import { OBSTACLE, TRAP, TREASURE } from "../../server/game/constants";
import { movePlayerAC, turnPlayerAC } from "./reducers/playerActions";
import { RootState } from "./store";

function App() {
  const dispatch = useDispatch();

  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [startGame, setStartGame] = useState(false);
  const grid = useSelector((state: RootState) => state.grid.grid);
  const playerX = useSelector((state: RootState) => state.player.x);
  const playerY = useSelector((state: RootState) => state.player.y);
  const playerDirection = useSelector((state: RootState) => state.player.direction);

  const handleMove = (move: string) => {
    const previousX = playerX;
    const previousY = playerY;
  
    
    if (move === 'R') {
      dispatch(turnPlayerAC(false))
    }
    if (move === 'L') {
      dispatch(turnPlayerAC(true))
    }
    if (move === 'F') {
      dispatch(movePlayerAC(grid));
      dispatch(clearCellAC(previousX, previousY));
    }
  
    setMessage(`Moved ${move}`);
  };

  const exit = () => {
    setStartGame(false);
  };
  
  const play = () => {
    setMessage("");
    setStartGame(true);
  };

  useEffect(() => {
    dispatch(placeRandomItemsAC(TREASURE, 5));
    dispatch(placeRandomItemsAC(TRAP, 10));
    dispatch(placeRandomItemsAC(OBSTACLE, 15));
  }, []);

  useEffect(() => {
    dispatch(revealCurrentCellAC(playerX, playerY, playerDirection));
  }, [playerX, playerY, playerDirection]);

  return (
    <div className="app">
      {startGame ? (
        <StartScreen play={play} username={username} setUsername={setUsername} />
      ) : (
        <div>
          <GameBoard exit={exit} />
          <Controls onMove={handleMove} onExit={exit} />
          <Message message={message} />
        </div>
      )}
    </div>
  );
}

export default App;


