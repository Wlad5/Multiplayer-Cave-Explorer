import styles from './waitingRoom.module.css';
import { Player } from "../../reducers/playerReducer";

export interface WaitingRoomProps {
    players: Map<string, Player>;
    leaveWaitingRoom: () => void;   
}

export const WaitingRoom = ({ players, leaveWaitingRoom }: WaitingRoomProps) => {
    const playersArray = Array.from(players.values());
    
    return (
        <div className={styles['waiting-room']}>
            <button className={styles['exit-button']} onClick={leaveWaitingRoom}>Exit</button>
            <div className={styles['loader']}>Waiting for players...</div>
            <div className={styles['waiting-players']}>
                <ul>
                    {playersArray.map((player, index) => (
                        <li key={index} className={styles['player-username']}>
                            {player.username}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};