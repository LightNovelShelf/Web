import js from '@eslint/js'
import pluginQuasar from '@quasar/app-vite/eslint'
import prettierSkipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import importPlugin from 'eslint-plugin-import'
import pluginVue from 'eslint-plugin-vue'

export default [
  {
    /**
     * Ignore the following files.
     * Please note that pluginQuasar.configs.recommended already ignores
     * the "node_modules" folder for you (and all other Quasar project
     * relevant folders and files).
     *
     * ESLint requires "ignores" key to be the only one in this object
     */
    // ignores: []
  },

  ...pluginQuasar.configs.recommended(),
  js.configs.recommended,

  importPlugin.flatConfigs.recommended,
  {
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
  },

  /**
   * https://eslint.vuejs.org
   *
   * pluginVue.configs.base
   *   -> Settings and rules to enable correct ESLint parsing.
   * pluginVue.configs[ 'flat/essential']
   *   -> base, plus rules to prevent errors or unintended behavior.
   * pluginVue.configs["flat/strongly-recommended"]
   *   -> Above, plus rules to considerably improve code readability and/or dev experience.
   * pluginVue.configs["flat/recommended"]
   *   -> Above, plus rules to enforce subjective community defaults to ensure consistency.
   */
  ...pluginVue.configs['flat/essential'],

  // https://github.com/vuejs/eslint-config-typescript
  ...defineConfigWithVueTs(vueTsConfigs.recommended),

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    // add your custom rules here
    rules: {
      // https://eslint.org/docs/latest/rules/no-undef#handled_by_typescript
      // done by ts
      'no-undef': 'off',

      'prefer-promise-reject-errors': 'off',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // allow debugger during development only
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

      // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md
      'import/order': [
        'warn',
        {
          'newlines-between': 'always',
          groups: ['builtin', 'external', 'internal', 'type'],
          pathGroups: [
            {
              pattern: 'src/utils/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '{src/,}stores/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '{src/,}components{/,}**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '{src/,}composition{/,}**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '**/**.css',
              group: 'type',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: [],
          warnOnUnassignedImports: true,
          alphabetize: {
            order: 'asc',
            orderImportKind: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/consistent-type-specifier-style': [2, 'prefer-top-level'],

      '@typescript-eslint/no-unused-vars': 0,
      '@typescript-eslint/no-require-imports': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-namespace': 0,
      '@typescript-eslint/no-empty-object-type': 0,
      '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true }],

      'vue/multi-word-component-names': 0,
      'vue/block-lang': 0,
    },
  },

  prettierSkipFormatting,
]
