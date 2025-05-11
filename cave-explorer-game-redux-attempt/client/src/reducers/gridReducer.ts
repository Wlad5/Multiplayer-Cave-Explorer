import {
    EMPTY_CELL,
    GRID_SIZE,
    HIDDEN_CELL,
    PlayerDirection,
} from "../../../server/game/constants";
import {
    GridActions,
    INITIALIZE_GRID,
    InitializeGridPayload,
} from "./gridActions";

export interface GridState {
    grid            : string[][];
    hiddenGrid      : string[][];
    players         : {playerId: number; x: number; y: number; direction: PlayerDirection}[];
    traps           : {x: number; y: number}[];
    obstacles       : {x: number; y: number}[];
    treasures       : {x: number; y: number}[];
}

const initialState: GridState = {
    grid        : Array.from({length: GRID_SIZE}, () => Array(GRID_SIZE).fill(EMPTY_CELL)),
    hiddenGrid  : Array.from({length: GRID_SIZE}, () => Array(GRID_SIZE).fill(HIDDEN_CELL)),
    players     : [],
    traps       : [],
    obstacles   : [],
    treasures   : [],
};

export const gridReducer = (state: GridState = initialState, action: GridActions): GridState => {
    switch(action.type) {
        case INITIALIZE_GRID: {
            const {grid, hiddenGrid} = action.payload as InitializeGridPayload;
            return {
                ...state,
                grid: grid,
                hiddenGrid: hiddenGrid
            };
        }
        default: {
            return state
        }
    }
}