
import { gameReducer, GameState, initialState } from "../../../src/reducers/gameReducer"; // Adjust the path as needed
import { SET_ACTIVE_GAMES, SET_CURRENT_PLAYER, SET_GAME_TIMER, SET_MOVE_MADE, SET_WAITING_PLAYERS, SHOW_MESSAGE, SET_TURN_TIMER, START_GAME, END_GAME, EXIT_GAME } from "../../../src/reducers/gameActions";
import { Player } from "../../../src/reducers/playerReducer";
import { PlayerDirection } from "../../../../server/game/constants";

describe("gameReducer", () => {
it("should return the initial state when passed an unknown action", () => {
    const state = gameReducer(undefined, { type: "UNKNOWN" });
    expect(state).toEqual(initialState);
});

it("should handle START_GAME", () => {
    const state = gameReducer(initialState, { type: START_GAME });
    expect(state.gameStatus).toBe("in_progress");
});

it("should handle EXIT_GAME", () => {
    const prevState: GameState = {
        ...initialState,
        gameStatus: "in_progress",
        gameTimer: 123 ,
        turnTimer: 456 ,
        gameTimeLeft: 5000,
        turnTimeLeft: 5000
    };
    const state = gameReducer(prevState, { type: EXIT_GAME });
    expect(state.gameStatus).toBe("ended");
    expect(state.gameTimer).toBeNull();
    expect(state.turnTimer).toBeNull();
    expect(state.gameTimeLeft).toBe(0);
    expect(state.turnTimeLeft).toBe(0);
});

it("should handle END_GAME with payload", () => {
    const payload = {
        playersScores: [{ username: "a", playerId: 1, score: 10 }],
        winner: { username: "a", playerId: "1", score: 10 }
    };
    const prevState: GameState = {
        ...initialState,
        gameStatus: "in_progress",
        gameTimer: 1 as unknown as number,
        turnTimer: 2 as unknown as number
    };
    const state = gameReducer(prevState, { type: END_GAME, payload });
    expect(state.gameStatus).toBe("ended");
    expect(state.leaderBoard).toEqual(payload.playersScores);
    expect(state.winner).toEqual(payload.winner);
    expect(state.gameTimer).toBeNull();
    expect(state.turnTimer).toBeNull();
    expect(state.gameTimeLeft).toBe(0);
    expect(state.turnTimeLeft).toBe(0);
});

it("should handle SHOW_MESSAGE", () => {
    const state = gameReducer(initialState, { type: SHOW_MESSAGE, payload: { message: "Hello" } });
    expect(state.message).toBe("Hello");
});

it("should handle SET_GAME_TIMER", () => {
    const state = gameReducer(initialState, { type: SET_GAME_TIMER, payload: { timerId: 99, time: 1234 } });
    expect(state.gameTimer).toBe(99);
    expect(state.gameTimeLeft).toBe(1234);
});

it("should handle SET_TURN_TIMER", () => {
    const state = gameReducer(initialState, { type: SET_TURN_TIMER, payload: { timerId: 88, time: 4321 } });
    expect(state.turnTimer).toBe(88);
    expect(state.turnTimeLeft).toBe(4321);
});

it("should handle SET_MOVE_MADE", () => {
    const state = gameReducer(initialState, { type: SET_MOVE_MADE, payload: { moveMade: true } });
    expect(state.playerMoved).toBe(true);
});

it("should handle SET_CURRENT_PLAYER", () => {
    const player: Player = { 
        id: "p1", 
        username: "test", 
        score: 0, 
        x: 0, 
        y: 0, 
        direction: PlayerDirection.NORTH, 
        trapImmunity: 0, 
        status: "idle" 
    };
    const state = gameReducer(initialState, { type: SET_CURRENT_PLAYER, payload: { player } });
    expect(state.currentPlayer).toEqual(player);
});

it("should handle SET_ACTIVE_GAMES", () => {
    const games = ["game1", "game2"];
    const state = gameReducer(initialState, { type: SET_ACTIVE_GAMES, payload: { activeGames: games } });
    expect(state.activeGames).toEqual(games);
});

it("should handle SET_WAITING_PLAYERS", () => {
    const player: Player = { id: "p1", username: "test", score: 0 };
    const waitingPlayers = new Map<string, Player>([["p1", player]]);
    const state = gameReducer(initialState, { type: SET_WAITING_PLAYERS, payload: { waitingPlayers } });
    expect(state.waitingPlayers).toEqual(waitingPlayers);
});
});