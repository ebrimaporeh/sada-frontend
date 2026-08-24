import { mergeConfig } from 'vite'
import { defineConfig as defineVitestConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

// Separate from vite.config.js on purpose -- merges in the same plugins/
// alias so tests resolve `@/...` imports identically to the real app, but
// keeps the production build config untouched by test-only settings.
export default mergeConfig(
  viteConfig,
  defineVitestConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.js'],
      css: true,
    },
  }),
)
