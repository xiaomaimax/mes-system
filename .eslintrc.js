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
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
    'no-process-exit': 'off',
  },
  // 忽略不需要检查的目录
  ignorePatterns: [
    'node_modules/',
    'client/',         // 整个 client 目录由其自己的 .eslintrc.json 管理
    'client/build/',
    'client/src/setupProxy.js',
    'coverage/',
    'dist/',
    '.git/',
    'backups/',
    'reports/',
    'test-results/',
    '*.test.js',
  ],
};
