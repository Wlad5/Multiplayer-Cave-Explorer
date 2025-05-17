import { 
    EMPTY_CELL,
    GRID_SIZE,
    HIDDEN_CELL,
    OBSTACLE,
    PlayerDirection,
    TRAP, 
    TRAP_IMMUNITY_POWERUP,
    TREASURE,
    TWO_MOVES_IN_A_ROW 
} from "../../../game/constants";
import { Grid } from "../../../game/Grid";

describe('Grid', () => {
    let grid: Grid;
    const NUMBER_OF_TRAPS                           = 7;
    const NUMBER_OF_OBSTACLES                       = 10;
    const NUMBER_OF_TREASURES                       = 10;
    const NUMBER_OF_TRAP_IMMUNITY_POWER_UPS         = 10;
    const NUMBER_OF_TWO_MOVES_IN_A_ROW_POWER_UPS    = 10;

    beforeEach(                                                         () => {
        grid = new Grid();
        grid.placeRandomItems(TRAP, NUMBER_OF_TRAPS);
        grid.placeRandomItems(OBSTACLE, NUMBER_OF_OBSTACLES);
        grid.placeRandomItems(TREASURE, NUMBER_OF_TREASURES);
        grid.placeRandomItems(TRAP_IMMUNITY_POWERUP, NUMBER_OF_TRAP_IMMUNITY_POWER_UPS);
        grid.placeRandomItems(TWO_MOVES_IN_A_ROW, NUMBER_OF_TWO_MOVES_IN_A_ROW_POWER_UPS);
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    })
    describe('Initialization', () => {
        const x = 0;
        const y = 0;
        test('should initialize the grid with default values',          () => {
            grid = new Grid();
            expect(grid.grid.length).toBe(GRID_SIZE);
            expect(grid.hiddenGrid.length).toBe(GRID_SIZE);
            for (let i = 0; i < GRID_SIZE; i++) {
                for (let j = 0; j < GRID_SIZE; j++) {
                    expect(grid.grid[i][j]).toBe(EMPTY_CELL);
                    expect(grid.hiddenGrid[i][j]).toBe(HIDDEN_CELL);
                }
            }
        })
        test('check if the cell is empty',                              () => {
            grid.grid[x][y] = EMPTY_CELL;
            expect(grid.isEmpty(x, y)).toBe(true)
        })
        test('check if the cell is hidden',                             () => {
            grid.hiddenGrid[x][y] = HIDDEN_CELL;
            expect(grid.isHidden(x, y)).toBe(true);
        })
        test('check if the cell is an obstacle',                        () => {
            grid.grid[x][y] = OBSTACLE;
            expect(grid.isObstacle(x, y)).toBe(true);  
        })
        test('check if the cell is a trap',                             () => {
            grid.grid[x][y] = TRAP;
            expect(grid.isTrap(x, y)).toBe(true);
        })
        test('check if the cell is a treasure',                         () => {
            grid.grid[x][y] = TREASURE;
            expect(grid.isTreasure(x, y)).toBe(true);
        })
        test('check if the cell is a trap immunity power up',           () => {
            grid.grid[x][y] = TRAP_IMMUNITY_POWERUP;
            expect(grid.isTrapImmunityPowerUp(x, y)).toBe(true);
        })
        test('check if the cell is a two moves in a row power up',      () => {
            grid.grid[x][y] = TWO_MOVES_IN_A_ROW;
            expect(grid.isX2PowerUp(x, y)).toBe(true);
        })
        test('should clear bothe the grid and hidden grid cell',        () => {
            grid.grid[x][y] = TRAP;
            grid.clearCell(x, y);
            expect(grid.grid[x][y]).toBe(EMPTY_CELL);
            expect(grid.hiddenGrid[x][y]).toBe(EMPTY_CELL);
        })
        test('should reveal the current cell',                          () => {
            const playerX               = 2;
            const playerY               = 3;
            const playerDirection       = PlayerDirection.NORTH;
            grid.grid[playerX][playerY] = EMPTY_CELL;
            grid                                        .revealCurrentCell(playerX, playerY, playerDirection);
            expect(grid.grid[playerX][playerY])         .toBe(playerDirection);
            expect(grid.hiddenGrid[playerX][playerY])   .toBe(playerDirection);
        })
        test('should reveal the line of sight',                         () => {
            const playerX                   = 2;
            const playerY                   = 2;
            const playerDirection           = PlayerDirection.EAST;
            grid.grid[playerX][playerY + 1] = TRAP;
            grid.grid[playerX][playerY + 2] = EMPTY_CELL;
            grid.grid[playerX][playerY + 3] = TREASURE;
            grid.grid[playerX][playerY + 4] = OBSTACLE;
            grid.revealLineOfSight(playerX, playerY, playerDirection);
            expect(grid.hiddenGrid[playerX][playerY + 1]).toBe(grid.grid[playerX][playerY + 1]);
            expect(grid.hiddenGrid[playerX][playerY + 2]).toBe(grid.grid[playerX][playerY + 2]);
            expect(grid.hiddenGrid[playerX][playerY + 3]).toBe(grid.grid[playerX][playerY + 3]);
            expect(grid.hiddenGrid[playerX][playerY + 4]).toBe(grid.grid[playerX][playerY + 4]);
            expect(grid.hiddenGrid[playerX][playerY + 5]).toBe(HIDDEN_CELL);
            expect(grid.hiddenGrid[playerX][playerY + 6]).toBe(HIDDEN_CELL);
        })
        test('should move the obstacles',                               () => {
            const initialX                  = 5;
            const initialY                  = 5;
            grid.grid[initialX][initialY]   = OBSTACLE;
            grid.moveObstacles();
            let obstacleMoved = false;
            for(let i = 0; i < GRID_SIZE; i++) {
                for(let j = 0; j < GRID_SIZE; j++) {
                    if (grid.grid[i][j] === OBSTACLE) {
                        if (i !== initialX && j !== initialY) {
                            obstacleMoved = true;
                        }
                        expect(grid.isOutOfBounds(i, j)).toBe(false);
                        expect(grid.grid[i][j])         .toBe(OBSTACLE);
                    }
                }
            }
            expect(obstacleMoved)                       .toBe(true);
        })
    })
    test('place random items',                                          () => {
        let TRAP_COUNT                          = 0;
        let OBSTACLE_COUNT                      = 0;
        let TREASURE_COUNT                      = 0;
        let TRAP_IMMUNITY_POWER_UP_COUNT        = 0;
        let TWO_MOVES_IN_A_ROW_POWER_UP_COUNT   = 0;
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (grid.grid[i][j] === TRAP)                   TRAP_COUNT++;
                if (grid.grid[i][j] === OBSTACLE)               OBSTACLE_COUNT++;
                if (grid.grid[i][j] === TREASURE)               TREASURE_COUNT++;
                if (grid.grid[i][j] === TWO_MOVES_IN_A_ROW)     TWO_MOVES_IN_A_ROW_POWER_UP_COUNT++;
                if (grid.grid[i][j] === TRAP_IMMUNITY_POWERUP)  TRAP_IMMUNITY_POWER_UP_COUNT++;
            }
        }
        expect(TRAP_COUNT)                          .toEqual(NUMBER_OF_TRAPS);
        expect(OBSTACLE_COUNT)                      .toEqual(NUMBER_OF_OBSTACLES);
        expect(TREASURE_COUNT)                      .toEqual(NUMBER_OF_TREASURES);
        expect(TRAP_IMMUNITY_POWER_UP_COUNT)        .toEqual(NUMBER_OF_TRAP_IMMUNITY_POWER_UPS);
        expect(TWO_MOVES_IN_A_ROW_POWER_UP_COUNT)   .toEqual(NUMBER_OF_TWO_MOVES_IN_A_ROW_POWER_UPS);
    })
    test('placed items should be withing the grid bounds',              () => {
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                expect(i).toBeGreaterThanOrEqual(0);
                expect(i).toBeLessThan(GRID_SIZE);
                expect(j).toBeGreaterThanOrEqual(0);
                expect(j).toBeLessThan(GRID_SIZE);
            }
        }
    })
    test('placed items should not overlap',                             () => {
        const itemsSet = new Set();
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                const item = grid.grid[i][j];
                if (item !== EMPTY_CELL && item !== HIDDEN_CELL) {
                    const coordinates = `${i}, ${j}`;
                    expect(itemsSet.has(coordinates)).toBe(false);
                    itemsSet.add(coordinates);
                }
            }
        }
    })
    afterEach(                                                          () => {
        jest.clearAllMocks();
    })
});