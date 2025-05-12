import { initialState } from './../../../src/reducers/gridReducer';
import { gridReducer, GridState } from "../../../src/reducers/gridReducer";
import { INITIALIZE_GRID } from "../../../src/reducers/gridActions";
import { EMPTY_CELL, HIDDEN_CELL } from "../../../../server/game/constants";

describe("gridReducer", () => {
    test("should handle INITIALIZE_GRID",                                                         () => {
        const testGrid = [
            [EMPTY_CELL, EMPTY_CELL],
            [EMPTY_CELL, EMPTY_CELL]
        ];
        const testHiddenGrid = [
            [HIDDEN_CELL, HIDDEN_CELL],
            [HIDDEN_CELL, HIDDEN_CELL]
        ];
        const action = {
            type: INITIALIZE_GRID,
            payload: {
                gridSize    : 2,
                grid        : testGrid,
                hiddenGrid  : testHiddenGrid
            }
        };
        const prevState: GridState = {
            grid        :   [],
            hiddenGrid  :   [],
        };
        const nextState = gridReducer(prevState, action);
        expect(nextState.grid)      .toEqual(testGrid);
        expect(nextState.hiddenGrid).toEqual(testHiddenGrid);
    });
    test('should return the initial state when action type is unknown',                           () => {
        const initialState: GridState = {
            grid        : [],
            hiddenGrid  : [],
        }
        const unknownAction = {type: 'UNKNOWN_ACTION', payload: {
            gridSize: 2,
            grid: [
                [EMPTY_CELL, EMPTY_CELL],
                [EMPTY_CELL, EMPTY_CELL]
            ],
            hiddenGrid: [
                [HIDDEN_CELL, HIDDEN_CELL],
                [HIDDEN_CELL, HIDDEN_CELL]
            ]
        }};
        const newState = gridReducer(initialState, unknownAction);
        expect(newState)            .toEqual(initialState);
        expect(newState.grid)       .toEqual([]);
        expect(newState.hiddenGrid) .toEqual([]);
    })
    test('should return the initial state when state is unefined and the action type is unkown',  () => {
        const unknownAction = {type: 'UNKNOWN_ACTION', payload: {
            gridSize: 2,
            grid: [
                [EMPTY_CELL, EMPTY_CELL],
                [EMPTY_CELL, EMPTY_CELL]
            ], 
            hiddenGrid: [
                [HIDDEN_CELL, HIDDEN_CELL],
                [HIDDEN_CELL, HIDDEN_CELL]
            ]
        }};
        const newState = gridReducer(undefined, unknownAction);
        expect(newState)            .toEqual(initialState);
        expect(newState.grid)       .toEqual(initialState.grid);
        expect(newState.hiddenGrid) .toEqual(initialState.hiddenGrid);
    })
    test('should return the initial state when the payload is missing grid',                      () => {
        const action = {
            type: INITIALIZE_GRID,
            payload: {
                gridSize: 2,
                // grid is missing
                hiddenGrid: [
                    [HIDDEN_CELL, HIDDEN_CELL],
                    [HIDDEN_CELL, HIDDEN_CELL]
                ]
            }
        };
        const prevState: GridState = {
            grid        : [],
            hiddenGrid  : [],
        };
        // @ts-expect-error intentionally missing grid
        const newState = gridReducer(prevState, action);
        expect(newState)            .toEqual(initialState);
        expect(newState.grid)       .toEqual(initialState.grid);
        expect(newState.hiddenGrid) .toEqual(initialState.hiddenGrid);
    });
    test('should return the initial state when the payload is missing hiddenGrid',                () => {
        const action = {
            type: INITIALIZE_GRID,
            payload: {
                gridSize: 2,
                grid: [
                    [EMPTY_CELL, EMPTY_CELL],
                    [EMPTY_CELL, EMPTY_CELL]
                ],
                // hiddenGrid is missing
            }
        };
        const prevState: GridState = {
            grid        : [],
            hiddenGrid  : [],
        };
        // @ts-expect-error intentionally missing hiddenGrid
        const newState = gridReducer(prevState, action);
        expect(newState)            .toEqual(initialState);
        expect(newState.grid)       .toEqual(initialState.grid);
        expect(newState.hiddenGrid) .toEqual(initialState.hiddenGrid);
    });
    test('should return the initial state when both grid and hiddenGrid are empty arrays',        () => {
        const action = {
            type: INITIALIZE_GRID,
            payload: {
                gridSize: 2,
                grid: [],
                hiddenGrid: []
            }
        };
        const prevState: GridState = {
            grid        : [],
            hiddenGrid  : [],
        };
        const newState = gridReducer(prevState, action);
        expect(newState)            .toEqual(initialState);
        expect(newState.grid)       .toEqual(initialState.grid);
        expect(newState.hiddenGrid) .toEqual(initialState.hiddenGrid);
    });
});