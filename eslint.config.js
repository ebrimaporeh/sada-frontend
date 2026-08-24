import js from '@eslint/js'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

// Standard Vite + React 19 flat config -- this file didn't exist at all
// before (ESLint 9 requires it; `npm run lint` was failing outright with
// "couldn't find eslint.config.js"), so this establishes the baseline
// rather than tightening an existing one.
export default [
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // React 19 + the new JSX transform (Vite's @vitejs/plugin-react) --
      // no `import React` needed to use JSX, and prop-types aren't used
      // anywhere in this codebase.
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // Flags literal apostrophes/quotes in JSX text ("don't", "it's") and
      // demands &apos;/&rsquo; instead -- purely cosmetic, no functional or
      // security bearing (React escapes JSX text content regardless), and
      // this codebase's prose-heavy copy uses plain apostrophes throughout.
      'react/no-unescaped-entities': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // src/utils/storage.js deliberately no-ops on a failed localStorage
      // read/write (private browsing, quota exceeded) rather than
      // crashing -- that's an intentional empty catch, not a bug.
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
    settings: {
      react: { version: 'detect' },
    },
  },
]
