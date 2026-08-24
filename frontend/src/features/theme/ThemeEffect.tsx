import { useEffect } from 'react'
import { useAppSelector } from '../../store/hooks'

/**
 * Applies the theme to the document element and persists it to localStorage.
 *
 * Redux keeps the reducer pure by only storing the `theme` value; this
 * component watches that value and performs the side-effects. It also
 * listens for `storage` events so theme changes in one browser tab are
 * reflected in others.
 *
 * This component renders nothing — it's purely for effects.
 */
export const ThemeEffect: React.FC = () => {
  const theme = useAppSelector((state) => state.theme.theme)

  // Apply theme to <html> + persist to localStorage whenever it changes
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light')
    } else {
      root.removeAttribute('data-theme')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // Sync across browser tabs via the storage event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
        // Re-read from localStorage so the DOM reflects the other tab's change
        const root = document.documentElement
        if (e.newValue === 'light') {
          root.setAttribute('data-theme', 'light')
        } else {
          root.removeAttribute('data-theme')
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return null
}
