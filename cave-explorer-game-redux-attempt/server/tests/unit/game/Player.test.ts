import { 
    OBSTACLE,
    PlayerDirection,
    TRAP,
    TRAP_IMMUNITY_POWERUP,
    TREASURE,
    TWO_MOVES_IN_A_ROW 
} from "../../../game/constants";
import { Grid } from "../../../game/Grid";
import { Player } from "../../../game/Player";

describe('Player', () => {
    let player  : Player;
    let grid    : Grid;

    beforeEach(                                             () => {
        player  = new Player('1', 'Player1')
        grid    = new Grid();
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    })
    test('should initialize player with default values',    () => {
        expect(player.getId())                  .toBe('1');
        expect(player.getUsername())            .toBe('Player1');
        expect(player.getScore())               .toBe(0);
        expect(player.getTrapImmunity())        .toBe(0);
        expect(player.getHasX2PowerUp())        .toBe(false);
        expect(Object.values(PlayerDirection))  .toContain(player.getDirection());
    })
    test('should turn player to a new direction',           () => {
        player                          .turn('ArrowUp');
        expect(player.getDirection())   .toBe(PlayerDirection.NORTH);
        player                          .turn('ArrowRight');
        expect(player.getDirection())   .toBe(PlayerDirection.EAST);
    })
    test('should move player to a new position',            () => {
        player.setPosition(1, 1);
        let initialX = player       .getX();
        let initialY = player       .getY();
        player.turn('ArrowUp')
        const result = player       .move(grid, new Map());
        expect(result.outOfBounds)  .toBe(false);
        expect(result.hitObstacle)  .toBe(false);
        expect(player.getX())       .toBe(initialX - 1);
        expect(player.getY())       .toBe(initialY);
    })
    test('should not move into another player',             () => {
        const otherPlayer   = new Player('2', 'Player2');
        otherPlayer                             .setPosition(0, 1);
        grid.grid[0][1]     = Object.values(PlayerDirection)[Math.floor(Math.random() * 4 )];
        const playersMap    = new Map<string, Player>([[otherPlayer.getId(), otherPlayer]]);
        player                                  .setPosition(0, 0);
        player                                  .setDirection(PlayerDirection.EAST);
        const result = player                   .move(grid, playersMap);
        expect(result.cellWithAnotherPlayer)    .toBe(true);
        expect(player.getX())                   .toBe(0);
        expect(player.getY())                   .toBe(0);
    })
    test('should not move out of bounds',                   () => {
        player.setPosition(0, 0);
        player.turn('ArrowUp');
        const result = player       .move(grid, new Map());
        expect(result.outOfBounds)  .toBe(true);
        expect(player.getX())       .toBe(0);
        expect(player.getY())       .toBe(0);
    })
    test('should not move into an obstacle',                () => {
        grid.grid[0][1] = OBSTACLE;
        player                      .setPosition(0, 0);
        player                      .setDirection(PlayerDirection.EAST);
        const result    = player    .move(grid, new Map());
        expect(result.hitObstacle)  .toBe(true);
        expect(player.getX())       .toBe(0);
    }) 
    test('should handle trap immunity power-up',            () => {
        grid.grid[0][1] = TRAP_IMMUNITY_POWERUP;
        player                              .setPosition(0, 0);
        player                              .setDirection(PlayerDirection.EAST);
        const result    = player            .move(grid, new Map());
        expect(result.isTrapImmunityPowerUp).toBe(true)
        expect(player.getTrapImmunity())    .toBe(3);
    })
    test('should handle x2 power-up',                       () => {
        grid.grid[0][1] = TWO_MOVES_IN_A_ROW;
        player                              .setPosition(0, 0);
        player                              .setDirection(PlayerDirection.EAST);
        const result = player               .move(grid, new Map());
        expect(result.isX2PowerUp)          .toBe(true);
        expect(player.getHasX2PowerUp())    .toBe(true);
        player                              .move(grid, new Map());
        expect(player.getHasX2PowerUp())    .toBe(false);
    });
    test('should handle a trap',                            () => {
        grid.grid[0][1]     = TRAP;
        player                              .setPosition(0, 0);
        player                              .setDirection(PlayerDirection.EAST);
        const playerScore   = player        .getScore();
        const result        = player        .move(grid, new Map());
        if (result.hitTrap) {
            if (player.getTrapImmunity() > 0) {
                player.setTrapImmunity(player.getTrapImmunity() - 1);
            } else {
                player                      .subtractScore(10);
            }
        }
        expect(result.hitTrap)              .toBe(true);
        expect(player.getTrapImmunity())    .toBe(0);
        expect(player.getScore())           .toBeLessThan(playerScore);

    })
    test('should handle a treasure',                        () => {
        grid.grid[0][1] = TREASURE;
        player                          .setPosition(0, 0);
        player                          .setDirection(PlayerDirection.EAST);
        const playerScore = player      .getScore();
        const result = player           .move(grid, new Map());
        if (result.foundTreasure) {
            player                      .addScore(10);
        }
        expect(result.foundTreasure)    .toBe(true);
        expect(player.getScore())       .toBeGreaterThan(playerScore);
    })
    test('should add and subtract score correctly',         () => {
        player                      .addScore(10);
        expect(player.getScore())   .toBe(10);
        player                      .subtractScore(5);
        expect(player.getScore())   .toBe(5);
    })
    test('should return the player\'s score',               () => {
        player                      .addScore(10);
        expect(player.getScore())   .toBe(10);
    })
    test('should return the player\'s direction',           () => {
        player                          .setDirection(PlayerDirection.SOUTH);
        expect(player.getDirection())   .toBe(PlayerDirection.SOUTH);
    })
    test('should return the player\'s position',            () => {
        player                  .setPosition(5, 9);
        expect(player.getX())   .toBe(5);
        expect(player.getY())   .toBe(9);
    })
    test('should return the player\'s ID',                  () => {
        expect(player.getId())              .toBe('1');
    })
    test('should return the player\'s username',            () => {
        expect(player.getUsername())        .toBe('Player1');
    })
    test('should return the player\'s trap immunity count', () => {
        player                              .setTrapImmunity(5);
        expect(player.getTrapImmunity())    .toBe(5);
    })
    test('should return the player\'s x2 power-up ability', () => {
        player                              .setHasX2PowerUp(true);
        expect(player.getHasX2PowerUp())    .toBe(true);
    })
    test('should not set negative trap immunity',           () => {
        player                              .setTrapImmunity(-1);
        expect(player.getTrapImmunity())    .toBe(0);
    })
    test('should not set an out of bounds position',        () => {
        player                  .setPosition(-1, -1);
        expect(player.getX())   .toBe(0);
        expect(player.getY())   .toBe(0);
    })
    afterEach(                                              () => {
        jest.restoreAllMocks();
    })
})