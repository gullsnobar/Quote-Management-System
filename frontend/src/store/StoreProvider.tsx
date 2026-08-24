import React from 'react'
import { Provider } from 'react-redux'
import { store } from './index'

/**
 * Wraps the app with the Redux <Provider>.
 *
 * Place this near the root of your tree (see App.tsx) so every child
 * component can access the store via the typed hooks.
 */
export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>
}
