import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Clean up after each test to avoid leaking DOM state between tests
afterEach(() => {
  cleanup()
})
