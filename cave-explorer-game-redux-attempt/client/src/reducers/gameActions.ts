import { Player } from "./playerReducer";

export const START_GAME     = 'START_GAME';
export const END_GAME       = 'END_GAME';
export const SHOW_MESSAGE   = 'SHOW_MESSAGE';
export const EXIT_GAME      = 'EXIT_GAME';
export const ADD_PLAYER_TO_WAITING_ROOM = 'ADD_PLAYER_TO_WAITING_ROOM';
export const REMOVE_PLAYER_FROM_WAITING_ROOM = 'REMOVE_PLAYER_FROM_WAITING_ROOM';
export const SET_CURRENT_PLAYER = 'SET_CURRENT_PLAYER';
export const SET_GAME_TIMER = 'SET_GAME_TIMER';
export const SET_TURN_TIMER = 'SET_TURN_TIMER';
export const SET_MOVE_MADE  = 'SET_MOVE_MADE';
export const SET_ACTIVE_GAMES = 'SET_ACTIVE_GAMES';

export interface ShowMessagePayload {
    message: string;
}

export interface SetCurrentPlayerPayload {
    playerId: string;
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

export interface EndGamePayload {
    playersScores: {playerId: number, score: number}[];
}

export interface SetActiveGamesPayload {
    activeGames: string[];
}

export interface AddPlayerToWaitingRoomPayload {
    player: Player;
}

export interface RemovePlayerFromWaitingRoomPayload {
    player: Player;
}

export const startGameAC = () => ({
    type: START_GAME
})

export const exitGameAC = () => ({
    type: EXIT_GAME
})

export const endGameAC = (playersScores: {playerId: number, score: number}[]) => ({
    type: END_GAME,
    payload: {
        playersScores
    }
})

export const showMessageAC = (message: string) => ({
    type: SHOW_MESSAGE,
    payload: {
        message
    }
})

export const addPlayerToWaitingRoomAC = (player: Player) => ({
    type: ADD_PLAYER_TO_WAITING_ROOM,
    payload: {
        player
    }
})

export const removePlayerFromWaitingRoomAC = (player: Player) => ({
    type: REMOVE_PLAYER_FROM_WAITING_ROOM,
    payload: {
        player
    }
})

export const setCurrentPlayerAC = (playerId: string) => ({
    type: SET_CURRENT_PLAYER,
    payload: {
        playerId
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
export type AddPlayerToWaitingRoom = ReturnType<typeof addPlayerToWaitingRoomAC>
export type RemovePlayerFromWaitingRoom = ReturnType<typeof removePlayerFromWaitingRoomAC>
export type SetGameTimer    = ReturnType<typeof setGameTimerAC>
export type SetTurnTimer    = ReturnType<typeof setTurnTimerAC>
export type SetMoveMade     = ReturnType<typeof setMoveMadeAC>
export type SetCurrentPlayer = ReturnType<typeof setCurrentPlayerAC>
export type SetActiveGames  = ReturnType<typeof setActiveGamesAC>
export type GameActions     = 
    | StartGame
    | ExitGame
    | EndGame
    | AddPlayerToWaitingRoom
    | RemovePlayerFromWaitingRoom
    | SetCurrentPlayer
    | ShowMessage
    | SetGameTimer
    | SetTurnTimer
    | SetMoveMade
    | SetActiveGames;