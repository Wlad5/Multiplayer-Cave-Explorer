import { PlayerDirection } from './constants';

export class Player {
    private playerId: string = '';
    private x: number = 0;
    private y: number = 0;
    private score: number = 0;
    private playerDirection: PlayerDirection = PlayerDirection.NORTH;
    private playerStatus: string = "idle";
    constructor() {
        this.playerId           = '';
        this.x                  = 0;
        this.y                  = 0;
        this.score              = 0;
        this.playerDirection    = PlayerDirection.NORTH;
        this.playerStatus       = 'idle'
    }

    public turn(left: boolean): void {
        switch (this.playerDirection) {
            case PlayerDirection.NORTH : this.playerDirection = left ? PlayerDirection.WEST  : PlayerDirection.EAST;  break;
            case PlayerDirection.EAST  : this.playerDirection = left ? PlayerDirection.NORTH : PlayerDirection.SOUTH; break;
            case PlayerDirection.SOUTH : this.playerDirection = left ? PlayerDirection.EAST  : PlayerDirection.WEST;  break;
            case PlayerDirection.WEST  : this.playerDirection = left ? PlayerDirection.SOUTH : PlayerDirection.NORTH; break;
        }
    }

    public updateScore(score: number): void {
        this.score += score;
    }

    public moveForward() {
        let newX = this.x;
        let newY = this.y;

        switch (this.playerDirection) {
            case PlayerDirection.NORTH : newX--; break;
            case PlayerDirection.EAST  : newY++; break;
            case PlayerDirection.SOUTH : newX++; break;
            case PlayerDirection.WEST  : newY--; break;
        }
        return {newX, newY};
    }

    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
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
    public getScore(): number {
        return this.score;
    }
    public getId(): string {
        return this.playerId;
    }
    public setId(id: string): void {
        this.playerId = id;
    }
}