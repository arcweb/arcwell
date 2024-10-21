import { configApp } from '@adonisjs/eslint-config'
import prettier from 'eslint-plugin-prettier'

export default configApp({
  name: 'Custom config',
  // files: INCLUDE_LIST,
  ignores: ['**/index.html'],
  plugins: { prettier: prettier },
  rules: {
    // ESLint rules go here
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
})
