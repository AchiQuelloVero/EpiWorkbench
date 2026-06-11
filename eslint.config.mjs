import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['out/**', 'dist/**', 'node_modules/**', '*.tsbuildinfo'] },
  ...tseslint.configs.recommended,
  prettier
)
