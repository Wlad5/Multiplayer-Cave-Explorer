import { GRID_SIZE, EMPTY_CELL, HIDDEN_CELL, OBSTACLE, TRAP, TREASURE, PlayerDirection } from "./constants";

export class Grid {
    private grid        : string[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(EMPTY_CELL));
    private hiddenGrid  : string[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(HIDDEN_CELL));

    public placeRandomItems(item: string, count: number): void {
        let placed      = 0;
        let attempts    = 0;
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

    public printGrid(): void {
        for (let i = 0; i < GRID_SIZE; i++) {
            console.log(this.hiddenGrid[i].join(' '));
        }
    }

    public revealCell(x: number, y: number, playerDirection?: PlayerDirection): void {
        if (!this.isOutOfBounds(x, y)) {
            this.hiddenGrid[x][y] = this.grid[x][y];
            if (playerDirection) {
                this.hiddenGrid[x][y] = playerDirection;
            }
        }
    }

    public revealLineOfSight(playerX: number, playerY: number, playerDirection: PlayerDirection): void {
        let nextX = playerX;
        let nextY = playerY;
    
        while (true) {
            switch (playerDirection) {
                case PlayerDirection.NORTH  : nextX--; break;
                case PlayerDirection.EAST   : nextY++; break;
                case PlayerDirection.SOUTH  : nextX++; break;
                case PlayerDirection.WEST   : nextY--; break;
            }
    
            if (this.isOutOfBounds(nextX, nextY)) {
                break;
            }
    
            this.hiddenGrid[nextX][nextY] = this.grid[nextX][nextY];
    
            if (this.grid[nextX][nextY] === OBSTACLE) {
                break;
            }
        }
    }
    public isOutOfBounds(x: number, y: number): boolean {
        return x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE;
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
    public clearCell(x: number, y: number): void {
        this.hiddenGrid[x][y] = EMPTY_CELL;
    }
    public getCellType(x: number, y: number): string {
        if (this.isOutOfBounds(x, y))   return 'OUT_OF_BOUNDS';
        if (this.isTrap(x, y))          return 'TRAP';
        if (this.isObstacle(x, y))      return 'OBSTACLE';
        if (this.isTreasure(x, y))      return 'TREASURE';
        return 'EMPTY';
    }
}