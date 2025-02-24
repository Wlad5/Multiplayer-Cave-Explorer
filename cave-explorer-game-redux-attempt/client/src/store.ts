import { combineReducers, createStore } from 'redux';
import { gridReducer } from './reducers/gridReducer';
import { playerReducer } from './reducers/playerReducer';

export const rootReducer = combineReducers({
    grid: gridReducer,
    player: playerReducer
})

export const store = createStore(rootReducer)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch