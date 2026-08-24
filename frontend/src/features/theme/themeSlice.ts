import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type Theme = 'light' | 'dark'

/**
 * Determine the initial theme:
 * 1. If the user previously chose a theme, use it.
 * 2. Otherwise, follow the OS-level preference (prefers-color-scheme).
 * 3. Default to dark (the project's original theme).
 */
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'

  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light'
  }

  return 'dark'
}

interface ThemeState {
  theme: Theme
}

export type { ThemeState }

const initialState: ThemeState = {
  theme: getInitialTheme(),
}

/**
 * Theme slice — owns the current `theme` value.
 *
 * Side-effects (writing to localStorage, setting the `data-theme` attribute
 * on <html>, and syncing across browser tabs) are handled by the
 * <ThemeEffect /> component so the reducer stays pure.
 */
const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer
