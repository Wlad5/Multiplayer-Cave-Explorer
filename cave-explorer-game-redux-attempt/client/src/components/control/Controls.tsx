import { useEffect } from "react"

interface ControlsProps {
    playerId: number
    onMove: (playerId: number, move:string) => void
    onExit: () => void
}

export const Controls: React.FC<ControlsProps> = ({playerId,onMove, onExit}) => {
    const handleMove = (move: string) => {
        onMove(playerId, move);
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch(e.key) {
                case 'l':
                    handleMove('L');
                    break;
                case 'r':
                    handleMove('R');
                    break;
                case 'f':
                    handleMove('F');
                    break;
                case 'e':
                    handleMove('E');
                    onExit();
                    break;
                default:
                    console.log('Invalid key');
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        }
    })
    return (
        <div className="controls">
            <a></a>
            <button onClick={() => handleMove('L')}>Left</button>
            <button onClick={() => handleMove('R')}>Right</button>
            <button onClick={() => handleMove('F')}>Forward</button>
        </div>
    )
}