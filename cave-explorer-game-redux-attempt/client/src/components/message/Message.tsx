interface MessageProps {
    message: string;
}
export const Message: React.FC<MessageProps> = ({ message }) => {
    switch (message) {
        default:                { return '' }
        case 'idle':            { return <div>Idle</div> }
        case 'moved':           { return <div>You Moved</div> }
        case 'hitTrap':         { return <div>You hit a trap</div> }
        case 'hitObstacle':     { return <div>You hit an obstacle</div> }
        case 'foundTreasure':   { return <div>You found the treasure!</div> }
        case 'outOfBounds':     { return <div>You cannot go out of bounds</div> }
    }
}