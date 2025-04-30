import { OBSTACLE, TRAP, TREASURE } from "./constants";
import { Grid } from "./Grid";
import { Player } from "./Player";

export class Game {
    private grid: Grid;
    private players: Map<string, Player>;

    constructor() {
        this.grid = new Grid();
        this.players = new Map<string, Player>();
        this.grid.placeRandomItems(TREASURE, 10);
        this.grid.placeRandomItems(TRAP, 10);
        this.grid.placeRandomItems(OBSTACLE, 7);
        this.players.forEach((player) => this.grid.revealCurrentCell(player.getX(), player.getY(), player.getDirection()));
    }

    public playMove(move: string, playerId: string): string {
        const player = this.players.get(playerId);
        if (!player) {
            return `Player not found!`;
        }
        const prevX = player.getX();
        const prevY = player.getY();
        let resultMessage = ``;
        switch (move) {
            case "L": {
                player.turn(true);
                break;
            }
            case "R": {
                player.turn(false);
                break;
            }
            case "F": {
                const result = player.moveForward(this.grid, this.players);
                if (result.outOfBounds) {
                    resultMessage = `Cannot move forward! Out of bounds.`;
                } else if (result.hitTrap) {
                    player.subtractScore(10);
                    resultMessage = `You hit a trap! -10 points deducted.`;
                    console.log(`Player ${player.getId()} has ${player.getScore()} points`);
                } else if (result.foundTreasure) {
                    player.addScore(5);
                    resultMessage = `You found treasure! +5 points added.`;
                    console.log(`Player ${player.getId()} has ${player.getScore()} points`);
                } else if (result.hitObstacle) {
                    resultMessage = `There is an obstacle in the way! You cannot move forward.`;
                } else if (result.cellWithAnotherPlayer) {
                    resultMessage = `There is another player in the way! You cannot move forward.`;
                }
                console.log(prevX, prevY)
                this.grid.revealLineOfSight(player.getX(), player.getY(), player.getDirection());
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
        this.grid.revealCurrentCell(player.getX(), player.getY(), player.getDirection());
        return resultMessage;
    }

    public addPlayer(playerId: string, username: string): void {
        console.log(`Adding player with ID: ${playerId}`);
        if (this.players.has(playerId)) {
            return;
        }
        let player: Player;
        let attempts = 0;
        const maxAttempts = 20;
        do {
            player = new Player(playerId, username);
            this.grid.revealCurrentCell(player.getX(), player.getY(), player.getDirection());
            attempts++;
        } while (
            this.grid.isObstacle(player.getX(), player.getY()) &&
            Array.from(this.players.values()).some(p => p.getX() === player.getX() && p.getY() === player.getY()) &&
            this.grid.isTrap(player.getX(), player.getY()) &&
            this.grid.isTreasure(player.getX(), player.getY()) &&
            attempts < maxAttempts
        );
    
        if (attempts === maxAttempts) {
            console.log(`Failed to place player after ${maxAttempts} attempts`);
            return;
        }
        this.players.set(playerId, player);
        console.log(this.players);
    }
    public removePlayer(playerId: string): void {
        const player = this.players.get(playerId);
        if (player) {
            this.grid.clearCell(player.getX(), player.getY());
            this.players.delete(playerId);
        }
    }

    public getGrid() {
        return this.grid.grid;
    }
    public getHiddenGrid() {
        return this.grid.hiddenGrid;
    }

    public getPlayers() {
        return this.players;
    }
}