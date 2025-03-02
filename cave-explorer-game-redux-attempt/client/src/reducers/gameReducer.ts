import { GameActions, UpdateScorePayload, START_GAME, END_GAME, UPDATE_SCORE, SHOW_MESSAGE, ShowMessagePayload } from "./gameActions";

interface GameState {
    score: number;
    gameStatus: 'not_started' | 'in_progress' | 'ended';
    message?: string;
}

export const initialState: GameState = {
    score: 0,
    gameStatus: 'not_started',
    message: ''
}

export const gameReducer = (state = initialState, action: GameActions): GameState => {
    switch(action.type) {
        case START_GAME:
            return {
                ...state,
                gameStatus: 'in_progress'
            }
        case END_GAME:
            return {
                ...state,
                gameStatus: 'ended'
            }
        case UPDATE_SCORE: {
            if ('payload' in action) {
                const { score } = action.payload as UpdateScorePayload;
                return {
                    ...state,
                    score: score
                }
            }
            return state;
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
        default:
            return state;
    }
}