import {
    EMPTY_CELL,
    GRID_SIZE,
    HIDDEN_CELL,
    OBSTACLE,
    PlayerDirection,
    TRAP,
    TRAP_IMMUNITY_POWERUP,
    TREASURE,
    TWO_MOVES_IN_A_ROW,
} from "../../../game/constants";
import { Game } from "../../../game/Game";
import { Player } from "../../../game/Player";

describe("Game", () => {
    let game: Game;
    const NUMBER_OF_TRAPS = 10;
    const NUMBER_OF_TREASURE = 10;
    const NUMBER_OF_OBSTACLES = 7;
    const NUMBER_OF_TWO_MOVES_IN_A_ROW = 10;
    const NUMBER_OF_TRAP_IMMUNITY_POWERUPS = 10;

    beforeEach(() => {
        game = new Game();
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.spyOn(console, "warn").mockImplementation(() => {});
        jest.spyOn(console, "error").mockImplementation(() => {});
    });
    test("should initialize correctly", () => {
        let trapCount = 0;
        let treasureCount = 0;
        let obstacleCount = 0;
        let twoMovesInARowCount = 0;
        let trapImmunityPowerUpCount = 0;
        game.getGrid().grid.forEach((row) => {
            row.forEach((cell) => {
                if (cell === TRAP) trapCount++;
                if (cell === TREASURE) treasureCount++;
                if (cell === OBSTACLE) obstacleCount++;
                if (cell === TWO_MOVES_IN_A_ROW) twoMovesInARowCount++;
                if (cell === TRAP_IMMUNITY_POWERUP) trapImmunityPowerUpCount++;
            });
        });
        game.getHiddenGrid().forEach((row) => {
            row.forEach((cell) => {
                expect(cell).toBe(HIDDEN_CELL);
            });
        });
        expect(trapCount).toBe(NUMBER_OF_TRAPS);
        expect(treasureCount).toBe(NUMBER_OF_TREASURE);
        expect(obstacleCount).toBe(NUMBER_OF_OBSTACLES);
        expect(twoMovesInARowCount).toBe(NUMBER_OF_TWO_MOVES_IN_A_ROW);
        expect(trapImmunityPowerUpCount).toBe(NUMBER_OF_TRAP_IMMUNITY_POWERUPS);
        expect(game.getGrid().grid.length).toBe(GRID_SIZE);
        expect(game.getGrid().hiddenGrid.length).toBe(GRID_SIZE);
        expect(game.getPlayers().size).toBe(0);
    });
    test("should add a player to the game", () => {
        const playerId = "1";
        const playerName = "Player1";
        game.addPlayer(playerId, playerName);
        expect(game.getPlayers().size).toBe(1);
        expect(game.getPlayers().get(playerId)?.getId()).toBe(playerId);
        expect(game.getPlayers().get(playerId)?.getUsername()).toBe(playerName);
    });
    test("should not add a player with duplicate id", () => {
        const playerId = "1";
        const playerName = "Player1";
        game.addPlayer(playerId, playerName);
        expect(() => game.addPlayer(playerId, "Player2")).toThrowError(
            "Player with this ID already exists!"
        );
        expect(game.getPlayers().size).toBe(1);
    });
    test("should remove a player from the game", () => {
        game.addPlayer("1", "Player1");
        game.addPlayer("2", "Player2");
        expect(game.getPlayers().size).toBe(2);
        game.removePlayer("1");
        expect(game.getPlayers().size).toBe(1);
    });
    test("should not remove a non-existent player", () => {
        game.addPlayer("1", "Player1");
        game.removePlayer("1");
        expect(game.getPlayers().size).toBe(0);
        expect(() => game.removePlayer("1")).toThrowError(
            "Player with ID 1 not found"
        );
    });
    test("should move player forward and update grid/cell visibility", () => {
        game = new Game();
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                game.getGrid().grid[i][j] = EMPTY_CELL;
                game.getGrid().hiddenGrid[i][j] = HIDDEN_CELL;
            }
        }
        const playerId = "1";
        const playerName = "Player1";
        game.addPlayer(playerId, playerName);
        const player = game.getPlayers().get(playerId);
        player?.setPosition(2, 2);
        player?.setDirection(PlayerDirection.EAST);
        expect(game.getGrid().hiddenGrid[2][4]).toBe(HIDDEN_CELL);
        expect(game.getGrid().hiddenGrid[2][5]).toBe(HIDDEN_CELL);
        expect(game.getGrid().hiddenGrid[2][6]).toBe(HIDDEN_CELL);
        expect(game.getGrid().hiddenGrid[2][7]).toBe(HIDDEN_CELL);
        game.movePlayer("F", playerId);
        expect(player?.getX()).toBe(2);
        expect(player?.getY()).toBe(3);
        expect(game.getGrid().grid[2][4]).toBe(EMPTY_CELL);
        expect(game.getGrid().grid[2][5]).toBe(EMPTY_CELL);
        expect(game.getGrid().grid[2][6]).toBe(EMPTY_CELL);
        expect(game.getGrid().grid[2][7]).toBe(EMPTY_CELL);
        expect(game.getGrid().hiddenGrid[2][4]).toBe(EMPTY_CELL);
        expect(game.getGrid().hiddenGrid[2][5]).toBe(EMPTY_CELL);
        expect(game.getGrid().hiddenGrid[2][6]).toBe(EMPTY_CELL);
        expect(game.getGrid().hiddenGrid[2][7]).toBe(EMPTY_CELL);
    });
    test("should not move player if not found", () => {
        expect(game.getPlayers().size).toBe(0);
        expect(() => game.movePlayer("F", "1")).toThrowError(
            "Player not found"
        );
    });
    test("should not move into an obstacle", () => {
        const setUpPlayerAndItem = (
            game: Game,
            item: string | PlayerDirection,
            itemX: number,
            itemY: number,
            playerX: number,
            playerY: number,
            direction: PlayerDirection
        ) => {
            for (let i = 0; i < GRID_SIZE; i++) {
                for (let j = 0; j < GRID_SIZE; j++) {
                    game.getGrid().grid[i][j] = EMPTY_CELL;
                    game.getGrid().hiddenGrid[i][j] = HIDDEN_CELL;
                }
            }
            game.getGrid().grid[itemX][itemY] = item;
            const playerId = "1";
            const playerName = "Player1";
            game.addPlayer(playerId, playerName);
            const player = game.getPlayers().get(playerId);
            player?.setPosition(playerX, playerY);
            player?.setDirection(direction);
            return playerId;
        };
    });
    test("should not move out of bounds", () => {
        const playerId = setUpPlayerAndItem(
            game,
            EMPTY_CELL,
            2,
            3,
            0,
            0,
            PlayerDirection.NORTH
        );
        const player = game.getPlayers().get(playerId);
        const result = game.movePlayer("F", playerId);
        expect(player?.getX()).toBe(0);
        expect(player?.getY()).toBe(0);
        expect(result).toContain("Cannot move forward! Out of bounds.");
    });
    test("should not move into another player", () => {
        const playerId1 = "1";
        const playerName1 = "Player1";
        const playerId2 = "2";
        const playerName2 = "Player2";
        game.addPlayer(playerId1, playerName1);
        game.addPlayer(playerId2, playerName2);
        const player1 = game.getPlayers().get(playerId1);
        const player2 = game.getPlayers().get(playerId2);
        player1?.setDirection(PlayerDirection.EAST);
        player1?.setPosition(2, 2);
        player2?.setDirection(PlayerDirection.NORTH);
        player2?.setPosition(2, 3);
        const result = game.movePlayer("F", playerId1);
        expect(player1?.getX()).toBe(2);
        expect(player1?.getY()).toBe(2);
        expect(player2?.getX()).toBe(2);
        expect(player2?.getY()).toBe(3);
        expect(result).toContain(
            "There is another player in the way! You cannot move forward."
        );
    });
    test("should handle moving onto a trap without immunity (updates score)", () => {
        const playerId = setUpPlayerAndItem(
            game,
            TRAP,
            2,
            3,
            2,
            2,
            PlayerDirection.EAST
        );
        const player = game.getPlayers().get(playerId);
        player?.setTrapImmunity(0);
        player?.setScore(20);
        const result = game.movePlayer("F", playerId);
        expect(result).toContain("You hit a trap! -10 points deducted.");
        expect(player?.getScore()).toBe(10);
        expect(player?.getTrapImmunity()).toBe(0);
    });
    test("should handle moving onto a trap with immunity (updates immunity)", () => {
        const playerId = setUpPlayerAndItem(
            game,
            TRAP,
            2,
            3,
            2,
            2,
            PlayerDirection.EAST
        );
        const player = game.getPlayers().get(playerId);
        player?.setTrapImmunity(2);
        player?.setScore(20);
        const result = game.movePlayer("F", playerId);
        expect(result).toContain("You hit a trap, but you have immunity!");
        expect(player?.getTrapImmunity()).toBe(1);
        expect(player?.getScore()).toBe(20);
    });
    test("should handle moving onto a treasure (updates score)", () => {
        const playerId = setUpPlayerAndItem(
            game,
            TREASURE,
            2,
            3,
            2,
            2,
            PlayerDirection.EAST
        );
        const player = game.getPlayers().get(playerId);
        player?.setScore(0);
        const result = game.movePlayer("F", playerId);
        expect(result).toContain("You found treasure! +5 points added.");
        expect(player?.getScore()).toBe(5);
    });
    test("should handle moving onto a trap immunity power-up (sets immunity)", () => {
        const playerId = setUpPlayerAndItem(
            game,
            TRAP_IMMUNITY_POWERUP,
            2,
            3,
            2,
            2,
            PlayerDirection.EAST
        );
        const player = game.getPlayers().get(playerId);
        player?.setTrapImmunity(0);
        const result = game.movePlayer("F", playerId);
        expect(result).toContain("You found a trap immunity power-up!");
        expect(player?.getTrapImmunity()).toBe(3);
    });
    test("should handle moving onto a x2 power-up (sets x2 power-up flag)", () => {
        const playerId = setUpPlayerAndItem(
            game,
            TWO_MOVES_IN_A_ROW,
            2,
            3,
            2,
            2,
            PlayerDirection.EAST
        );
        const player = game.getPlayers().get(playerId);
        player?.setHasX2PowerUp(false);
        const result = game.movePlayer("F", playerId);
        expect(result).toContain(
            "You found a power-up! You can now move twice in a row!"
        );
        expect(player?.getHasX2PowerUp()).toBe(true);
    });
    test("should turn player north and update grid/cell visibility", () => {
        const playerId = "1";
        game.addPlayer(playerId, "Player1");
        const player = game.getPlayers().get(playerId);
        player?.setDirection(PlayerDirection.EAST);
        const result = game.turnPlayer("ArrowUp", playerId);
        expect(result).toBe("Player turned NORTH.");
        expect(player?.getDirection()).toBe(PlayerDirection.NORTH);
        expect(game.getGrid().grid[player!.getX()][player!.getY()]).toBe(
            PlayerDirection.NORTH
        );
    });
    test("should turn player south and update grid/cell visibility", () => {
        const playerId = "1";
        game.addPlayer(playerId, "Player1");
        const player = game.getPlayers().get(playerId);
        player?.setDirection(PlayerDirection.EAST);
        const result = game.turnPlayer("ArrowDown", playerId);
        expect(result).toBe("Player turned SOUTH.");
        expect(player?.getDirection()).toBe(PlayerDirection.SOUTH);
        expect(game.getGrid().grid[player!.getX()][player!.getY()]).toBe(
            PlayerDirection.SOUTH
        );
    });
    test("should turn player west and update grid/cell visibility", () => {
        const playerId = "1";
        game.addPlayer(playerId, "Player1");
        const player = game.getPlayers().get(playerId);
        player?.setDirection(PlayerDirection.EAST);
        const result = game.turnPlayer("ArrowLeft", playerId);
        expect(result).toBe("Player turned WEST.");
        expect(player?.getDirection()).toBe(PlayerDirection.WEST);
        expect(game.getGrid().grid[player!.getX()][player!.getY()]).toBe(
            PlayerDirection.WEST
        );
    });
    test("should turn player east and update grid/cell visibility", () => {
        const playerId = "1";
        game.addPlayer(playerId, "Player1");
        const player = game.getPlayers().get(playerId);
        player?.setDirection(PlayerDirection.NORTH);
        const result = game.turnPlayer("ArrowRight", playerId);
        expect(result).toBe("Player turned EAST.");
        expect(player?.getDirection()).toBe(PlayerDirection.EAST);
        expect(game.getGrid().grid[player!.getX()][player!.getY()]).toBe(
            PlayerDirection.EAST
        );
    });
    test("should not turn player if not found", () => {
        const result = game.turnPlayer("ArrowUp", "nonexistent");
        expect(result).toBe("Player not found!");
    });
    test("should return correct message for handleHitTrap (without immunity)", () => {
        const player = new Player("1", "Player1");
        player.setTrapImmunity(0);
        player.setScore(10);
        const msg = game.handleHitTrap(player);
        expect(msg).toBe("You hit a trap! -10 points deducted.");
        expect(player.getScore()).toBe(0);
    });
    test("should return correct message for handleHitTrap (with immunity)", () => {
        const player = new Player("1", "Player1");
        player.setTrapImmunity(2);
        player.setScore(10);
        const msg = game.handleHitTrap(player);
        expect(msg).toContain("You hit a trap, but you have immunity!");
        expect(player.getTrapImmunity()).toBe(1);
        expect(player.getScore()).toBe(10);
    });
    test("should return correct message for handleFoundTreasure", () => {
        const player = new Player("1", "Player1");
        player.setScore(0);
        const msg = game.handleFoundTreasure(player);
        expect(msg).toBe("You found treasure! +5 points added.");
        expect(player.getScore()).toBe(5);
    });
    test("should return correct message for handleHitObstacle", () => {
        expect(game.handleHitObstacle()).toBe(
            "There is an obstacle in the way! You cannot move forward."
        );
    });
    test("should return correct message for handleCellWithAnotherPlayer", () => {
        expect(game.handleCellWithAnotherPlayer()).toBe(
            "There is another player in the way! You cannot move forward."
        );
    });
    test("should return correct message for handleIsTrapImmunityPowerUp", () => {
        expect(game.handleIsTrapImmunityPowerUp()).toBe(
            "You found a trap immunity power-up! You can now move through 3 traps."
        );
    });
    test("should return correct message for handleOutOfBounds", () => {
        expect(game.handleOutOfBounds()).toBe(
            "Cannot move forward! Out of bounds."
        );
    });
    test("should return correct message for handleX2PowerUp", () => {
        const player = new Player("1", "Player1");
        player.setHasX2PowerUp(false);
        const msg = game.handleX2PowerUp(player);
        expect(msg).toBe(
            "You found a power-up! You can now move twice in a row!"
        );
        expect(player.getHasX2PowerUp()).toBe(true);
    });
    test("should return correct message for handleExitGame", () => {
        expect(game.handleExitGame()).toBe("Exitting the game");
    });
    test("should return correct message for handleInvalidCommand", () => {
        expect(game.handleInvalidCommand()).toBe(
            "Invalid command! Use W, A, S, D, the Arrow Keys, E or F."
        );
    });
    test("should return grid instance from getGrid", () => {
        expect(game.getGrid()).toBeInstanceOf(Object);
        expect(game.getGrid().grid).toBeDefined();
    });
    test("should return hidden grid from getHiddenGrid", () => {
        expect(game.getHiddenGrid()).toBe(game.getGrid().hiddenGrid);
    });
    test("should return players map from getPlayers", () => {
        expect(game.getPlayers()).toBeInstanceOf(Map);
    });
    test("should not allow player placement on occupied or invalid cells (obstacle, trap, treasure, another player)", () => {
        game.getGrid().grid[0][0] = OBSTACLE;
        game.getGrid().grid[0][1] = TRAP;
        game.getGrid().grid[0][2] = TREASURE;
        const playerId = "1";
        game.addPlayer(playerId, "Player1");
        const player = game.getPlayers().get(playerId);
        player?.setPosition(0, 3);
        const newPlayerId = "2";
        game.addPlayer(newPlayerId, "Player2");
        const newPlayer = game.getPlayers().get(newPlayerId);
        const invalidPositions = [
            [0, 0],
            [0, 1],
            [0, 2],
            [0, 3],
        ];
        const isInvalid = invalidPositions.some(
            ([x, y]) => newPlayer?.getX() === x && newPlayer?.getY() === y
        );
        expect(isInvalid).toBe(false);
    });
    test("should update grid and hiddenGrid correctly after player moves or turns", () => {
        game = new Game();
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                game.getGrid().grid[i][j] = EMPTY_CELL;
                game.getGrid().hiddenGrid[i][j] = HIDDEN_CELL;
            }
        }
        const playerId = "1";
        game.addPlayer(playerId, "Player1");
        const player = game.getPlayers().get(playerId);
        player?.setPosition(2, 2);
        player?.setDirection(PlayerDirection.EAST);
        game.movePlayer("F", playerId);
        expect(game.getGrid().grid[player!.getX()][player!.getY()]).toBe(
            PlayerDirection.EAST
        );
        expect(game.getGrid().hiddenGrid[player!.getX()][player!.getY()]).toBe(
            PlayerDirection.EAST
        );
        game.turnPlayer("ArrowDown", playerId);
        expect(game.getGrid().grid[player!.getX()][player!.getY()]).toBe(
            PlayerDirection.SOUTH
        );
        expect(game.getGrid().hiddenGrid[player!.getX()][player!.getY()]).toBe(
            PlayerDirection.SOUTH
        );
    });
    test("should clear previous cell after move", () => {
        game = new Game();
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                game.getGrid().grid[i][j] = EMPTY_CELL;
                game.getGrid().hiddenGrid[i][j] = HIDDEN_CELL;
            }
        }
        const playerId = "1";
        game.addPlayer(playerId, "Player1");
        const player = game.getPlayers().get(playerId);
        player?.setPosition(2, 2);
        player?.setDirection(PlayerDirection.EAST);
        game.movePlayer("F", playerId);
        expect(game.getGrid().grid[2][2]).toBe(EMPTY_CELL);
        expect(game.getGrid().hiddenGrid[2][2]).toBe(EMPTY_CELL);
    });
    test("should reveal line of sight after move", () => {
        game = new Game();
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                game.getGrid().grid[i][j] = EMPTY_CELL;
                game.getGrid().hiddenGrid[i][j] = HIDDEN_CELL;
            }
        }
        const playerId = "1";
        game.addPlayer(playerId, "Player1");
        const player = game.getPlayers().get(playerId);
        player?.setPosition(2, 2);
        player?.setDirection(PlayerDirection.EAST);
        game.movePlayer("F", playerId);
        let y = player!.getY() + 1;
        while (
            y < GRID_SIZE &&
            game.getGrid().grid[player!.getX()][y] !== OBSTACLE
        ) {
            expect(game.getGrid().hiddenGrid[player!.getX()][y]).toBe(
                game.getGrid().grid[player!.getX()][y]
            );
            y++;
        }
    });
    const setUpPlayerAndItem = (
        game: Game,
        item: string | PlayerDirection,
        itemX: number,
        itemY: number,
        playerX: number,
        playerY: number,
        direction: PlayerDirection
    ) => {
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                game.getGrid().grid[i][j] = item;
                game.getGrid().hiddenGrid[i][j] = item;
            }
        }
        game.getGrid().grid[itemX][itemY] = item;
        const playerId = "1";
        const playerName = "Player1";
        game.addPlayer(playerId, playerName);
        const player = game.getPlayers().get(playerId);
        player?.setPosition(playerX, playerY);
        player?.setDirection(direction);
        return playerId;
    };
    afterEach(() => {
        jest.restoreAllMocks();
    });
});