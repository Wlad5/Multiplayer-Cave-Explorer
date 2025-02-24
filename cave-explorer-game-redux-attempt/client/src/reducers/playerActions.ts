export const TURN_PLAYER                = 'TURN_PLAYER';
export const MOVE_PLAYER                = 'MOVE_PLAYER';

export interface TurnPlayerPayload {
    left: boolean;
}
export interface MovePlayerPayload {
    grid: string[][]
}

export const turnPlayerAC = (left: boolean) => ({
    type: TURN_PLAYER,
    payload: {
        left
    }
})

export const movePlayerAC = (grid: string[][]) => ({
    type: MOVE_PLAYER,
    payload: {
        grid
    }
})

export type TurnPlayer              = ReturnType<typeof turnPlayerAC>
export type MovePlayer              = ReturnType<typeof movePlayerAC>

export type PlayerActions = 
    | TurnPlayer
    | MovePlayer