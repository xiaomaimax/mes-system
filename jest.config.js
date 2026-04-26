module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  // 只测试后端 server/ 目录，前端 React 测试需要额外配置
  testPathIgnorePatterns: [
    '/node_modules/',
    '/client/',       // 前端 React 测试需要 Babel/JSDOM，另行处理
  ],
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/app.js',
    '!server/config/**',
    '!node_modules/**'
  ],
  testTimeout: 30000,
  verbose: true
};
