import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { configureStore, type EnhancedStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import authReducer from '../../features/auth/authSlice'
import themeReducer from '../../features/theme/themeSlice'
import type { RootState } from '../../store'

/**
 * Test utility: render a component inside a Redux <Provider>.
 *
 * For most tests you can use the default store. If you need to seed
 * specific state (e.g. a logged-in user or a particular theme), pass a
 * `preloadedState` object shaped like `{ theme: { theme: 'dark' } }`.
 */
interface RenderWithStoreOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: RootState
}

export function renderWithStore(
  ui: React.ReactElement,
  { preloadedState, ...renderOptions }: RenderWithStoreOptions = {}
) {
  const store: EnhancedStore = configureStore({
    reducer: { auth: authReducer, theme: themeReducer },
    preloadedState,
  })

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Provider store={store}>{children}</Provider>
  )

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}
