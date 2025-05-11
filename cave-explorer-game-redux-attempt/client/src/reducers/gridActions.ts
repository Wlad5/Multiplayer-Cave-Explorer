export const INITIALIZE_GRID        = 'INITIALIZE_GRID'

export interface InitializeGridPayload {
    gridSize    : number;
    grid        : string[][];
    hiddenGrid  : string[][];
}

export const initializeGridAC = (gridSize: number, initialGrid: string[][], initialHiddenGrid: string[][]) => ({
    type: INITIALIZE_GRID,
    payload: {
        gridSize,
        grid: initialGrid,
        hiddenGrid: initialHiddenGrid
    }
})

export type InitializeGrid      = ReturnType<typeof initializeGridAC>
export type GridActions         = 
    | InitializeGrid