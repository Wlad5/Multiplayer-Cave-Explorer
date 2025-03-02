import {
    EMPTY_CELL,
    GRID_SIZE,
    HIDDEN_CELL,
    OBSTACLE,
    PlayerDirection,
    TRAP,
    TREASURE
} from "../../../server/game/constants";
import {
    CLEAR_CELL,
    ClearCellPayload,
    GridActions,
    INITIALIZE_GRID,
    InitializeGridPayload,
    PLACE_RANDOM_ITEMS,
    PlaceRandomItemsPayload,
    REVEAL_CURRENT_CELL,
    REVEAL_LINE_OF_SIGHT,
    RevealCurrentCellPayload,
    RevealLineOfSightPayload
} from "./gridActions";

interface GridState {
    grid: string[][];
    hiddenGrid: string[][];
    obstacles: {x: number; y: number}[];
    traps: {x: number; y: number}[];
    treasures: {x: number; y: number}[];
}

const initialState: GridState = {
    grid: Array.from({length: GRID_SIZE}, () => Array(GRID_SIZE).fill(EMPTY_CELL)),
    hiddenGrid: Array.from({length: GRID_SIZE}, () => Array(GRID_SIZE).fill(HIDDEN_CELL)),
    obstacles: [],
    traps: [],
    treasures: [],
};

export const gridReducer = (state = initialState, action: GridActions) => {
    switch(action.type) {
        case INITIALIZE_GRID: {
            const {grid, hiddenGrid} = action.payload as InitializeGridPayload;
            return {
                ...state,
                grid: grid,
                hiddenGrid: hiddenGrid
            };
        }
        case PLACE_RANDOM_ITEMS: {
            const {item, count} = action.payload as PlaceRandomItemsPayload;
            let placed = 0;
            let attempts = 0;
            const newGrid = state.grid.map(row => [...row]);
            const newTraps = [...state.traps];
            const newTreasures = [...state.treasures];
            const newObstacles = [...state.obstacles];
            while (placed < count && attempts < 100) {
                const x = Math.floor(Math.random() * GRID_SIZE);
                const y = Math.floor(Math.random() * GRID_SIZE);
                if (newGrid[x][y] === EMPTY_CELL) {
                    newGrid[x][y] = item;
                    if (item === TRAP) newTraps.push({x, y});
                    if (item === TREASURE) newTreasures.push({x, y});
                    if (item === OBSTACLE) newObstacles.push({x, y});
                    placed++;
                }
                attempts++
            }
            return {
                ...state,
                grid: newGrid,
                traps: newTraps,
                treasures: newTreasures,
                obstacles: newObstacles
            }
        }
        case REVEAL_CURRENT_CELL: {
            const {playerX, playerY, playerDirection} = action.payload as RevealCurrentCellPayload;
            const newGrid = state.grid.map(row => [...row]);
            const newHiddenGrid = state.hiddenGrid.map(row => [...row]);
            newGrid[playerX][playerY] = playerDirection;
            newHiddenGrid[playerX][playerY] = playerDirection;
            return {
                ...state,
                grid: newGrid,
                hiddenGrid: newHiddenGrid
            }
        }
        case REVEAL_LINE_OF_SIGHT: {
            const {playerX, playerY, playerDirection} = action.payload as RevealLineOfSightPayload;
            let nextX = playerX;
            let nextY = playerY;
            const newGrid = [...state.grid.map(row => [...row])];
            const newHiddenGrid = [...state.hiddenGrid.map(row => [...row])];
            while (true) {
                switch (playerDirection) {
                    case PlayerDirection.NORTH:
                        nextX--;
                        break;
                    case PlayerDirection.EAST:
                        nextY++;
                        break;
                    case PlayerDirection.SOUTH:
                        nextX++;
                        break;
                    case PlayerDirection.WEST:
                        nextY--;
                        break;
                }
                if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
                    break
                }
                newHiddenGrid[nextX][nextY] = state.grid[nextX][nextY];
                if (state.grid[nextX][nextY] === OBSTACLE) {
                    break
                }
                
            }
            newGrid[playerX][playerY] = playerDirection;
            newHiddenGrid[playerX][playerY] = playerDirection;
            return {
                ...state,
                grid: newGrid,
                hiddenGrid: newHiddenGrid
            }
        }
        case CLEAR_CELL: {
            const {cellPositionX, cellPositionY} = action.payload as ClearCellPayload;
            const newGrid = [...state.grid.map(row => [...row])];
            const newHiddenGrid = [...state.hiddenGrid.map(row => [...row])];
            const newTraps = state.traps.filter(trap => trap.x !== cellPositionX && trap.y !== cellPositionY);
            const newTreasures = state.treasures.filter(treasure => treasure.x !== cellPositionX && treasure.y !== cellPositionY);
            newGrid[cellPositionX][cellPositionY] = EMPTY_CELL;
            newHiddenGrid[cellPositionX][cellPositionY] = EMPTY_CELL;
            return {
                ...state,
                grid: newGrid,
                hiddenGrid: newHiddenGrid,
                traps: newTraps,
                treasures: newTreasures
            }
        }
        default: {
            return state
        }
    }
}