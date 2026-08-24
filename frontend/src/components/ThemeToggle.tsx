import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { toggleTheme } from '../features/theme/themeSlice'

/**
 * Accessible light/dark theme toggle button.
 * Uses an aria-pressed label so screen readers announce the current state.
 */
export const ThemeToggle: React.FC = () => {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.theme.theme)
  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="btn btn-secondary btn-sm"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-pressed={!isDark}
      style={{ padding: '8px' }}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
