import {
    EMPTY_CELL,
    GRID_SIZE,
    HIDDEN_CELL,
} from "../../../server/game/constants";
import {
    GridActions,
    INITIALIZE_GRID,
    InitializeGridPayload,
} from "./gridActions";

export interface GridState {
    grid            : string[][];
    hiddenGrid      : string[][];
}

export const initialState: GridState = {
    grid        : Array.from({length: GRID_SIZE}, () => Array(GRID_SIZE).fill(EMPTY_CELL)),
    hiddenGrid  : Array.from({length: GRID_SIZE}, () => Array(GRID_SIZE).fill(HIDDEN_CELL)),
};

export const gridReducer = (state: GridState = initialState, action: GridActions): GridState => {
    switch(action.type) {
        case INITIALIZE_GRID: {
            const {grid, hiddenGrid} = action.payload as InitializeGridPayload;
            if (
                !Array.isArray(grid)        || grid.length          === 0 ||
                !Array.isArray(hiddenGrid)  || hiddenGrid.length    === 0
            ) {
                return initialState;
            }
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