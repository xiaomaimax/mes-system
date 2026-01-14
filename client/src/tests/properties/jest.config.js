/**
 * Jest配置文件 - 属性测试专用
 * 
 * 为属性测试提供专门的Jest配置，确保测试环境正确设置
 */

module.exports = {
  // 根目录
  rootDir: '../../../',
  
  // 属性测试专用配置
  displayName: 'Property Tests',
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/src/tests/properties/**/*.test.js'
  ],
  
  // 设置测试环境
  testEnvironment: 'jsdom',
  
  // 设置文件
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.js',
    '<rootDir>/src/tests/properties/setup.js'
  ],
  
  // 模块名称映射（正确的属性名）
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  
  // 覆盖率配置
  collectCoverageFrom: [
    'src/components/**/*.{js,jsx}',
    'src/hooks/**/*.{js,jsx}',
    'src/services/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/tests/**/*'
  ],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // 测试超时时间
  testTimeout: 30000,
  
  // 详细输出
  verbose: true,
  
  // 并行运行测试
  maxWorkers: '50%',
  
  // 缓存配置
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest-properties',
  
  // 转换配置
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // 忽略转换的模块
  transformIgnorePatterns: [
    'node_modules/(?!(antd|@ant-design|rc-.+|@babel/runtime)/)'
  ],
  
  // 模拟配置
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};