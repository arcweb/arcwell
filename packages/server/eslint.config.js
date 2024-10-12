import { configApp } from '@adonisjs/eslint-config'
export default configApp({
  name: 'Custom config',
  // files: INCLUDE_LIST,
  ignores: ['**/index.html'],
  plugins: {
    // ESLint plugins go here
  },
  rules: {
    // ESLint rules go here
  },
})
