import { Username } from "../username/Username"

interface StartScreenProps {
    play: () => void
    username: string
    setUsername: (username: string) => void
}

export const StartScreen: React.FC<StartScreenProps> = ({play, username, setUsername}) => {
    const onClickHandler = () => {
        play()
    }
    return (
        <div>
            <h1>Prepare for Treasure Hunt!</h1>
            <button
                onClick={onClickHandler}
                disabled={username === ''}
            >Start</button>
            <Username
                username={username}
                setUsername={setUsername}
            />
        </div>
    )
}