import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Unmounts everything RTL rendered after each test -- without this, DOM
// nodes (and any timers/listeners a component set up) leak into the next
// test instead of a clean slate.
afterEach(() => {
  cleanup()
})
