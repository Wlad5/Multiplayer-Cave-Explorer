import { ChangeEvent } from "react"

interface UserNameProps {
    username: string
    setUsername: (username: string) => void
}

export const Username: React.FC<UserNameProps> = ({username, setUsername}) => {
    const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    }
    return (
        <div>
            <h4>Enter a username:</h4>
            <input
                type={'text'}
                placeholder={'Username: '}
                value={username}
                onChange={changeHandler}
            />
        </div>
    )
}