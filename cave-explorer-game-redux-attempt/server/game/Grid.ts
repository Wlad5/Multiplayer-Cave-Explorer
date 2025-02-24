import { EMPTY_CELL, GRID_SIZE, HIDDEN_CELL, OBSTACLE, PlayerDirection, TRAP, TREASURE } from "./constants";

export class Grid {
    public grid: string[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(EMPTY_CELL));
    public hiddenGrid: string[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(HIDDEN_CELL));

    public placeRandomItems(item: string, count: number): void {
        let placed = 0;
        let attempts = 0;
        while (placed < count && attempts < 100) {
            const x = Math.floor(Math.random() * GRID_SIZE);
            const y = Math.floor(Math.random() * GRID_SIZE);
            if (this.grid[x][y] === EMPTY_CELL) {
                this.grid[x][y] = item;
                placed++;
            }
            attempts++;
        }
    }

    public revealCurrentCell(playerX: number, playerY: number, playerDirection: PlayerDirection): void {
        this.hiddenGrid[playerX][playerY] = playerDirection;
    }

    public revealLineOfSight(playerX: number, playerY: number, playerDirection: PlayerDirection): void {
        let nextX = playerX;
        let nextY = playerY;

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
                break;
            }

            if (this.grid[nextX][nextY] === OBSTACLE) {
                break;
            }

            this.hiddenGrid[nextX][nextY] = this.grid[nextX][nextY];
        }
    }
    public isObstacle(x: number, y: number): boolean {
        return this.grid[x][y] === OBSTACLE;
    }
    public isTrap(x: number, y: number): boolean {
        return this.grid[x][y] === TRAP;
    }
    public isTreasure(x: number, y: number): boolean {
        return this.grid[x][y] === TREASURE
    }
    public isOutOfBounds(x: number, y: number): boolean {
        return x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE;
    }
    public clearCell(x: number, y: number): void {
        this.grid[x][y] = EMPTY_CELL;
        this.hiddenGrid[x][y] = EMPTY_CELL;
    }
    public getHiddenGrid(): string[][] {
        return this.hiddenGrid;
    }
}