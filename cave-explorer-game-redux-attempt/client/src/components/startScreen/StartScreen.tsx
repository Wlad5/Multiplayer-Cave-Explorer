import { Username } from "../username/Username"

interface StartScreenProps {
    play: () => void;
    join: (gameId: string) => void;
    username: string;
    setUsername: (username: string) => void;
    activeGames: string[];
}

export const StartScreen: React.FC<StartScreenProps> = ({play, join, username, setUsername, activeGames}) => {
    const onClickHandler = () => {
        play()
    }
    return (
        <div>
            <h1>Prepare for Treasure Hunt!</h1>
            <Username
                username={username}
                setUsername={setUsername}
            />
            <button
                onClick={onClickHandler}
                disabled={username === ''}
            >
                Start
            </button>
            {activeGames.length > 0 ? (
                <ul>
                {activeGames.map((gameId) => (
                    <li> key={gameId}
                        <button onClick={() => join(gameId)} disabled={username === ''}>
                            Join Game {gameId}
                        </button>
                    </li>
                ))}
            </ul>
            ) : (
                <p>No active games available.</p>
            )}
        </div>
    )
}