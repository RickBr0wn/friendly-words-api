import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier/recommended'

export default tseslint.config(
  { ignores: ['node_modules/**', 'data/**'] },
  ...tseslint.configs.recommended,
  prettierConfig,
  prettierPlugin,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  }
)
