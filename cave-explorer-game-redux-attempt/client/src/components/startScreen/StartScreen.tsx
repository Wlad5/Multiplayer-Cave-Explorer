import { useState } from "react";
import { Username } from "../username/Username"
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { WaitingRoom } from "../waitingRoom/WaitingRoom";

interface StartScreenProps {
    play: () => void;
    join: () => void;
    joinActiveGame: (gameId: string) => void;
    username: string;
    setUsername: (username: string) => void;
    activeGames: string[];
    leaveWaitingRoom: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({play, join, joinActiveGame, username, setUsername, activeGames, leaveWaitingRoom}) => {
    const [showWaitingRoom, setShowWaitingRoom] = useState(false);
    const waitingPlayers                        = useSelector((state: RootState) => state.game.waitingPlayers);
    
    const handleJoinActiveGame = (gameId: string) => {
        if (username.trim()) {
            joinActiveGame(gameId);
        } else {
            console.error("Please enter a valid username.");
        }
    }
    const handleLeaveWaitingRoom = () => {
        leaveWaitingRoom();
        setShowWaitingRoom(false);
    }
    const handleJoinClick = () => {
        if (username.trim()) {
            join()
            setShowWaitingRoom(true);
        } else {
            console.error("Please enter a valid username.");
        }
    };
    return (
        <div>
            {showWaitingRoom ? (
                <WaitingRoom players={waitingPlayers} leaveWaitingRoom={handleLeaveWaitingRoom}/>
            ) : (
                <>
                    <h1>Prepare for Treasure Hunt!</h1>
                    <Username username={username} setUsername={setUsername} />
                    <button onClick={play} disabled={username === ""}>
                        Start
                    </button>
                    <button onClick={handleJoinClick} disabled={!username}>
                        Join Game
                    </button>
                    {activeGames.length > 0 && (
                        <div className="active-games">
                            <h2>Active Games:</h2>
                            <ul>
                                {activeGames.map((gameId) => (
                                    <li key={gameId}>
                                        <button onClick={() => handleJoinActiveGame(gameId)}>{gameId}</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}