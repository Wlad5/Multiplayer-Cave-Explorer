import { PlayerDirection } from "../../../../server/game/constants";

export interface ControlsProps {
    handleInput: (direction: string) => void;
}
export const Controls = ({handleInput}: ControlsProps) => {
    return (
        <>
            <button onClick={() => handleInput(PlayerDirection.WEST)}>←</button>
            <button onClick={() => handleInput(PlayerDirection.EAST)}>→</button>
            <button onClick={() => handleInput(PlayerDirection.NORTH)}>↑</button>
            <button onClick={() => handleInput(PlayerDirection.SOUTH)}>↓</button>
            <button onClick={() => handleInput('F')}>Forward</button>
        </>
    )
}