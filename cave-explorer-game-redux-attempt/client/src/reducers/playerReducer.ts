import { GRID_SIZE, OBSTACLE, PlayerDirection, TRAP, TREASURE } from "../../../server/game/constants"
import { MOVE_PLAYER, MovePlayerPayload, PlayerActions, TURN_PLAYER, TurnPlayerPayload, UPDATE_SCORE, UpdateScorePayload } from "./playerActions"

export interface PlayerState {
    playerId: number;
    x: number;
    y: number;
    direction: PlayerDirection;
    score: number;
    status: 'idle' | 'moved' | 'hitTrap' | 'hitObstacle' | 'foundTreasure' | 'outOfBounds';
}

const initialState: PlayerState[] = [
    {
        playerId: 0,
        x: 0,
        y: 0,
        direction: PlayerDirection.NORTH,
        score: 0,
        status: 'idle'
    },
    {
        playerId: 1,
        x: 5,
        y: 5,
        direction: PlayerDirection.SOUTH,
        score: 0,
        status: 'idle'
    },
    {
        playerId: 2,
        x: 7,
        y: 7,
        direction: PlayerDirection.SOUTH,
        score: 0,
        status: 'idle'
    },
]

export const playerReducer = (state: PlayerState[] = initialState, action: PlayerActions): PlayerState[] => {
    switch(action.type) {
        case TURN_PLAYER: {
            const { id, left } = action.payload as TurnPlayerPayload;
            return state.map(player => {
                if (player.playerId === id) {
                    let newDirection = player.direction;
                    switch (player.direction) {
                        case PlayerDirection.NORTH:
                            newDirection = left ? PlayerDirection.WEST : PlayerDirection.EAST;
                            break;
                        case PlayerDirection.EAST:
                            newDirection = left ? PlayerDirection.NORTH : PlayerDirection.SOUTH;
                            break;
                        case PlayerDirection.SOUTH:
                            newDirection = left ? PlayerDirection.EAST : PlayerDirection.WEST;
                            break;
                        case PlayerDirection.WEST:
                            newDirection = left ? PlayerDirection.SOUTH : PlayerDirection.NORTH;
                            break;
                    }
                    return {
                        ...player,
                        direction: newDirection,
                        status: 'idle' as const
                    };
                }
                return player;
            });
        }
            
        case MOVE_PLAYER: {
            const {id, grid} = action.payload as MovePlayerPayload;
            return state.map(player => {
                if (player.playerId === id) {
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
                        return {
                            ...player,
                            status: 'outOfBounds' as const,
                            x: player.x,
                            y: player.y,
                        };
                    }
                    const cellContent = grid[newX][newY];
                    if (cellContent === OBSTACLE) {
                        return {
                            ...player,
                            status: 'hitObstacle' as const,
                            x: player.x,
                            y: player.y,
                        };
                    }
                    const otherPlayer = state.some(pl => pl.x === newX && pl.y === newY && pl.playerId !== player.playerId);
                    if (otherPlayer) {
                        return {
                            ...player,
                            x: player.x,
                            y: player.y
                        }
                    }
                    if (cellContent === TRAP) {
                        return {
                            ...player,
                            x: newX,
                            y: newY,
                            status: 'hitTrap' as const,
                        };
                    } else if (cellContent === TREASURE) {
                        return {
                            ...player,
                            x: newX,
                            y: newY,
                            status: 'foundTreasure' as const,
                        };
                    }
                    return {
                        ...player,
                        x: newX,
                        y: newY,
                        status: 'moved' as const
                    };
                }
                return player;
            })
        }
        case UPDATE_SCORE: {
            const {playerId, score} = action.payload as UpdateScorePayload;
            return state.map(player => {
                if (player.playerId === playerId) {
                    return {
                        ...player,
                        score: player.score + score
                    }
                }
                return player;
            })
        }
        default: {
            return state;
        }
    }
}