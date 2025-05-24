interface MessageProps {
    message: string;
}
export const Message: React.FC<MessageProps> = ({ message }) => {
    switch (message) {
        default:                { return '' }
        case 'idle':            { return <div className="game-message">Idle</div> }
        case 'moved':           { return <div className="game-message">You Moved</div> }
        case 'hitTrap':         { return <div className="game-message">You hit a trap</div> }
        case 'hitObstacle':     { return <div className="game-message">You hit an obstacle</div> }
        case 'foundTreasure':   { return <div className="game-message">You found the treasure!</div> }
        case 'outOfBounds':     { return <div className="game-message">You cannot go out of bounds</div> }
    }
}