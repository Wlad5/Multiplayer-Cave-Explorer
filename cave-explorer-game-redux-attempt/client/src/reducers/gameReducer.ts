import { GameActions, START_GAME, EXIT_GAME, END_GAME, SHOW_MESSAGE, ShowMessagePayload, NEXT_TURN, NextTurnPayload, SET_GAME_TIMER, SetGameTimerPayload, SET_TURN_TIMER, SetTurnTimerPayload, SET_MOVE_MADE, SetMoveMadePayload, EndGamePayload } from "./gameActions";

export interface GameState {
    score: number;
    gameStatus: 'not_started' | 'in_progress' | 'ended';
    gameTimer: number | null;
    gameTimeLeft: number;
    turnTimer: number | null;
    turnTimeLeft: number;
    message?: string;
    currentPlayer: number;
    playerMoved: boolean;
    leaderBoard: {playerId: number, score: number}[] | [];
}

export const initialState: GameState = {
    score: 0,
    gameStatus: 'not_started',
    gameTimer: null,
    gameTimeLeft: 1 * 60 * 1000,
    turnTimer: null,
    turnTimeLeft: 10000,
    message: '',
    currentPlayer: 0,
    playerMoved: false,
    leaderBoard: [],
}

export const gameReducer = (state: GameState = initialState, action: GameActions): GameState => {
    switch(action.type) {
        case START_GAME:
            return {
                ...state,
                gameStatus: 'in_progress'
            }
        case EXIT_GAME: {
            if (state.gameTimer && state.turnTimer) {
                clearInterval(state.gameTimer);
                clearInterval(state.turnTimer);
            }
            return {
                ...state,
                gameStatus: 'ended',
                gameTimer: null,
                turnTimer: null,
                gameTimeLeft: 0,
                turnTimeLeft: 0
            }
        }
        case END_GAME:
    if (state.gameTimer && state.turnTimer) {
        clearInterval(state.gameTimer);
        clearInterval(state.turnTimer);
    }
    if ('payload' in action) {
        const { playersScores } = action.payload as EndGamePayload;
        const sortedPlayerScores = playersScores.sort((a, b) => b.score - a.score);
        console.log(playersScores)
        return {
            ...state,
            gameStatus: 'ended',
            gameTimer: null,
            turnTimer: null,
            gameTimeLeft: 0,
            turnTimeLeft: 0,
            leaderBoard: sortedPlayerScores
        };
    }
    return state;
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
                    currentPlayer: nextPlayer,
                    playerMoved: false,
                    turnTimeLeft: 10000
                }
            }
            return state;
        }
        case SET_GAME_TIMER: {
            if ('payload' in action) {
                const { timerId, time } = action.payload as SetGameTimerPayload;
                return {
                    ...state,
                    gameTimer: timerId,
                    gameTimeLeft: time
                };
            }
            return state;
        }
        case SET_TURN_TIMER: {
            if ('payload' in action) {
                const {turnTimerId, time} = action.payload as SetTurnTimerPayload;
                return {
                    ...state,
                    turnTimer: turnTimerId,
                    turnTimeLeft: time
                }
            }
            return state;
        }
        case SET_MOVE_MADE: {
            if ('payload' in action) {
                const {moveMade} = action.payload as SetMoveMadePayload;
                return {
                    ...state,
                    playerMoved: moveMade
                }
            }
            return state;
        }
        default:
            return state;
    }
}