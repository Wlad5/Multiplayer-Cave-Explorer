import { GameActions, START_GAME, EXIT_GAME, END_GAME, SHOW_MESSAGE, ShowMessagePayload, NEXT_TURN, NextTurnPayload } from "./gameActions";

export interface GameState {
    score: number;
    gameStatus: 'not_started' | 'in_progress' | 'ended';
    message?: string;
    currentPlayer: number;
}

export const initialState: GameState = {
    score: 0,
    gameStatus: 'not_started',
    message: '',
    currentPlayer: 0
}

export const gameReducer = (state: GameState = initialState, action: GameActions): GameState => {
    switch(action.type) {
        case START_GAME:
            return {
                ...state,
                gameStatus: 'in_progress'
            }
        case EXIT_GAME: {
            return {
                ...state,
                gameStatus: 'ended'
            }
        }
        case END_GAME:
            return {
                ...state,
                gameStatus: 'ended'
            }
        case SHOW_MESSAGE: {
            if ('payload' in action) {
                const {message} = action.payload as ShowMessagePayload;
                return {
                    ...state,
                    message: message
                }
            }
            return state;
        }
        case NEXT_TURN: {
            if ('payload' in action) {
                const {length} = action.payload as NextTurnPayload;    
                const nextPlayer = (state.currentPlayer + 1) % length;
                return {
                    ...state,
                    currentPlayer: nextPlayer
                }
            }
            return state;
        }
        default:
            return state;
    }
}