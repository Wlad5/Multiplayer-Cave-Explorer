import { Player } from "./playerReducer";

export const ADD_PLAYER     = 'ADD_PLAYER';
export const REMOVE_PLAYER  = 'REMOVE_PLAYER';
export const TURN_PLAYER    = 'TURN_PLAYER';
export const MOVE_PLAYER    = 'MOVE_PLAYER';
export const UPDATE_SCORE   = 'UPDATE_SCORE';
export const UPDATE_TRAP_IMMUNITY = 'UPDATE_TRAP_IMMUNITY';

export interface AddPlayerPayload  {
    player: Player
}

export interface RemovePlayerPayload {
    id: string;
}

export interface TurnPlayerPayload {
    id: string;
    move: string;
}
export interface MovePlayerPayload {
    id: string;
    grid: string[][]
}

export interface UpdateScorePayload {
    id: string;
    score: number;
}

export interface UpdateTrapImmunityPayload {
    id: string;
    trapImmunity: number;
}

export const addPlayerAC = (player: Player) => ({
    type: ADD_PLAYER,
    payload: {
        player
    }
})

export const removePlayerAC = (id: string) => ({
    type: REMOVE_PLAYER,
    payload: {
        id
    }
})

export const turnPlayerAC = (id: string, move: string) => ({
    type: TURN_PLAYER,
    payload: {
        id,
        move
    }
})

export const movePlayerAC = (id: string, grid: string[][]) => ({
    type: MOVE_PLAYER,
    payload: {
        id,
        grid
    }
})

export const updateScoreAC = (id: string, score: number) => ({
    type: UPDATE_SCORE,
    payload: {
        id,
        score
    }
})

export const updateTrapImmunity = (id: string, trapImmunity: number) => ({
    type: UPDATE_TRAP_IMMUNITY,
    payload: {
        id,
        trapImmunity
    }
})

export type AddPlayer   = ReturnType<typeof addPlayerAC>
export type RemovePlayer = ReturnType<typeof removePlayerAC>
export type TurnPlayer  = ReturnType<typeof turnPlayerAC>
export type MovePlayer  = ReturnType<typeof movePlayerAC>
export type UpdateScore = ReturnType<typeof updateScoreAC>
export type UpdateTrapImmunity = ReturnType<typeof updateTrapImmunity>
export type PlayerActions = 
    | AddPlayer
    | RemovePlayer
    | TurnPlayer
    | MovePlayer
    | UpdateScore
    | UpdateTrapImmunity;