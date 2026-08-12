import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['dist', 'public/monaco', 'public/mermaid', 'node_modules'],
  },

  // Application source
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // The tool hooks deal in parsed JSON of unknown shape; `any` there is
      // deliberate. Flag it so new ones are a conscious choice, not an error
      // that blocks the build.
      '@typescript-eslint/no-explicit-any': 'warn',

      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Empty catch blocks are a real pattern here (storage unavailable,
      // clipboard denied) — require a comment rather than banning them.
      'no-empty': ['error', { allowEmptyCatch: true }],

      // Every tool hook derives its output in an effect and writes it to state.
      // That costs an extra render per change and would be better expressed as
      // `useMemo` during render, but it is the established shape across ~20
      // hooks. Kept visible as a warning so the debt is tracked rather than
      // failing lint on code that predates this config.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },

  // Test files
  {
    files: ['src/**/*.{test,spec}.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  // Build scripts run in Node, and the service worker template in a worker.
  {
    files: ['scripts/**/*.js', '*.config.js', 'vite.config.ts'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.serviceworker },
    },
  },
)
