import js from '@eslint/js';
import globals from 'globals';
import litA11y from 'eslint-plugin-lit-a11y';
import tseslint from 'typescript-eslint';

export default [js.configs.recommended, {
  languageOptions: {
    ecmaVersion: 2024,
    sourceType: 'module',
    globals: {
      ...globals.browser,
      ...globals.es2024,
    },
  },
  plugins: {
    'lit-a11y': litA11y,
  },
  rules: {
    // Code quality
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',

    // Style consistency
    eqeqeq: ['error', 'always'],
    curly: ['error', 'multi-line'],
    'no-throw-literal': 'error',

    // Web Components best practices
    'no-implicit-globals': 'error',

    // Accessibility (DigiToegankelijk / WCAG 2.1 AA)
    // All 26 lit-a11y rules enabled for comprehensive accessibility linting
    'lit-a11y/accessible-name': 'error',
    'lit-a11y/alt-text': 'error',
    'lit-a11y/anchor-is-valid': 'error',
    'lit-a11y/aria-activedescendant-has-tabindex': 'error',
    'lit-a11y/aria-attr-valid-value': 'error',
    'lit-a11y/aria-attrs': 'error',
    'lit-a11y/aria-role': 'error',
    'lit-a11y/aria-unsupported-elements': 'error',
    'lit-a11y/autocomplete-valid': 'error',
    'lit-a11y/click-events-have-key-events': 'error',
    'lit-a11y/definition-list': 'error',
    'lit-a11y/heading-hidden': 'error',
    'lit-a11y/iframe-title': 'error',
    'lit-a11y/img-redundant-alt': 'error',
    'lit-a11y/list': 'error',
    'lit-a11y/mouse-events-have-key-events': 'error',
    'lit-a11y/no-access-key': 'error',
    'lit-a11y/no-aria-slot': 'error',
    'lit-a11y/no-autofocus': 'warn',
    'lit-a11y/no-distracting-elements': 'error',
    'lit-a11y/no-redundant-role': 'error',
    'lit-a11y/obj-alt': 'error',
    'lit-a11y/role-has-required-aria-attrs': 'error',
    'lit-a11y/role-supports-aria-attr': 'error',
    'lit-a11y/scope': 'error',
    'lit-a11y/tabindex-no-positive': 'error',
    'lit-a11y/valid-lang': 'error',
  },
}, {
  files: ['**/*.ts'],
  languageOptions: {
    parser: tseslint.parser,
  },
  plugins: {
    '@typescript-eslint': tseslint.plugin,
  },
  rules: {
    'no-undef': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
}, {
  // Ignore patterns
  ignores: [
    'dist/**',
    'node_modules/**',
    'site-dist/**',
    'site/.generated/**',
    '.claude/**',
    'scripts/**',
    '*.config.js',
  ],
}];
