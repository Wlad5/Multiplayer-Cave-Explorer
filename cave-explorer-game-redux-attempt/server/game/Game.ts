import { OBSTACLE, TRAP, TREASURE } from "./constants";
import { Grid } from "./Grid";
import { Player } from "./Player";

export class Game {
    private grid: Grid;
    private player: Player;
    private score: number = 0;

    constructor() {
        this.grid = new Grid();
        this.player = new Player(this.grid);
        this.grid.placeRandomItems(TREASURE, 10);
        this.grid.placeRandomItems(TRAP, 10);
        this.grid.placeRandomItems(OBSTACLE, 7);
        this.grid.revealCurrentCell(this.player.getX(), this.player.getY(), this.player.getDirection());
    }

    public playMove(move: string) {
        const prevX = this.player.getX();
        const prevY = this.player.getY();
        let resultMessage = ``;
        switch (move) {
            case "L": {
                this.player.turn(true);
                break;
            }
            case "R": {
                this.player.turn(false);
                break;
            }
            case "F": {
                const result = this.player.moveForward();
                if (result.outOfBounds) {
                    resultMessage = `Cannot move forward! Out of bounds.`;
                } else if (result.hitTrap) {
                    resultMessage = `You hit a trap! Your score is now ${this.score - 10}`;
                    this.score -= 10;
                } else if (result.foundTreasure) {
                    resultMessage = `You found treasure! Your score is now ${this.score + 5}`;
                    this.score += 5;
                    console.log(this.score)
                } else if (result.hitObstacle) {
                    resultMessage = `There is an obstacle in the way! You cannot move forward.`;
                }
            
                this.grid.revealLineOfSight(this.player.getX(), this.player.getY(), this.player.getDirection());
                break;
            }
            case "E": {
                resultMessage = `Exitting the game`
                break;
            }
            default:
                resultMessage = `Invalid command! Use L, R, or F.`;
        }

        this.grid.clearCell(prevX, prevY);
        this.grid.revealCurrentCell(this.player.getX(), this.player.getY(), this.player.getDirection());
        return resultMessage;
    }

    public getGrid(): Grid {
        return this.grid;
    }
}