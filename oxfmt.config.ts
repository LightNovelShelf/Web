import { defineConfig } from 'oxfmt'

export default defineConfig({
  $schema: './node_modules/oxfmt/configuration_schema.json',

  ignorePatterns: [
    '**/node_modules/',
    'dist/',
    '.quasar/',
    '.github/',
    'quasar.config.*.temporary.compiled*',
    'auto-imports.d.ts',
    'public/',
  ],

  printWidth: 120,
  semi: false,
  singleQuote: true,
  endOfLine: 'lf',

  // 接替原 eslint `import/order`：分组顺序与项目原有约定一致
  sortImports: {
    newlinesBetween: true,
    groups: [
      'builtin',
      'external',
      'utils',
      'stores',
      'components',
      'composition',
      ['internal', 'subpath'],
      ['parent', 'sibling', 'index'],
      'type',
      'style',
      'unknown',
    ],
    customGroups: [
      { groupName: 'utils', modifiers: ['value'], elementNamePattern: ['@/utils', '@/utils/**'] },
      { groupName: 'stores', modifiers: ['value'], elementNamePattern: ['@/stores', '@/stores/**'] },
      { groupName: 'components', modifiers: ['value'], elementNamePattern: ['@/components', '@/components/**'] },
      { groupName: 'composition', modifiers: ['value'], elementNamePattern: ['@/composition', '@/composition/**'] },
    ],
  },
})
