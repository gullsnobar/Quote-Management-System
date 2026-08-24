import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { renderHook, act } from '@testing-library/react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { toggleTheme, setTheme } from '../../features/theme/themeSlice'
import themeReducer from '../../features/theme/themeSlice'

/**
 * Create a test store with just the theme slice.
 * We use the reducer directly so we can test it in isolation.
 */
function createTestStore() {
  return configureStore({
    reducer: { theme: themeReducer },
  })
}

/**
 * Render the typed hooks inside a <Provider> so we can exercise the
 * slice via dispatch + selector just like a real component would.
 */
function renderThemeHook() {
  const store = createTestStore()
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  const { result } = renderHook(
    () => {
      const dispatch = useAppDispatch()
      const theme = useAppSelector((state) => state.theme.theme)
      return { dispatch, theme }
    },
    { wrapper }
  )
  return { store, result }
}

describe('themeSlice', () => {
  const originalMatchMedia = window.matchMedia

  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme')

    const store: Record<string, string> = {}
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => store[key] ?? null)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      store[key] = value
    })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
      delete store[key]
    })

    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }) as any
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    vi.restoreAllMocks()
  })

  it('defaults to dark theme when no stored preference exists', () => {
    const { result } = renderThemeHook()
    expect(result.current.theme).toBe('dark')
  })

  it('toggles from dark to light', () => {
    const { result } = renderThemeHook()
    act(() => {
      result.current.dispatch(toggleTheme())
    })
    expect(result.current.theme).toBe('light')
  })

  it('toggles back from light to dark', () => {
    const { result } = renderThemeHook()
    act(() => {
      result.current.dispatch(toggleTheme())
    })
    act(() => {
      result.current.dispatch(toggleTheme())
    })
    expect(result.current.theme).toBe('dark')
  })

  it('sets theme explicitly via setTheme', () => {
    const { result } = renderThemeHook()
    act(() => {
      result.current.dispatch(setTheme('light'))
    })
    expect(result.current.theme).toBe('light')
  })
})
