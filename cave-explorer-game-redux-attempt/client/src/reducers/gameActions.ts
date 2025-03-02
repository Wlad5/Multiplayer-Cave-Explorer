export const START_GAME = 'START_GAME';
export const END_GAME = 'END_GAME';
export const UPDATE_SCORE = 'UPDATE_SCORE';
export const SHOW_MESSAGE = 'SHOW_MESSAGE';

export interface UpdateScorePayload {
    score: number;
}

export interface ShowMessagePayload {
    message: string;
}

export const startGameAC = () => ({
    type: START_GAME
})

export const endGameAC = () => ({
    type: END_GAME
})

export const updateScoreAC = (score: number) => ({
    type: UPDATE_SCORE,
    payload: {
        score: score
    }
})

export const showMessageAC = (message: string) => ({
    type: SHOW_MESSAGE,
    payload: {
        message: message
    }
})

export type StartGame = ReturnType<typeof startGameAC>
export type EndGame = ReturnType<typeof endGameAC>
export type UpdateScore = ReturnType<typeof updateScoreAC>
export type ShowMessage = ReturnType<typeof showMessageAC>
export type GameActions = 
    | StartGame
    | EndGame
    | UpdateScore
    | ShowMessage;