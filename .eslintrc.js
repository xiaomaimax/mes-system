module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-console': 'off',
    'no-process-exit': 'off',
  },
  ignorePatterns: [
    'node_modules/',
    'client/',
    'client/build/',
    'client/node_modules/',
    'coverage/',
    'dist/',
    'build/',
    'test-results/',
    'playwright-report/',
    'backups/',
    'reports/',
    'e2e/',
    'scripts/demo-*.js',
    'scripts/test-*.js',
    'scripts/*-backup.*',
  ],
  overrides: [
    {
      files: ['scripts/**/*.js', 'e2e/**/*.js'],
      rules: { 'no-unused-vars': 'off', 'no-undef': 'off' },
    },
  ],
};
