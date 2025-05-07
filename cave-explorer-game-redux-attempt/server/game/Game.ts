import { OBSTACLE, PlayerDirection, TRAP, TRAP_IMMUNITY_POWERUP, TREASURE } from "./constants";
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
        this.grid.placeRandomItems(TRAP_IMMUNITY_POWERUP, 10)
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
            case "F": {
                const result = player.move(this.grid, this.players);
                switch (true) {
                    case result.outOfBounds: {
                        resultMessage = this.handleOutOfBounds();
                        break;
                    }
                    case result.hitTrap: {
                        resultMessage = this.handleHitTrap(player);
                        break;
                    }
                    case result.foundTreasure: {
                        resultMessage = this.handleFoundTreasure(player, );
                        break;
                    }
                    case result.hitObstacle: {
                        resultMessage = this.handleHitObstacle();
                        break;
                    }
                    case result.cellWithAnotherPlayer: {
                        resultMessage = this.handleCellWithAnotherPlayer();
                        break;
                    }
                    case result.isTrapImmunityPowerUp: {
                        resultMessage = this.handleIsTrapImmunityPowerUp();
                        break;
                    }
                }
                console.log(prevX, prevY)
                this.grid.revealLineOfSight(player.getX(), player.getY(), player.getDirection());
                break;
            }
            case "E": {
                this.handleExitGame();
                break;
            }
            default:
                this.handleInvalidCommand();
                break;
            }

        this.grid.clearCell(prevX, prevY);
        this.grid.revealCurrentCell(player.getX(), player.getY(), player.getDirection());
        return resultMessage;
    }
    public turnPlayer(direction: string, playerId: string): string {
        const player = this.players.get(playerId);
        if (!player) {
            return `Player not found!`;
        }
        let resultMessage = ``;
        switch (direction) {
            case "ArrowUp":
            case "w": {
                resultMessage = this.handleDirectionNorth(player);
                break;
            }
            case "ArrowDown":
            case "s": {
                resultMessage = this.handleDirectionSouth(player);
                break;
            }
            case "ArrowLeft":
            case "a": {
                resultMessage = this.handleDirectionWest(player);
                break;
            }
            case "ArrowRight":
            case "d": {
                resultMessage = this.handleDirectionEast(player);
                break;
            }
        }
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
        return this.grid;
    }
    public getHiddenGrid() {
        return this.grid.hiddenGrid;
    }
    public getPlayers() {
        return this.players;
    }
    public handleHitTrap(player: Player): string {
        if (player.getTrapImmunity() > 0) {
            player.setTrapImmunity(player.getTrapImmunity() - 1);
            player.subtractScore(0);
            return`You hit a trap, but you have immunity! You can now move through ${player.getTrapImmunity()} traps.`;
        } else {
            player.subtractScore(10);
            console.log(`Player ${player.getId()} has ${player.getScore()} points`);
            return `You hit a trap! -10 points deducted.`;
        }
    }
    public handleFoundTreasure(player: Player, ): string {
        player.addScore(5);
        console.log(`Player ${player.getId()} has ${player.getScore()} points`);
        return `You found treasure! +5 points added.`;
    }
    public handleHitObstacle(): string {
        return `There is an obstacle in the way! You cannot move forward.`;
    }
    public handleCellWithAnotherPlayer(): string {
        return `There is another player in the way! You cannot move forward.`;
    }
    public handleIsTrapImmunityPowerUp(): string {
        return `You found a trap immunity power-up! You can now move through 3 traps.`;
    }
    public handleOutOfBounds(): string {
        return `Cannot move forward! Out of bounds.`;
    }
    public handleExitGame(): string {
        return `Exitting the game`;
    }
    public handleInvalidCommand(): string {
        return `Invalid command! Use W, A, S, D, the Arrow Keys, E or F.`;
    }
    public handleDirectionNorth(player: Player): string {
        player.turn(PlayerDirection.NORTH);
        this.grid.revealCurrentCell(player.getX(), player.getY(), player.getDirection());
        return `Player turned NORTH.`;
    }
    public handleDirectionSouth(player: Player): string {
        player.turn(PlayerDirection.SOUTH);
        this.grid.revealCurrentCell(player.getX(), player.getY(), player.getDirection());
        return `Player turned SOUTH.`;
    }
    public handleDirectionWest(player: Player): string {
        player.turn(PlayerDirection.WEST);
        this.grid.revealCurrentCell(player.getX(), player.getY(), player.getDirection());
        return `Player turned WEST.`;
    }
    public handleDirectionEast(player: Player): string {
        player.turn(PlayerDirection.EAST);
        this.grid.revealCurrentCell(player.getX(), player.getY(), player.getDirection());
        return `Player turned EAST.`;
    }
}