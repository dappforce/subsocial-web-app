import { Action, configureStore } from '@reduxjs/toolkit'
import { useMemo } from 'react'
import { createSelectorHook, useDispatch } from 'react-redux'
import { ThunkAction } from 'redux-thunk'
import { isDevMode } from 'src/components/utils/env'
import rootReducer, { RootState } from './rootReducer'

// Do not use this store object.
// It is created just to help us get types fro TypeScript
const emptyStore = initStore()

export type AppStore = typeof emptyStore

// NEVER EXPORT THE STORE!
//
// Words of Dan Abramov (creator of Redux):
// We don’t recommend that because it makes it much harder to add server rendering to your app
// because in most cases on the server you’ll want to have a separate store per request.

let store: AppStore | undefined

export type AppDispatch = typeof emptyStore.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()

export const useAppSelector = createSelectorHook<RootState>()

export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>

function initStore (preloadedState?: RootState) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    // devTools: true,
    // middleware: (getDefaultMiddleware) =>
    //   getDefaultMiddleware({
    //     thunk: {
    //       // extraArgument: myCustomApiService,
    //       extraArgument: { hello: 'world' }
    //     },
    //     // Setting immutableCheck to false can improve performance of Redux in development mode.
    //     immutableCheck: false,
    //     // serializableCheck: false,
    //   }),
  })
}

/**
 * Based on Next.js with Redux example.
 * See https://github.com/vercel/next.js/blob/canary/examples/with-redux/store.js
 */ 
export const initializeStore = (preloadedState?: RootState) => {
  let _store = store ?? initStore(preloadedState)

  // After navigating to a page with an initial Redux state, merge that state
  // with the current state in the store, and create a new store
  if (preloadedState && store) {
    _store = initStore({
      ...store.getState(),
      ...preloadedState,
    })
    // Reset the current store
    store = undefined
  }

  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') return _store

  // Create the store once in the client
  if (!store) store = _store

  if (isDevMode && module.hot && store) {
    module.hot.accept('./rootReducer', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const newRootReducer = require('./rootReducer').default
      store && store.replaceReducer(newRootReducer)
    })
  }

  return _store
}

export function useStore (initialState: RootState) {
  const store = useMemo(() => initializeStore(initialState), [ initialState ])
  return store
}

/** Used in props of Next.js pages. */
export type HasInitialReduxState = {
  initialReduxState?: RootState
}
