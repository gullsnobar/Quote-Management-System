import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '../../components/ThemeToggle'
import { renderWithStore } from '../utils/renderWithStore'
import type { RootState } from '../../store'

/** Helper: build a full preloaded state with just the theme customized. */
function withTheme(theme: 'light' | 'dark'): RootState {
  return {
    auth: {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    },
    theme: { theme },
  }
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a Sun icon when in dark mode', () => {
    renderWithStore(<ThemeToggle />, {
      preloadedState: withTheme('dark'),
    })

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', 'Switch to Light Mode')
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('renders a Moon icon when in light mode', () => {
    renderWithStore(<ThemeToggle />, {
      preloadedState: withTheme('light'),
    })

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Switch to Dark Mode')
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('dispatches toggleTheme when clicked', () => {
    const { store } = renderWithStore(<ThemeToggle />, {
      preloadedState: withTheme('dark'),
    })

    fireEvent.click(screen.getByRole('button'))

    // The store should now reflect the toggled theme
    expect(store.getState().theme.theme).toBe('light')
  })
})
