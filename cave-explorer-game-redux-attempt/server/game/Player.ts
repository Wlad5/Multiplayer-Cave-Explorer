import { GRID_SIZE, PlayerDirection } from "./constants";
import { Grid } from "./Grid";

export class Player {
    private playerId: string;
    private x: number = 0;
    private y: number = 0;
    private playerDirection: PlayerDirection = PlayerDirection.NORTH;
    private grid: Grid;
    private score: number = 0;

    constructor(playerId: string, grid: Grid) {
        this.playerId = playerId;
        this.x = Math.floor(Math.random() * GRID_SIZE);
        this.y = Math.floor(Math.random() * GRID_SIZE);
        this.playerDirection = Object.values(PlayerDirection)[Math.floor(Math.random() * Object.values(PlayerDirection).length)];
        this.grid = grid;
        this.score = 0;
    }

    public turn(left: boolean): void {
        switch (this.playerDirection) {
            case PlayerDirection.NORTH:
                this.playerDirection = left ? PlayerDirection.WEST : PlayerDirection.EAST;
                break;
            case PlayerDirection.EAST:
                this.playerDirection = left ? PlayerDirection.NORTH : PlayerDirection.SOUTH;
                break;
            case PlayerDirection.SOUTH:
                this.playerDirection = left ? PlayerDirection.EAST : PlayerDirection.WEST;
                break;
            case PlayerDirection.WEST:
                this.playerDirection = left ? PlayerDirection.SOUTH : PlayerDirection.NORTH;
                break;
        }
    }

    public moveForward() {
        let newX = this.x;
        let newY = this.y;

        switch (this.playerDirection) {
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

        const outOfBounds = this.grid.isOutOfBounds(newX, newY);
        
        if (outOfBounds) return {
            newX,
            newY,
            outOfBounds: true,
            hitObstacle: false,
            hitTrap: false,
            foundTreasure: false
        };
        

        const hitTrap = this.grid.isTrap(newX, newY);
        const foundTreasure = this.grid.isTreasure(newX, newY);
        if (this.grid.isObstacle(newX, newY)) return {
            newX,
            newY,
            outOfBounds: false,
            hitObstacle: true,
            hitTrap: false,
            foundTreasure: false
        };
        
        if (hitTrap || foundTreasure) this.grid.clearCell(newX, newY);
        if (newX === 0 && newY === 0) window.close()

        this.x = newX;
        this.y = newY;
        return {
            newX,
            newY,
            outOfBounds: false,
            hitObstacle: false,
            hitTrap,
            foundTreasure
        }
    }

    public addScore(points: number): void {
        this.score += points;
    }

    public subtractScore(points: number): void {
        this.score -= points;
    }

    public getScore(): number {
        return this.score;
    }

    public getDirection(): PlayerDirection {
        return this.playerDirection;
    }

    public getX(): number {
        return this.x;
    }

    public getY(): number {
        return this.y;
    }
    public getId(): string {
        return this.playerId;
    }
}
