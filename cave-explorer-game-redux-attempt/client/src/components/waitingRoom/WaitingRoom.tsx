import { Player } from "../../reducers/playerReducer";

export interface WaitingRoomProps {
    players: Map<string, Player>;
    leaveWaitingRoom: () => void;   
}

export const WaitingRoom = ({ players, leaveWaitingRoom }: WaitingRoomProps) => {
    const playersArray = Array.from(players.values());
    
    return (
      <div className={'waiting-room'}>
        <button onClick={leaveWaitingRoom}>X</button>
        <div className={'loader'}>Loader</div>
        <div className={'waiting-players'}>
          <ul>
            {playersArray.map((player, index) => (
              <li key={index}>
                <span className={'playerUsername'}>{player.username}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };