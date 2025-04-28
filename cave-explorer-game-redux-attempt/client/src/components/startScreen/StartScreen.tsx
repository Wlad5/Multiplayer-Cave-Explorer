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
                activeGames.map((game) => (
                    <div key={game}>
                        <button onClick={() => join(game)}>Join Game {game}</button>
                    </div>
                ))
            ) : (
            <p>No active games available</p>
            )}
        </div>
    )
}