import { RootState } from '../../store';
import styles from './gameBoard.module.css';
import { useSelector } from "react-redux";

interface GameBoardProps {
  exit: () => void;
}


export const GameBoard: React.FC<GameBoardProps> = ({ exit }) => {
  const grid = useSelector((state: RootState) => state.grid.grid)
  const hiddenGrid = useSelector((state: RootState) => state.grid.hiddenGrid);

  const renderGrid = () => {
    return grid.map((row, rowIndex) => (
      <div key={rowIndex} className="row">
        {row.map((cell, cellIndex) => {
          const cellClass = cell === "^" || cell === ">" || cell === "v" || cell === "<" ? `${styles.player} cell` : "cell";
          return (
            <span key={cellIndex} className={cellClass}>
              {cell}
            </span>
          );
        })}
      </div>
    ));
  };

  return (
    <div className={styles.gameBoard}>
      <button className={styles.exitBtn} onClick={exit}>X</button>
      {renderGrid()}
    </div>
  );
};

export default GameBoard;
