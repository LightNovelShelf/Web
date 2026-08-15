import { defineConfig } from 'oxlint'

export default defineConfig({
  $schema: './node_modules/oxlint/configuration_schema.json',

  ignorePatterns: ['**/node_modules/', 'dist/', 'quasar.config.*.temporary.compiled*', '.quasar/', 'public/'],

  options: {
    // 类型感知规则；类型检查本身交给 `pnpm typecheck`（vue-tsc）
    typeAware: true,
    typeCheck: false,
  },
  plugins: ['typescript', 'vue', 'import', 'eslint', 'promise', 'unicorn'],

  categories: {
    correctness: 'error',
  },

  rules: {
    'no-console': 'warn',
    'no-debugger': 'error',

    // 项目风格：类型导入统一用顶层 `import type`
    'typescript/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],

    // 大量 UI 代码里存在有意的占位参数
    'no-unused-vars': 'off',
    'typescript/no-unused-vars': 'off',
  },

  env: {
    builtin: true,
    browser: true,
  },

  overrides: [
    {
      files: ['src-pwa/sw/**/*.ts'],
      env: {
        serviceworker: true,
      },
    },
  ],
})
