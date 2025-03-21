import { combineReducers, createStore, applyMiddleware } from 'redux';
import { gridReducer, GridState} from './reducers/gridReducer';
import { playerReducer, PlayerState} from './reducers/playerReducer';
import { gameReducer, GameState} from './reducers/gameReducer';
import { thunk, ThunkAction } from 'redux-thunk';
import { ThunkMiddleware } from 'redux-thunk';
import { GridActions } from './reducers/gridActions';
import { GameActions } from './reducers/gameActions';
import { PlayerActions } from './reducers/playerActions';

export type AppActions = GameActions | GridActions | PlayerActions;

export interface RootState {
    grid: GridState;
    player: PlayerState[];
    game: GameState;
}

const rootReducer = combineReducers({
    grid: gridReducer,
    player: playerReducer,
    game: gameReducer,
});

export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    AppActions
>

export const store = createStore(
    rootReducer,
    undefined,
    applyMiddleware(thunk as unknown as ThunkMiddleware<RootState, AppActions>)
);

export type AppDispatch = typeof store.dispatch;