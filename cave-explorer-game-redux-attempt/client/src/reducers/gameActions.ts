import { Player } from "./playerReducer";

export const START_GAME     = 'START_GAME';
export const END_GAME       = 'END_GAME';
export const SHOW_MESSAGE   = 'SHOW_MESSAGE';
export const EXIT_GAME      = 'EXIT_GAME';
export const SET_WAITING_PLAYERS = 'SET_WAITING_PLAYERS';
export const SET_CURRENT_PLAYER = 'SET_CURRENT_PLAYER';
export const SET_GAME_TIMER = 'SET_GAME_TIMER';
export const SET_TURN_TIMER = 'SET_TURN_TIMER';
export const SET_MOVE_MADE  = 'SET_MOVE_MADE';
export const SET_ACTIVE_GAMES = 'SET_ACTIVE_GAMES';

export interface ShowMessagePayload {
    message: string;
}

export interface SetCurrentPlayerPayload {
    player: Player | null;
}

export interface SetGameTimerPayload {
    timerId: number;
    time: number;
}

export interface SetTurnTimerPayload {
    turnTimerId: number;
    time: number;
}

export interface SetMoveMadePayload {
    moveMade: boolean;
}



export interface SetActiveGamesPayload {
    activeGames: string[];
}

export interface SetWaitingPlayersPayload {
    waitingPlayers: Map<string, Player>
}

export const startGameAC = () => ({
    type: START_GAME
})

export interface EndGamePayload {
    playersScores: {username: string, playerId: number, score: number}[];
    winner: {username: string, playerId: string, score: number};
}

export const exitGameAC = () => ({
    type: EXIT_GAME
})

export const endGameAC = (playersScores: {username: string, playerId: number, score: number}[], winner: {username: string, playerId: string, score: number}) => ({
    type: END_GAME,
    payload: {
        playersScores,
        winner
    }
})

export const showMessageAC = (message: string) => ({
    type: SHOW_MESSAGE,
    payload: {
        message
    }
})

export const setWaitingPlayersAC = (waitingPlayers: Map<string, Player>) => ({
    type: SET_WAITING_PLAYERS,
    payload: {
        waitingPlayers
    }
})

export const setCurrentPlayerAC = (player: Player | null) => ({
    type: SET_CURRENT_PLAYER,
    payload: {
        player
    }
})

export const setGameTimerAC = (time: number) => ({
    type: SET_GAME_TIMER,
    payload: {
        time
    }
});

export const setTurnTimerAC = (time: number) => ({
    type: SET_TURN_TIMER,
    payload: {
        time
    }
})

export const setMoveMadeAC = (moveMade: boolean) => ({
    type: SET_MOVE_MADE,
    payload: {
        moveMade
    }
})

export const setActiveGamesAC = (activeGames: string[]) => ({
    type: SET_ACTIVE_GAMES,
    payload: {
        activeGames
    }
})

export type StartGame       = ReturnType<typeof startGameAC>
export type ExitGame        = ReturnType<typeof exitGameAC>
export type EndGame         = ReturnType<typeof endGameAC>
export type ShowMessage     = ReturnType<typeof showMessageAC>
export type SetWaitingPlayers = ReturnType<typeof setWaitingPlayersAC>
export type SetGameTimer    = ReturnType<typeof setGameTimerAC>
export type SetTurnTimer    = ReturnType<typeof setTurnTimerAC>
export type SetMoveMade     = ReturnType<typeof setMoveMadeAC>
export type SetCurrentPlayer = ReturnType<typeof setCurrentPlayerAC>
export type SetActiveGames  = ReturnType<typeof setActiveGamesAC>
export type GameActions     = 
    | StartGame
    | ExitGame
    | EndGame
    | SetWaitingPlayers
    | SetCurrentPlayer
    | ShowMessage
    | SetGameTimer
    | SetTurnTimer
    | SetMoveMade
    | SetActiveGames;