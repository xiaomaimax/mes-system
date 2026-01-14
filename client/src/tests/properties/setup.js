/**
 * 属性测试设置文件
 * 
 * 为属性测试提供通用的设置和工具函数
 */

import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// 配置Testing Library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
  computedStyleSupportsPseudoElements: true
});

// 全局测试工具
global.testUtils = {
  /**
   * 等待指定时间
   * @param {number} ms 毫秒数
   */
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  /**
   * 创建模拟数据
   * @param {string} type 数据类型
   * @param {number} count 数据数量
   */
  createMockData: (type, count = 1) => {
    const generators = {
      production: (index) => ({
        id: index,
        plan_number: `PLAN-${String(index).padStart(3, '0')}`,
        product_name: `产品${index}`,
        planned_quantity: index * 100,
        status: ['active', 'pending', 'completed'][index % 3],
        start_date: new Date(2024, 0, index).toISOString(),
        end_date: new Date(2024, 0, index + 30).toISOString()
      }),
      
      equipment: (index) => ({
        id: index,
        equipment_code: `EQ-${String(index).padStart(3, '0')}`,
        equipment_name: `设备${index}`,
        status: ['running', 'maintenance', 'idle'][index % 3],
        location: `车间${String.fromCharCode(65 + (index % 3))}`,
        specifications: `规格${index}`
      }),
      
      quality: (index) => ({
        id: index,
        inspection_type: ['IQC', 'PQC', 'OQC'][index % 3],
        batch_number: `BATCH-${String(index).padStart(3, '0')}`,
        inspected_quantity: index * 50,
        qualified_quantity: index * 48,
        defect_rate: ((index * 2) % 10),
        inspector: `检验员${index}`
      }),
      
      inventory: (index) => ({
        id: index,
        material_id: index,
        material_name: `物料${index}`,
        current_stock: index * 100,
        min_stock: index * 10,
        max_stock: index * 500,
        unit: '个',
        warehouse_location: `A-${String(index).padStart(2, '0')}-01`
      })
    };
    
    const generator = generators[type];
    if (!generator) {
      throw new Error(`未知的数据类型: ${type}`);
    }
    
    return Array.from({ length: count }, (_, index) => generator(index + 1));
  },
  
  /**
   * 创建模拟的useDataService返回值
   * @param {Object} options 选项
   */
  createMockUseDataService: (options = {}) => {
    const {
      data = null,
      loading = false,
      error = null,
      refetch = jest.fn()
    } = options;
    
    return {
      data,
      loading,
      error,
      refetch
    };
  },
  
  /**
   * 验证组件是否正确显示加载状态
   * @param {Object} screen Testing Library的screen对象
   */
  expectLoadingState: (screen) => {
    expect(screen.getByLabelText('loading')).toBeInTheDocument();
  },
  
  /**
   * 验证组件是否正确显示错误状态
   * @param {Object} screen Testing Library的screen对象
   * @param {string} errorMessage 错误消息
   */
  expectErrorState: (screen, errorMessage) => {
    expect(screen.getByText('数据加载失败')).toBeInTheDocument();
    if (errorMessage) {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    }
  },
  
  /**
   * 验证组件是否正确显示空状态
   * @param {Object} screen Testing Library的screen对象
   */
  expectEmptyState: (screen) => {
    const emptyStateElements = screen.queryAllByText(/暂无|没有|无数据/);
    expect(emptyStateElements.length).toBeGreaterThan(0);
  }
};

// 模拟浏览器API
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// 模拟ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// 模拟IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// 模拟performance API
if (!global.performance) {
  global.performance = {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(() => []),
    getEntriesByType: jest.fn(() => []),
  };
}

// 控制台警告过滤
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  // 过滤掉一些已知的无害警告
  const message = args[0];
  if (
    typeof message === 'string' &&
    (
      message.includes('Warning: ReactDOM.render is deprecated') ||
      message.includes('Warning: componentWillReceiveProps has been renamed') ||
      message.includes('Warning: componentWillMount has been renamed')
    )
  ) {
    return;
  }
  originalError.call(console, ...args);
};

console.warn = (...args) => {
  // 过滤掉一些已知的无害警告
  const message = args[0];
  if (
    typeof message === 'string' &&
    (
      message.includes('deprecated') ||
      message.includes('legacy')
    )
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};

// 测试完成后恢复
afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});