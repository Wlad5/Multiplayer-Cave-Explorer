import { GRID_SIZE, OBSTACLE, PlayerDirection, TRAP, TREASURE } from "../../../server/game/constants"
import { ADD_PLAYER, AddPlayerPayload, MOVE_PLAYER, MovePlayerPayload, PlayerActions, REMOVE_PLAYER, RemovePlayerPayload, TURN_PLAYER, TurnPlayerPayload, UPDATE_SCORE, UPDATE_TRAP_IMMUNITY, UpdateScorePayload, UpdateTrapImmunityPayload } from "./playerActions"

export interface Player {
    id: string;
    x: number;
    y: number;
    direction: PlayerDirection;
    score: number;
    username: string;
    status: 'idle' | 'moved' | 'hitTrap' | 'hitObstacle' | 'foundTreasure' | 'outOfBounds';
    trapImmunity: number;
}

const initialState: Map<string, Player> = new Map();

export const playerReducer = (state: Map<string, Player> = initialState, action: PlayerActions): Map<string, Player> => {
    switch(action.type) {
        case ADD_PLAYER: {
            if ('payload' in action) {
                const {player} = action.payload as AddPlayerPayload;
                if (player.id) {
                    const newState = new Map(state);
                    newState.set(player.id, player);
                    return newState;
                } else {
                    console.error(`Player ID is missing`)
                }
            }
            return state;
        }
        case REMOVE_PLAYER: {
            if ('payload' in action) {
                const {id} = action.payload as RemovePlayerPayload;
                if (id) {
                    state.delete(id);
                }
            }
            return new Map(state);
        }
        case TURN_PLAYER: {
            const { id, move } = action.payload as TurnPlayerPayload;
            const player = state.get(id);
                if (player) {
                    let newDirection = player.direction;
                    switch (move) {
                        case PlayerDirection.NORTH:
                            newDirection = PlayerDirection.NORTH;
                            break;
                        case PlayerDirection.EAST:
                            newDirection = PlayerDirection.EAST;
                            break;
                        case PlayerDirection.SOUTH:
                            newDirection = PlayerDirection.SOUTH;
                            break;
                        case PlayerDirection.WEST:
                            newDirection = PlayerDirection.WEST;
                            break;
                    }
                    state.set(id, {
                        ...player,
                        direction: newDirection,
                        status: 'idle' as const,
                    })
                }
            return new Map(state);
        }
        case MOVE_PLAYER: {
            const { id, grid } = action.payload as MovePlayerPayload;
            const player = state.get(id);
        
            if (player) {
                let newX = player.x;
                let newY = player.y;
        
                switch (player.direction) {
                    case PlayerDirection.NORTH:
                        newX--;
                        break;
                    case PlayerDirection.EAST:
                        newY++;
                        break;
                    case PlayerDirection.SOUTH:
                        newX++;
                        break;
                    case PlayerDirection.WEST:
                        newY--;
                        break;
                }
        
                if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
                    state.set(id, {
                        ...player,
                        status: 'outOfBounds',
                    });
                    return new Map(state);
                }
        
                const cellContent = grid[newX][newY];
        
                if (cellContent === OBSTACLE) {
                    state.set(id, {
                        ...player,
                        status: 'hitObstacle',
                    });
                    return new Map(state);
                }
        
                const otherPlayer = Array.from(state.values()).some(
                    (pl) => pl.x === newX && pl.y === newY && pl.id !== player.id
                );
                if (otherPlayer) {
                    state.set(id, {
                        ...player,
                        status: 'idle',
                    });
                    return new Map(state);
                }
        
                if (cellContent === TRAP) {
                    state.set(id, {
                        ...player,
                        x: newX,
                        y: newY,
                        status: 'hitTrap',
                    });
                    return new Map(state);
                } else if (cellContent === TREASURE) {
                    state.set(id, {
                        ...player,
                        x: newX,
                        y: newY,
                        status: 'foundTreasure',
                    });
                    return new Map(state);
                }
        
                state.set(id, {
                    ...player,
                    x: newX,
                    y: newY,
                    status: 'moved',
                });
            }
        
            return new Map(state);
        }
        case UPDATE_SCORE: {
            const {id, score} = action.payload as UpdateScorePayload;
            const player = state.get(id);
                if (player) {
                    state.set(id, {
                        ...player,
                        score: score
                    })
                }
            return new Map(state);
        }
        case UPDATE_TRAP_IMMUNITY: {
            if ('payload' in action) {
                const {id, trapImmunity} = action.payload as UpdateTrapImmunityPayload;
                const player = state.get(id);
                if (player) {
                    state.set(id, {
                        ...player,
                        trapImmunity: trapImmunity
                    })
                }
            }
            return new Map(state);
        }
        default: {
            return state;
        }
    }
}