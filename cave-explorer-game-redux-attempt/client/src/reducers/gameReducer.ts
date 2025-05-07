import { 
    GameActions,
    START_GAME,
    EXIT_GAME,
    END_GAME,
    SHOW_MESSAGE,
    ShowMessagePayload,
    SET_GAME_TIMER,
    SetGameTimerPayload,
    SET_TURN_TIMER,
    SetTurnTimerPayload,
    SET_MOVE_MADE,
    SetMoveMadePayload,
    EndGamePayload,
    SetCurrentPlayerPayload,
    SET_CURRENT_PLAYER,
    SetActiveGamesPayload,
    SET_ACTIVE_GAMES,
    SetWaitingPlayersPayload,
    SET_WAITING_PLAYERS
} from "./gameActions";
import { Player } from "./playerReducer";

export interface GameState {
    score: number;
    gameStatus: 'not_started' | 'in_progress' | 'ended';
    gameTimer: number | null;
    gameTimeLeft: number;
    turnTimer: number | null;
    turnTimeLeft: number;
    message?: string;
    currentPlayer: Player | null;
    playerMoved: boolean;
    leaderBoard: {username: string,playerId: number, score: number}[] | [];
    activeGames: string[] | [];
    waitingPlayers: Map<string, Player>;
    winner: {username: string, playerId: string, score: number} | null;
}

export const initialState: GameState = {
    score: 0,
    gameStatus: 'not_started',
    gameTimer: null,
    gameTimeLeft: 1 * 60 * 1000,
    turnTimer: null,
    turnTimeLeft: 10000,
    message: '',
    currentPlayer: null,
    playerMoved: false,
    leaderBoard: [],
    activeGames: [],
    waitingPlayers: new Map<string, Player>(),
    winner: null,
}

export const gameReducer = (state: GameState = initialState, action: GameActions): GameState => {
    switch(action.type) {
        case START_GAME: {
            return {
                ...state,
                gameStatus: 'in_progress'
            }
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
        case END_GAME: {
            if (state.gameTimer && state.turnTimer) {
                clearInterval(state.gameTimer);
                clearInterval(state.turnTimer);
            }
            if ('payload' in action) {
                const { playersScores, winner } = action.payload as EndGamePayload;
                console.log(playersScores)
                return {
                    ...state,
                    gameStatus: 'ended',
                    gameTimer: null,
                    turnTimer: null,
                    gameTimeLeft: 0,
                    turnTimeLeft: 0,
                    leaderBoard: playersScores,
                    winner: winner,
                };
            }
            return state;
        }
        case SET_WAITING_PLAYERS: {
            if ('payload' in action) {
                const {waitingPlayers} = action.payload as SetWaitingPlayersPayload;
                return {
                    ...state,
                    waitingPlayers: waitingPlayers
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
        case SET_CURRENT_PLAYER: {
            if ('payload' in action) {
                const {player} = action.payload as SetCurrentPlayerPayload;
                return {
                    ...state,
                    currentPlayer: player
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
        case SET_ACTIVE_GAMES: {
            if ('payload' in action) {
                const {activeGames} = action.payload as SetActiveGamesPayload;
                return {
                    ...state,
                    activeGames: activeGames
                }
            }
            return state;
        }
        default:
            return state;
    }
}