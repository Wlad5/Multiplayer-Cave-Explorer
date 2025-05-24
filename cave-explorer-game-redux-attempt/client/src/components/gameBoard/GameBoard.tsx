import { RootState } from '../../store';
import styles from './gameBoard.module.css';
import { useSelector } from "react-redux";

interface GameBoardProps {
  exit?: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ exit }) => {
  const hiddenGrid    = useSelector((state: RootState) => state.grid.hiddenGrid);
  const currentPlayer = useSelector((state: RootState) => state.game.currentPlayer) as { x: number; y: number } | null;

  return (
    <div className={styles.gameBoardContainer}>
      <button className={styles.exitBtn} onClick={exit}>Exit Game</button>
      <div
        className={styles.gameBoard}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${hiddenGrid[0]?.length || 0}, 1fr)`,
          gridTemplateRows: `repeat(${hiddenGrid.length || 0}, 1fr)`,
        }}
      >
        {hiddenGrid.flatMap((row, rowIndex) =>
          row.map((cell, cellIndex) => {
            const isCurrentPlayer =
              rowIndex === currentPlayer?.x && cellIndex === currentPlayer?.y;
            return (
              <div
                key={`${rowIndex}-${cellIndex}`}
                className={`cell ${isCurrentPlayer ? styles.currentPlayer : ""}`}
              >
                {cell}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GameBoard;