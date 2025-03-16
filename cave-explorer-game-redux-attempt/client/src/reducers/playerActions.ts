export const TURN_PLAYER    = 'TURN_PLAYER';
export const MOVE_PLAYER    = 'MOVE_PLAYER';
export const UPDATE_SCORE   = 'UPDATE_SCORE';

export interface Player {
    id: number;
    x: number;
    y: number;
    direction: string;
    score: number;
    status: 'idle' | 'moved' | 'hitTrap' | 'hitObstacle' | 'foundTreasure' | 'outOfBounds';
}

export interface TurnPlayerPayload {
    id: number;
    left: boolean;
}
export interface MovePlayerPayload {
    id: number;
    grid: string[][]
}

export interface UpdateScorePayload {
    playerId: number;
    score: number;
}

export const turnPlayerAC = (id: number, left: boolean) => ({
    type: TURN_PLAYER,
    payload: {
        id,
        left
    }
})

export const movePlayerAC = (id: number,grid: string[][]) => ({
    type: MOVE_PLAYER,
    payload: {
        id,
        grid
    }
})

export const updateScoreAC = (playerId: number, score: number) => ({
    type: UPDATE_SCORE,
    payload: {
        playerId,
        score
    }
})

export type TurnPlayer  = ReturnType<typeof turnPlayerAC>
export type MovePlayer  = ReturnType<typeof movePlayerAC>
export type UpdateScore = ReturnType<typeof updateScoreAC>


export type PlayerActions = 
    | TurnPlayer
    | MovePlayer
    | UpdateScore;