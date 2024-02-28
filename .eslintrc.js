module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    'jest/globals': true,
    webextensions: true,
  },
  extends: ['eslint:recommended', 'plugin:jest/recommended', 'prettier'],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  ignorePatterns: ['dist/', 'node_modules/'],
  rules: {
    complexity: ['error', 10],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'prefer-promise-reject-errors': 'error',
    'no-await-in-loop': 'error',
    'no-unused-vars': 'warn',
  },
};
