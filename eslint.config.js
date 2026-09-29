import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const unusedArgsPattern = '^_'

export default defineConfig([
  globalIgnores([
    '**/dist/**',
    '**/.next/**',
    '**/.next-e2e/**',
    '**/node_modules/**',
    '**/generated/**',
    '**/next-env.d.ts',
    'apps/preview/public/**',
    'sources/**',
    'playwright-report/**',
    'test-results/**',
    '.data/**',
    '.claude/**',
  ]),
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: { ...globals.node, ...globals.browser },
      sourceType: 'module',
    },
  },
  {
    files: [
      'apps/*/src/**/*.{ts,tsx}',
      'apps/*/test/**/*.{ts,tsx}',
      'apps/*/scripts/**/*.ts',
      'apps/*/*.config.ts',
      'packages/*/src/**/*.{ts,tsx}',
      'packages/*/test/**/*.{ts,tsx}',
      'packages/*/scripts/**/*.ts',
      'e2e/**/*.ts',
    ],
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      '@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: false, ignoreRestArgs: false }],
      '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true, ignoreIIFE: false }],
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: unusedArgsPattern,
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: unusedArgsPattern,
          destructuredArrayIgnorePattern: unusedArgsPattern,
          ignoreRestSiblings: true,
          varsIgnorePattern: unusedArgsPattern,
        },
      ],
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      'default-case-last': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': 'off',
      'no-empty': ['error', { allowEmptyCatch: false }],
      'no-implicit-coercion': 'error',
      'no-lonely-if': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSAsExpression > TSAsExpression',
          message:
            'Avoid double type assertions such as `value as unknown as Target`; validate or narrow at the boundary instead.',
        },
        {
          selector: 'TSTypeReference[typeName.name="Record"] TSTypeReference[typeName.name="any"]',
          message: 'Use a precise value type instead of Record<string, any>.',
        },
      ],
      'no-unsafe-finally': 'error',
      'no-useless-assignment': 'error',
      'no-useless-catch': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-const': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/test/**/*.{ts,tsx}', 'e2e/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      'no-restricted-syntax': 'off',
    },
  },
])
