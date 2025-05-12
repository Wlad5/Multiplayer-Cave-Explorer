import { Player } from './../../../src/reducers/playerReducer';
import { PlayerDirection } from '../../../../server/game/constants';
import { addPlayerAC, MovePlayer, removePlayerAC, turnPlayerAC, updateScoreAC, updateTrapImmunity } from '../../../src/reducers/playerActions';
import { playerReducer } from '../../../src/reducers/playerReducer';

describe('playerReducer', () => {
    beforeEach(                                                         () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    })
    test('should add the player to the state',                          () => {
        const prevState: Map<string, Player>    = new Map<string, Player>();
        const player    : Player                = {
            id          : '1',    
            x           : 0,
            y           : 0,
            direction   : PlayerDirection.NORTH,
            status      : "idle",
            score       : 0,
            trapImmunity: 0,
            username    : 'Player1'
        };
        const action    = addPlayerAC(player);
        const newState  = playerReducer(prevState, action);
        expect(newState)            .not.toEqual(prevState);
        expect(newState.size)       .toBe(1);
        expect(newState.get('1'))   .toEqual(player);
    });
    test('should not add the player if id is missing',                  () => {
        const prevState: Map<string, Player> = new Map<string, Player>();
        // @ts-expect-error missing id
        const player    : Player                = {
            x           : 0,
            y           : 0,
            direction   : PlayerDirection.NORTH,
            status      : "idle",
            score       : 0,
            trapImmunity: 0,
            username    : 'Player1'
        };
        const action = addPlayerAC(player);
        const newState = playerReducer(prevState, action);
        expect(newState)            .toEqual(prevState);
        expect(newState.size)       .toBe(0);
    })
    test('should remove player by id',                                  () => {
        let prevState: Map<string, Player> = new Map<string, Player>();
        const player1  : Player                 = {
            id          : '1',    
            x           : 0,
            y           : 0,
            direction   : PlayerDirection.NORTH,
            status      : "idle",
            score       : 0,
            trapImmunity: 0,
            username    : 'Player1'
        };
        prevState       = playerReducer(prevState, addPlayerAC(player1));
        const action    = removePlayerAC(player1.id);
        const newState  = playerReducer(prevState, action);
        expect(newState.size)   .toBe(0);
        expect(newState)        .toEqual(prevState);
    })
    test('should not remove player with non-existing id',               () => {
        const prevState: Map<string, Player>    = new Map<string, Player>();
        // @ts-expect-error missing id
        const player1  : Player                 = {
            x           : 0,
            y           : 0,
            direction   : PlayerDirection.NORTH,
            status      : "idle",
            score       : 0,
            trapImmunity: 0,
            username    : 'Player1'
        };
        addPlayerAC(player1);
        const action    = removePlayerAC(player1.id);
        const newState  = playerReducer(prevState, action);
        expect(newState)        .toEqual(prevState);
        expect(newState.size)   .toBe(0);
    })
    test('should update the player\'s direction to NORTH',              () => {
        let prevState: Map<string, Player>  = new Map<string, Player>();
        const player1: Player               = {
            id          : '1',    
            x           : 0,
            y           : 0,
            direction   : PlayerDirection.NORTH,
            status      : "idle",
            score       : 0,
            trapImmunity: 0,
            username    : 'Player1'
        };
        prevState           = playerReducer(prevState, addPlayerAC(player1));
        const action        = turnPlayerAC(player1.id, PlayerDirection.NORTH);
        const newState      = playerReducer(prevState, action);
        expect(newState.size)                       .toBe(1);
        expect(newState.get(player1.id)?.direction) .toBe(PlayerDirection.NORTH);
    })
    test('should update the player\'s direction to WEST',               () => {
        let prevState: Map<string, Player>  = new Map<string, Player>();
        const player1: Player               = {
            id          : '1',    
            x           : 0,
            y           : 0,
            direction   : PlayerDirection.NORTH,
            status      : "idle",
            score       : 0,
            trapImmunity: 0,
            username    : 'Player1'
        };
        prevState       = playerReducer(prevState, addPlayerAC(player1));
        const action    = turnPlayerAC(player1.id, PlayerDirection.WEST);
        const newState  = playerReducer(prevState, action);
        expect(newState.size)                       .toBe(1);
        expect(newState.get(player1.id)?.direction) .toBe(PlayerDirection.WEST);
    })
    test('should update the player\'s direction to EAST',               () => {
        let prevState: Map<string, Player>  = new Map<string, Player>();
        const player1: Player               = {
            id          : '1',    
            x           : 0,
            y           : 0,
            direction   : PlayerDirection.NORTH,
            status      : "idle",
            score       : 0,
            trapImmunity: 0,
            username    : 'Player1'
        };
        prevState       = playerReducer(prevState, addPlayerAC(player1));
        const action    = turnPlayerAC(player1.id, PlayerDirection.EAST);
        const newState  = playerReducer(prevState, action);
        expect(newState.size)                       .toBe(1);
        expect(newState.get(player1.id)?.direction) .toBe(PlayerDirection.EAST);
    })
    test('should update the player\'s direction to SOUTH',              () => {
        let prevState: Map<string, Player> = new Map<string, Player>();
        const player1  : Player            = {
            id          : '1',    
            x           : 0,
            y           : 0,
            direction   : PlayerDirection.NORTH,
            status      : "idle",
            score       : 0,
            trapImmunity: 0,
            username    : 'Player1'
        };
        prevState       = playerReducer(prevState, addPlayerAC(player1));
        const action    = turnPlayerAC(player1.id, PlayerDirection.SOUTH);
        const newState  = playerReducer(prevState, action);
        expect(newState.size)                       .toBe(1);
        expect(newState.get(player1.id)?.direction) .toBe(PlayerDirection.SOUTH);
    })
    test('should not change direction if player does not exist',        () => {
        const prevState: Map<string, Player>    = new Map<string, Player>();
        const action                            = turnPlayerAC('non-existing-id', PlayerDirection.SOUTH);
        const newState                          = playerReducer(prevState, action);
        expect(newState).toEqual(prevState);
    })
    test('should update the player\'s score',                           () => {
    let prevState: Map<string, Player> = new Map<string, Player>();
    const player1: Player = {
        id: '1',
        x: 0,
        y: 0,
        direction: PlayerDirection.NORTH,
        status: "idle",
        score: 0,
        trapImmunity: 0,
        username: 'Player1'
    };
    prevState = playerReducer(prevState, addPlayerAC(player1));
    const action = updateScoreAC(player1.id, 42);
    const newState = playerReducer(prevState, action);
    expect(newState.get(player1.id)?.score).toBe(42);
    });
    test('should update the player\'s trap immunity',                   () => {
    let prevState: Map<string, Player> = new Map<string, Player>();
    const player1: Player = {
        id: '1',
        x: 0,
        y: 0,
        direction: PlayerDirection.NORTH,
        status: "idle",
        score: 0,
        trapImmunity: 0,
        username: 'Player1'
    };
    prevState = playerReducer(prevState, addPlayerAC(player1));
    const action = updateTrapImmunity(player1.id, 3);
    const newState = playerReducer(prevState, action);
    expect(newState.get(player1.id)?.trapImmunity).toBe(3);
    });
    test('should not update score if player does not exist',            () => {
    const prevState: Map<string, Player> = new Map<string, Player>();
    const action = updateScoreAC('non-existing-id', 99);
    const newState = playerReducer(prevState, action);
    expect(newState).toEqual(prevState);
    });
    test('should not update trap immunity if player does not exist',    () => {
    const prevState: Map<string, Player> = new Map<string, Player>();
    const action = updateTrapImmunity('non-existing-id', 5);
    const newState = playerReducer(prevState, action);
    expect(newState).toEqual(prevState);
    });
    test('should handle MOVE_PLAYER action for valid move',             () => {
    let prevState: Map<string, Player> = new Map<string, Player>();
    const player1: Player = {
        id: '1',
        x: 0,
        y: 0,
        direction: PlayerDirection.EAST,
        status: "idle",
        score: 0,
        trapImmunity: 0,
        username: 'Player1'
    };
    prevState = playerReducer(prevState, addPlayerAC(player1));
    const grid = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
    ];
    const action = {
        type: "MOVE_PLAYER",
        payload: {
            id: player1.id,
            grid: grid
        }
    };
    const newState = playerReducer(prevState, action as MovePlayer);
    expect(newState.get(player1.id)?.status).toBeDefined();
    });
    afterEach(() => {
        jest.restoreAllMocks();
    })
})