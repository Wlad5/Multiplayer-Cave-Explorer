export interface WaitingRoomProps {
    players: Map<string, {username: string}>;    
}

export const WaitingRoom = ({players}: WaitingRoomProps)  => {
    console.log('Waiting players:', Array.from(players.values()));
    return (
        <div className={'waiting-room'}>
            <div className={'loader'}>Loader</div>
            <div className={'waiting-players'}>
                <ul>
                    {Array.from(players.values()).map((player, index) => (
                        <li key={index}>
                            <span className={'player-username'}>{player.username}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}