import antfu from '@antfu/eslint-config'

export default antfu(
  {
    vue: true,
    typescript: true,
    formatters: true,
    ignores: [
      'src/plugins/iconify/*.js',
      'node_modules',
      'dist',
      '*.d.ts',
      'vendor',
      '*.json',
      'eslint.config.js', // Ignore config file itself
    ],
  },
  // Disable TypeScript rules for JS files (including config files)
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    rules: {
      'ts/consistent-type-definitions': 'off',
      'ts/consistent-type-imports': 'off',
    },
  },
  {
    files: ['**/*.vue', '**/*.ts'],
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

      // Vue specific rules
      'vue/first-attribute-linebreak': [
        'error',
        {
          singleline: 'beside',
          multiline: 'below',
        },
      ],
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: 5,
          multiline: 1,
        },
      ],
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/require-default-prop': 'off',
      'vue/require-explicit-emits': 'off',
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always',
            normal: 'always',
            component: 'always',
          },
          svg: 'always',
          math: 'always',
        },
      ],

      // TypeScript rules (only for TS files)
      'ts/consistent-type-definitions': ['error', 'interface'],
      'ts/consistent-type-imports': 'error',

      // Disable some rules from @antfu/eslint-config
      'antfu/no-top-level-await': 'off',
      'antfu/if-newline': 'off',

      // SonarJS rules (reduced cognitive complexity)
      'sonarjs/cognitive-complexity': 'off',

      // Unicorn rules adjustments
      'unicorn/filename-case': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-top-level-await': 'off',

      // Promise rules
      'promise/always-return': 'off',
      'promise/catch-or-return': 'off',
    },
  },
)
