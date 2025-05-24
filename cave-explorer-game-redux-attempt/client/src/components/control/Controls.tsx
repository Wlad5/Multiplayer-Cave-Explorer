import { PlayerDirection } from "../../../../server/game/constants";
import styles from "./controls.module.css";

export interface ControlsProps {
    handleInput: (direction: string) => void;
}
export const Controls = ({handleInput}: ControlsProps) => {
    return (
        <div className={styles.arrowGrid}>
            <div style={{ gridColumn: 2, gridRow: 1 }}>
                <button className={styles.arrowBtn} onClick={() => handleInput(PlayerDirection.NORTH)}>↑</button>
            </div>
            <div style={{ gridColumn: 1, gridRow: 2 }}>
                <button className={styles.arrowBtn} onClick={() => handleInput(PlayerDirection.WEST)}>←</button>
            </div>
            <div style={{ gridColumn: 2, gridRow: 2 }}>
                <button className={styles.arrowBtn} onClick={() => handleInput(PlayerDirection.SOUTH)}>↓</button>
            </div>
            <div style={{ gridColumn: 3, gridRow: 2 }}>
                <button className={styles.arrowBtn} onClick={() => handleInput(PlayerDirection.EAST)}>→</button>
            </div>
            <button className={styles.forwardBtn} onClick={() => handleInput('F')}>Forward</button>
        </div>
    )
}