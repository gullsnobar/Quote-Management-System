import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import themeReducer from '../features/theme/themeSlice'

/**
 * Central Redux store.
 *
 * Each slice owns a piece of state. As the app grows you can add more
 * slices (e.g. quotesSlice, corridorsSlice) and register them here.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
  },
})

/**
 * Infer the root state and dispatch types from the store itself.
 * These are used by the typed hooks in `store/hooks.ts` so every
 * component gets full type-safety without manual typing.
 */
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
