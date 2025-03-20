import { Dispatch } from "redux";
import { AppThunk, RootState } from "../store";

export const START_GAME     = 'START_GAME';
export const END_GAME       = 'END_GAME';
export const SHOW_MESSAGE   = 'SHOW_MESSAGE';
export const NEXT_TURN      = 'NEXT_TURN';
export const EXIT_GAME      = 'EXIT_GAME';
export const SET_GAME_TIMER = 'SET_GAME_TIMER';
export const SET_TURN_TIMER = 'SET_TURN_TIMER';
export const SET_MOVE_MADE  = 'SET_MOVE_MADE';

export interface ShowMessagePayload {
    message: string;
}

export interface NextTurnPayload {
    length: number;
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

export const setGameTimerAC = (timerId: number, time: number) => ({
    type: SET_GAME_TIMER,
    payload: {
        timerId,
        time
    }
});

export const setTurnTimerAC = (turnTimerId: number, time: number) => ({
    type: SET_TURN_TIMER,
    payload: {
        turnTimerId,
        time
    }
})

export const setMoveMadeAC = (moveMade: boolean) => ({
    type: SET_MOVE_MADE,
    payload: {
        moveMade
    }
})

export const gameTimerTC = (): AppThunk => (dispatch: Dispatch<GameActions>, getState: () => RootState) => {
    dispatch(startGameAC());
    const existingTimer = getState().game.gameTimer;
    let timeLeft        = getState().game.gameTimeLeft;
    if (existingTimer) clearInterval(existingTimer);
    const timerId = window.setInterval(() => {
        timeLeft -= 1000;
        console.log("Time left:", timeLeft);
        dispatch(setGameTimerAC(timerId, timeLeft));
        if (timeLeft <= 0) {
            clearInterval(timerId);
            dispatch(endGameAC());
        }
    }, 1000);
};

export const turnTimerTC = (): AppThunk => (dispatch: Dispatch<GameActions>, getState: () => RootState) => {
    const existingTurnTimer = getState().game.turnTimer;
    const currentPlayer     = getState().game.currentPlayer;
    const playerMoved       = getState().game.playerMoved;
    const players           = getState().player;
    const gameTimeLeft      = getState().game.gameTimeLeft;
    const gameStatus        = getState().game.gameStatus;
    let turnTimeLeft        = getState().game.turnTimeLeft;
    if (gameStatus !== 'in_progress') return;
    console.log(`${currentPlayer} player's turn`);
    if (existingTurnTimer) {
        clearInterval(existingTurnTimer);
        dispatch(setTurnTimerAC(0, getState().game.turnTimeLeft))
    } 
    const turnTimerId = window.setInterval(() => {
        if (gameTimeLeft <= turnTimeLeft || gameTimeLeft <= 0) {
            clearInterval(turnTimerId);
            dispatch(endGameAC());
            return;
        }
        turnTimeLeft -= 1000;
        console.log(`Turn time left: `, turnTimeLeft);
        dispatch(setTurnTimerAC(turnTimerId, turnTimeLeft));
        if (turnTimeLeft <= 0 || playerMoved) {
            clearInterval(turnTimerId);
            dispatch(nextTurnAC(players.length));
        }
    }, 1000);
    dispatch(setTurnTimerAC(turnTimerId, turnTimeLeft));
}

export type StartGame       = ReturnType<typeof startGameAC>
export type EndGame         = ReturnType<typeof endGameAC>
export type ShowMessage     = ReturnType<typeof showMessageAC>
export type NextTurn        = ReturnType<typeof nextTurnAC>
export type ExitGame        = ReturnType<typeof exitGameAC>
export type SetGameTimer    = ReturnType<typeof setGameTimerAC>
export type SetTurnTimer    = ReturnType<typeof setTurnTimerAC>
export type SetMoveMade     = ReturnType<typeof setMoveMadeAC>
export type GameActions     = 
    | StartGame
    | ExitGame
    | EndGame
    | NextTurn
    | ShowMessage
    | SetGameTimer
    | SetTurnTimer
    | SetMoveMade;