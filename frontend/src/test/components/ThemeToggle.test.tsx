import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '../../components/ThemeToggle'

// Mock the ThemeContext
vi.mock('../../context/ThemeContext', () => ({
  useTheme: vi.fn(),
}))

import { useTheme } from '../../context/ThemeContext'

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a Sun icon when in dark mode', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      toggleTheme: vi.fn(),
      setTheme: vi.fn(),
    })

    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', 'Switch to Light Mode')
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('renders a Moon icon when in light mode', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      toggleTheme: vi.fn(),
      setTheme: vi.fn(),
    })

    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Switch to Dark Mode')
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls toggleTheme when clicked', () => {
    const toggleTheme = vi.fn()
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      toggleTheme,
      setTheme: vi.fn(),
    })

    render(<ThemeToggle />)

    fireEvent.click(screen.getByRole('button'))
    expect(toggleTheme).toHaveBeenCalledTimes(1)
  })
})
