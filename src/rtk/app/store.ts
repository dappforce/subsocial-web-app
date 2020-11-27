import { Action, configureStore } from '@reduxjs/toolkit'
import { createSelectorHook, useDispatch } from 'react-redux'
import { ThunkAction } from 'redux-thunk'
import { isDevMode } from 'src/components/utils/env'
import rootReducer, { RootState } from './rootReducer'


// NEVER EXPORT THE STORE!
//
// Words of Dan Abramov (creator of Redux):
// We don’t recommend that because it makes it much harder to add server rendering to your app
// because in most cases on the server you’ll want to have a separate store per request.
const store = configureStore({
  reducer: rootReducer
})

if (isDevMode && module.hot) {
  module.hot.accept('./rootReducer', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const newRootReducer = require('./rootReducer').default
    store.replaceReducer(newRootReducer)
  })
}

export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()

export const useAppSelector = createSelectorHook<RootState>()

export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>

export default store
