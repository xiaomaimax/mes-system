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
    'client/build/',
    'client/src/setupProxy.js',
    'coverage/',
    'dist/',
    '.git/',
    'backups/',
    'reports/',
    'test-results/',
    '*.test.js',  // 测试文件已内置 jest:true
  ],
};
