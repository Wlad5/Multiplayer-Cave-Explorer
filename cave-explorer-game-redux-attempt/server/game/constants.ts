export const GRID_SIZE              : number    =  10;
export const EMPTY_CELL             : string    = '.';
export const HIDDEN_CELL            : string    = '?';
export const PLAYER_NORTH           : string    = '^';
export const PLAYER_EAST            : string    = '>';
export const PLAYER_SOUTH           : string    = 'v';
export const PLAYER_WEST            : string    = '<';
export const TREASURE               : string    = 'T';
export const TRAP                   : string    = 'X';
export const OBSTACLE               : string    = 'O';
export const TRAP_IMMUNITY_POWERUP  : string    = 'P';
export const TWO_MOVES_IN_A_ROW     : string    = 'X2';

export enum PlayerDirection {
    NORTH   = '^',
    EAST    = '>',
    SOUTH   = 'v',
    WEST    = '<'
}