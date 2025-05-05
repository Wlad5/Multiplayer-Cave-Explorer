import { useEffect } from "react"
import { PlayerDirection } from "../../../../server/game/constants";

interface ControlsProps {
    playerId: number;
    onMove: (playerId: number, move:string) => void;
    onExit: () => void;
    disabled: boolean;
}

export const Controls: React.FC<ControlsProps> = ({playerId, onMove, onExit}) => {
    const handleMove = (move: string) => {
        onMove(playerId, move);
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch(e.key) {
                case 'ArrowUp'      : handleMove(PlayerDirection.NORTH);    break;
                case 'ArrowDown'    : handleMove(PlayerDirection.SOUTH);    break;
                case 'ArrowLeft'    : handleMove(PlayerDirection.WEST);     break;
                case 'ArrowRight'   : handleMove(PlayerDirection.EAST);     break;
                case 'w'            : handleMove(PlayerDirection.NORTH);    break;
                case 's'            : handleMove(PlayerDirection.SOUTH);    break;
                case 'a'            : handleMove(PlayerDirection.WEST);     break;
                case 'd'            : handleMove(PlayerDirection.EAST);     break;
                case 'f'            : handleMove('F');                      break;
                case 'e'            : handleMove('E'); onExit();            break;
                default             : console.log('Invalid key');
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        }
    })
    return (
        <div className="controls">
            <button onClick={() => handleMove(PlayerDirection.WEST)}>←</button>
            <button onClick={() => handleMove(PlayerDirection.EAST)}>→</button>
            <button onClick={() => handleMove(PlayerDirection.NORTH)}>↑</button>
            <button onClick={() => handleMove(PlayerDirection.SOUTH)}>↓</button>
            <button onClick={() => handleMove('F')}>Forward</button>
        </div>
    )
}