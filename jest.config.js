module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/app.js',
    '!server/config/**',
    '!node_modules/**'
  ],
  testTimeout: 30000,
  verbose: true
};
