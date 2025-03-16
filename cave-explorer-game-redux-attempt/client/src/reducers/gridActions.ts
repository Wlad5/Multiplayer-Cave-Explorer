export const INITIALIZE_GRID        = 'INITIALIZE_GRID'
export const PLACE_RANDOM_ITEMS     = 'PLACE_RANDOM_ITEMS'
export const REVEAL_CURRENT_CELL    = 'REVEAL_CURRENT_CELL'
export const REVEAL_LINE_OF_SIGHT   = 'REVEAL_LINE_OF_SIGHT'
export const CLEAR_CELL             = 'CLEAR_CELL'
export const CHECK_CELL_STATUS      = 'CHECK_CELL_STATUS'

export interface InitializeGridPayload {
    gridSize: number;
    grid: string[][];
    hiddenGrid: string[][];
}
export interface PlaceRandomItemsPayload {
    item: string;
    count: number;
}
export interface RevealCurrentCellPayload {
    player: {
        playerId: number;
        x: number;
        y: number;
        direction: string;
    }

}
export interface RevealLineOfSightPayload {
    player: {
        playerId: number;
        x: number;
        y: number;
        direction: string;
    }
}
export interface ClearCellPayload {
    playerId: number;
    cellPositionX: number;
    cellPositionY: number;
}

export const initializeGridAC = (gridSize: number, initialGrid: string[][], initialHiddenGrid: string[][]) => ({
    type: INITIALIZE_GRID,
    payload: {
        gridSize,
        grid: initialGrid,
        hiddenGrid: initialHiddenGrid
    }
})
export const placeRandomItemsAC = (item: string, count: number) => ({
    type: PLACE_RANDOM_ITEMS,
    payload: {
        item,
        count
    }
})
export const revealCurrentCellAC = (player: {playerId: number, x: number, y: number, direction: string}) => ({
    type: REVEAL_CURRENT_CELL,
    payload: {
        player
    }
})
export const revealLineOfSightAC = (player: {playerId: number, x: number, y: number, direction: string}) => ({
    type: REVEAL_LINE_OF_SIGHT,
    payload: {
        player
    }
})
export const clearCellAC = (playerId: number, cellPositionX: number, cellPositionY: number) => ({
    type: CLEAR_CELL,
    payload: {
        playerId,
        cellPositionX,
        cellPositionY
    }
})

export type InitializeGrid      = ReturnType<typeof initializeGridAC>
export type PlaceRandomItems    = ReturnType<typeof placeRandomItemsAC>
export type RevealCurrentCell   = ReturnType<typeof revealCurrentCellAC>
export type RevealLineOfSight   = ReturnType<typeof revealLineOfSightAC>
export type ClearCell           = ReturnType<typeof clearCellAC>

export type GridActions = 
    | InitializeGrid
    | PlaceRandomItems
    | RevealCurrentCell
    | RevealLineOfSight
    | ClearCell
