export const START_GAME     = 'START_GAME';
export const END_GAME       = 'END_GAME';
export const SHOW_MESSAGE   = 'SHOW_MESSAGE';
export const NEXT_TURN      = 'NEXT_TURN';
export const EXIT_GAME      = 'EXIT_GAME';

export interface ShowMessagePayload {
    message: string;
}

export interface NextTurnPayload {
    length: number;
}

export const startGameAC = () => ({
    type: START_GAME
})

export const exitGameAC = () => ({
    type: EXIT_GAME
})

export const endGameAC = () => ({
    type: END_GAME
})

export const showMessageAC = (message: string) => ({
    type: SHOW_MESSAGE,
    payload: {
        message
    }
})

export const nextTurnAC = (length: number) => ({
    type: NEXT_TURN,
    payload: {
        length
    }
})

export type StartGame       = ReturnType<typeof startGameAC>
export type EndGame         = ReturnType<typeof endGameAC>
export type ShowMessage     = ReturnType<typeof showMessageAC>
export type NextTurn        = ReturnType<typeof nextTurnAC>
export type ExitGame        = ReturnType<typeof exitGameAC>
export type GameActions     = 
    | StartGame
    | ExitGame
    | EndGame
    | NextTurn
    | ShowMessage;