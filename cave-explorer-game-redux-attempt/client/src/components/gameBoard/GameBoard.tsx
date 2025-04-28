import { RootState } from '../../store';
import styles from './gameBoard.module.css';
import { useSelector } from "react-redux";

interface GameBoardProps {
  exit?: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ exit }) => {
  const hiddenGrid = useSelector((state: RootState) => state.grid.hiddenGrid);
  const currentPlayer = useSelector((state: RootState) => state.game.currentPlayer) as { x: number; y: number } | null;
  

  const renderGrid = () => {
    return hiddenGrid.map((row, rowIndex) => (
      <div key={rowIndex} className="row">
        {row.map((cell, cellIndex) => {
          const isCurrentPlayer =
            rowIndex === currentPlayer?.x && cellIndex === currentPlayer?.y;
          const cellClass = 
            isCurrentPlayer
              ? `${styles.currentPlayer} cell`
              : cell === "^" || cell === ">" || cell === "v" || cell === "<"
              ? `${styles.player} cell`
              : cell === "T"
              ? `${styles.treasure} cell`
              : cell === "X"
              ? `${styles.trap} cell`
              : cell === "O"
              ? `${styles.obstacle} cell`
              : "cell";

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