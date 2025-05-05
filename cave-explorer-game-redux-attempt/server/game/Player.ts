import { GRID_SIZE, PlayerDirection } from "./constants";
import { Grid } from "./Grid";

export class Player {
    private playerId: string;
    private x: number;
    private y: number;
    private playerDirection: PlayerDirection;
    private score: number;
    private username: string;
    private trapImmunity: number;
    constructor(playerId: string, username: string) {
        this.playerId = playerId;
        this.x = Math.floor(Math.random() * GRID_SIZE);
        this.y = Math.floor(Math.random() * GRID_SIZE);
        this.playerDirection = Object.values(PlayerDirection)[Math.floor(Math.random() * Object.values(PlayerDirection).length)];
        this.username = username;
        this.score = 0;
        this.trapImmunity = 0;
    }
    public turn(move: string): void {
        const directionMap: Record<string, PlayerDirection> = {
            arrowup: PlayerDirection.NORTH,
            w: PlayerDirection.NORTH,
            "^": PlayerDirection.NORTH,
            arrowdown: PlayerDirection.SOUTH,
            s: PlayerDirection.SOUTH,
            v: PlayerDirection.SOUTH,
            arrowleft: PlayerDirection.WEST,
            a: PlayerDirection.WEST,
            "<": PlayerDirection.WEST,
            arrowright: PlayerDirection.EAST,
            d: PlayerDirection.EAST,
            ">": PlayerDirection.EAST,
        };
    
        const normalizedMove = move.toLowerCase();
        const newDirection = directionMap[normalizedMove];
        if (newDirection) {
            this.playerDirection = newDirection;
        } else {
            console.error(`Invalid direction: ${move}`);
        }
    }
    public moveForward(grid: Grid, players: Map<string, Player>) {
        let newX = this.x;
        let newY = this.y;
    
        switch (this.playerDirection) {
            case PlayerDirection.NORTH  : newX--; break;
            case PlayerDirection.EAST   : newY++; break;
            case PlayerDirection.SOUTH  : newX++; break;
            case PlayerDirection.WEST   : newY--; break;
        }
    
        const outOfBounds = grid.isOutOfBounds(newX, newY);
        
        if (outOfBounds) {
            return {
                newX,
                newY,
                outOfBounds: true,
                hitObstacle: false,
                hitTrap: false,
                foundTreasure: false,
                cellWithAnotherPlayer: false,
                isTrapImmunityPowerUp: false
            };
        }
        const hitTrap = grid.isTrap(newX, newY);
        const foundTreasure = grid.isTreasure(newX, newY);
        const hitObstacle = grid.isObstacle(newX, newY);
        const isTrapImmunityPowerUp = grid.isTrapImmunityPowerUp(newX, newY);
        const cellWithAnotherPlayer = Array.from(players.values()).some(
            (player) => player.getX() === newX && player.getY() === newY && player.getId() !== this.playerId
        );

        if (cellWithAnotherPlayer) {
            return {
                outOfBounds: false,
                hitObstacle: false,
                hitTrap: false,
                foundTreasure: false,
                cellWithAnotherPlayer: true,
                isTrapImmunityPowerUp: false
            };
        }
        
        if (hitObstacle) {
            return {
                outOfBounds: false,
                hitObstacle: true,
                hitTrap: false,
                foundTreasure: false,
                cellWithAnotherPlayer: false,
                isTrapImmunityPowerUp: false
            }
        }
        if (isTrapImmunityPowerUp) {
            this.trapImmunity = 3;
            this.x = newX;
            this.y = newY;
            grid.clearCell(newX, newY);
            return {
                newX,
                newY,
                outOfBounds: false,
                hitObstacle: false,
                hitTrap: false,
                foundTreasure: false,
                cellWithAnotherPlayer: false,
                isTrapImmunityPowerUp: true
            }
        }
    
        if (hitTrap || foundTreasure) {
            grid.clearCell(newX, newY);
        }
    
        this.x = newX;
        this.y = newY;
    
        return {
            newX,
            newY,
            outOfBounds: false,
            hitObstacle: false,
            hitTrap,
            foundTreasure,
            cellWithAnotherPlayer: false,
            isTrapImmunityPowerUp: false,
        };
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
    public getUsername(): string {
        return this.username;
    }
    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }
    public setDirection(direction: PlayerDirection): void {
        this.playerDirection = direction;
    }
    public setScore(score: number): void {
        this.score = score;
    }
    public setUsername(username: string): void {
        this.username = username;
    }
    public getTrapImmunity(): number {
        return this.trapImmunity;
    }
    public setTrapImmunity(immunity: number): void {
        this.trapImmunity = immunity;
    }
}
