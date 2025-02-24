import { GRID_SIZE, OBSTACLE, PlayerDirection, TRAP, TREASURE } from "../../../server/game/constants"
import { MOVE_PLAYER, MovePlayerPayload, PlayerActions, TURN_PLAYER, TurnPlayerPayload } from "./playerActions"

interface PlayerState {
    x: number;
    y: number;
    direction: PlayerDirection;
    score: number;
    status: 'idle' | 'moved' | 'hitTrap' | 'hitObstacle' | 'foundTreasure' | 'outOfBounds';
}

const initialState: PlayerState = {
    x: 0,
    y: 0,
    direction: PlayerDirection.NORTH,
    score: 0,
    status: 'idle'
}

export const playerReducer = (state = initialState, action: PlayerActions) => {
    switch(action.type) {
        case TURN_PLAYER: {
            const {left} = action.payload as TurnPlayerPayload;
            let newDirection = state.direction;
            switch (state.direction) {
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
                ...state,
                direction: newDirection
            };
        }
        case MOVE_PLAYER: {
            let newX = state.x;
            let newY = state.y;
            const { grid } = action.payload as MovePlayerPayload; 
            
            switch (state.direction) {
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
        
            // Check for out of bounds
            if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
                return {
                    ...state,
                    status: 'outOfBounds'
                };
            }
        
            // Check for obstacle
            if (grid[newX][newY] === OBSTACLE) {
                return {
                    ...state,
                    status: 'hitObstacle'
                };
            }
        
            const cellContent = grid[newX][newY];
            if (cellContent === TRAP) {
                return {
                    ...state,
                    x: newX,
                    y: newY,
                    status: 'hitTrap'
                };
            } else if (cellContent === TREASURE) {
                return {
                    ...state,
                    x: newX,
                    y: newY,
                    status: 'foundTreasure'
                };
            }
        
            return {
                ...state,
                x: newX,
                y: newY,
                status: 'moved'
            };
        }
        default: {
            return state;
        }
    }
}