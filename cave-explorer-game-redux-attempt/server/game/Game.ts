import { Player } from "./Player";
import { Grid } from "./Grid";
import { TRAP, TREASURE, OBSTACLE } from "./constants";

export class Game {
    private grid: Grid;
    private players: Map<string, Player>;  // Use Map with socket.id as key
    
    constructor() {
        this.grid = new Grid();
        this.players = new Map();  // Initialize as an empty Map
        this.initializeGame();
    }

    private initializeGame(): void {
        [TRAP, TREASURE, OBSTACLE].forEach(item => this.grid.placeRandomItems(item, 5));
    }

    public addPlayer(playerId: string): Player {
        const newPlayer = new Player();
        newPlayer.setId(playerId);
        this.players.set(playerId, newPlayer);  // Store player using playerId (socket.id) as the key
        this.updateGrid();
        return newPlayer;
    }

    public removePlayer(playerId: string): void {
        this.players.delete(playerId);  // Remove player by playerId (socket.id)
        this.updateGrid();
    }

    public handleMove(move: string, playerId: string): void {
        const player = this.players.get(playerId);  // Get player by socket.id
        if (!player) return;

        const prevX = player.getX();
        const prevY = player.getY();

        switch (move) {
            case "L": player.turn(true); break;
            case "R": player.turn(false); break;
            case "F": this.processMove(player); break;
            case "E": {
                console.log("Exiting the cave with score: ", player.getScore());
                return;
            }
            default: console.log("Invalid command! Use L, R, F, or E.");
        }

        this.grid.clearCell(prevX, prevY);
        this.updateGrid();
    }

    public processMove(player: Player): void {
        const { newX, newY } = player.moveForward();
        const cellType = this.grid.getCellType(newX, newY);

        switch (cellType) {
            case "TRAP":
                console.log("You hit a trap! -10 points!");
                player.updateScore(-10);
                this.grid.revealCell(newX, newY);
                player.setPosition(newX, newY);
                break;

            case "TREASURE":
                console.log("You found treasure! +5 points!");
                player.updateScore(5);
                this.grid.revealCell(newX, newY);
                player.setPosition(newX, newY);
                break;

            case "OBSTACLE":
                console.log("You hit an obstacle!");
                this.grid.revealCell(newX, newY);
                break;

            case "OUT_OF_BOUNDS":
                console.log("You hit a wall!");
                break;

            default:
                player.setPosition(newX, newY);
                this.grid.revealLineOfSight(newX, newY, player.getDirection());
                break;
        }
    }

    public updateGrid(): void {
        this.players.forEach(player => {
            this.grid.revealCell(player.getX(), player.getY(), player.getDirection());
        });
    }

    public getGameState(): { grid: Grid; players: any[] } {
        return {
            grid: this.grid,
            players: Array.from(this.players.values()).map((player) => ({
                id: player.getId(),
                x: player.getX(),
                y: player.getY(),
                score: player.getScore(),
                playerDirection: player.getDirection(),
            })),
        };
    }

    public getPlayers(): Player[] {
        return Array.from(this.players.values());  // Return all players as an array
    }
}