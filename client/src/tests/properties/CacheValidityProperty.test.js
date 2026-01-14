/**
 * 数据缓存有效性属性测试
 * Property 4: 数据缓存有效性
 * 
 * 验证数据缓存机制的正确性，包括：
 * - 缓存数据的有效性检查
 * - 缓存过期机制
 * - 缓存更新策略
 * - 缓存一致性保证
 * 
 * Requirements: 7.3, 10.3
 */

import { CacheManager } from '../../hooks/useDataService';
import DataService from '../../services/DataService';

// Mock axios for API calls
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios;

describe('Property 4: 数据缓存有效性', () => {
  let cacheManager;
  let dataService;

  beforeEach(() => {
    // 重置缓存管理器
    cacheManager = new CacheManager();
    dataService = new DataService();
    jest.clearAllMocks();
    
    // Mock axios responses
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: [{ id: 1, name: '测试数据' }]
      }
    });
  });

  afterEach(() => {
    // 清理缓存
    if (cacheManager) {
      cacheManager.clear();
    }
  });

  /**
   * 属性测试1: 缓存基本功能
   * 验证缓存的存储和检索功能正常工作
   */
  describe('缓存基本功能', () => {
    it('应该能够正确存储和检索缓存数据', () => {
      const key = 'test-key';
      const data = { id: 1, name: '测试数据' };

      // 存储数据到缓存
      cacheManager.set(key, data);

      // 检索缓存数据
      const cachedData = cacheManager.get(key);

      // 验证数据一致性
      expect(cachedData).toEqual(data);
      expect(cachedData).not.toBe(data); // 应该是深拷贝
    });

    it('应该正确处理不存在的缓存键', () => {
      const nonExistentKey = 'non-existent-key';
      
      // 尝试获取不存在的缓存
      const result = cacheManager.get(nonExistentKey);
      
      // 应该返回null或undefined
      expect(result).toBeNull();
    });

    it('应该能够检查缓存是否存在', () => {
      const key = 'test-key';
      const data = { id: 1, name: '测试数据' };

      // 初始状态：缓存不存在
      expect(cacheManager.has(key)).toBe(false);

      // 存储数据后：缓存存在
      cacheManager.set(key, data);
      expect(cacheManager.has(key)).toBe(true);
    });

    it('应该能够删除指定的缓存项', () => {
      const key = 'test-key';
      const data = { id: 1, name: '测试数据' };

      // 存储数据
      cacheManager.set(key, data);
      expect(cacheManager.has(key)).toBe(true);

      // 删除缓存
      cacheManager.delete(key);
      expect(cacheManager.has(key)).toBe(false);
      expect(cacheManager.get(key)).toBeNull();
    });

    it('应该能够清空所有缓存', () => {
      const keys = ['key1', 'key2', 'key3'];
      const data = { id: 1, name: '测试数据' };

      // 存储多个缓存项
      keys.forEach(key => {
        cacheManager.set(key, data);
      });

      // 验证所有缓存都存在
      keys.forEach(key => {
        expect(cacheManager.has(key)).toBe(true);
      });

      // 清空所有缓存
      cacheManager.clear();

      // 验证所有缓存都被清除
      keys.forEach(key => {
        expect(cacheManager.has(key)).toBe(false);
      });
    });
  });

  /**
   * 属性测试2: 缓存过期机制
   * 验证缓存能够正确处理过期时间
   */
  describe('缓存过期机制', () => {
    it('应该正确设置和检查缓存过期时间', () => {
      const key = 'test-key';
      const data = { id: 1, name: '测试数据' };
      const ttl = 1000; // 1秒

      // 设置带过期时间的缓存
      cacheManager.set(key, data, ttl);

      // 立即检查：缓存应该有效
      expect(cacheManager.isValid(key)).toBe(true);
      expect(cacheManager.get(key)).toEqual(data);
    });

    it('应该在缓存过期后返回无效状态', (done) => {
      const key = 'test-key';
      const data = { id: 1, name: '测试数据' };
      const ttl = 100; // 100毫秒

      // 设置短期缓存
      cacheManager.set(key, data, ttl);

      // 立即检查：缓存有效
      expect(cacheManager.isValid(key)).toBe(true);

      // 等待缓存过期
      setTimeout(() => {
        expect(cacheManager.isValid(key)).toBe(false);
        expect(cacheManager.get(key)).toBeNull();
        done();
      }, ttl + 50);
    });

    it('应该能够更新缓存的过期时间', () => {
      const key = 'test-key';
      const data = { id: 1, name: '测试数据' };
      const initialTtl = 1000;
      const newTtl = 2000;

      // 设置初始缓存
      cacheManager.set(key, data, initialTtl);
      const initialExpiry = cacheManager.getExpiry(key);

      // 更新过期时间
      cacheManager.updateTtl(key, newTtl);
      const newExpiry = cacheManager.getExpiry(key);

      // 验证过期时间已更新
      expect(newExpiry).toBeGreaterThan(initialExpiry);
    });

    it('应该自动清理过期的缓存项', (done) => {
      const key = 'test-key';
      const data = { id: 1, name: '测试数据' };
      const ttl = 100; // 100毫秒

      // 设置短期缓存
      cacheManager.set(key, data, ttl);

      // 等待缓存过期并触发清理
      setTimeout(() => {
        // 尝试访问过期缓存应该触发自动清理
        cacheManager.get(key);
        
        // 验证缓存已被清理
        expect(cacheManager.has(key)).toBe(false);
        done();
      }, ttl + 50);
    });
  });

  /**
   * 属性测试3: 缓存一致性
   * 验证缓存数据与源数据的一致性
   */
  describe('缓存一致性', () => {
    it('应该确保缓存数据与API数据一致', async () => {
      const apiData = [
        { id: 1, name: '产品A', price: 100 },
        { id: 2, name: '产品B', price: 200 }
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, data: apiData }
      });

      // 第一次调用：从API获取数据并缓存
      const result1 = await dataService.getProductionPlans();
      
      // 第二次调用：从缓存获取数据
      const result2 = await dataService.getProductionPlans();

      // 验证两次结果一致
      expect(result1).toEqual(result2);
      expect(result1).toEqual(apiData);

      // 验证第二次调用没有发起新的API请求
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('应该在数据更新后使缓存失效', async () => {
      const initialData = [{ id: 1, name: '初始数据' }];
      const updatedData = [{ id: 1, name: '更新数据' }];

      // 第一次API调用
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, data: initialData }
      });

      // 获取初始数据
      const result1 = await dataService.getProductionPlans();
      expect(result1).toEqual(initialData);

      // 模拟数据更新操作
      mockedAxios.post.mockResolvedValueOnce({
        data: { success: true, data: updatedData[0] }
      });

      // 更新数据（应该使缓存失效）
      await dataService.updateProductionPlan(1, { name: '更新数据' });

      // 第二次API调用（应该返回新数据）
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, data: updatedData }
      });

      // 再次获取数据
      const result2 = await dataService.getProductionPlans();
      expect(result2).toEqual(updatedData);

      // 验证缓存已失效，发起了新的API请求
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it('应该处理并发请求的缓存一致性', async () => {
      const apiData = [{ id: 1, name: '测试数据' }];

      mockedAxios.get.mockResolvedValue({
        data: { success: true, data: apiData }
      });

      // 同时发起多个相同的请求
      const promises = [
        dataService.getProductionPlans(),
        dataService.getProductionPlans(),
        dataService.getProductionPlans()
      ];

      const results = await Promise.all(promises);

      // 所有结果应该一致
      results.forEach(result => {
        expect(result).toEqual(apiData);
      });

      // 应该只发起一次API请求（其他请求应该等待并共享结果）
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * 属性测试4: 缓存策略
   * 验证不同的缓存策略正确工作
   */
  describe('缓存策略', () => {
    it('应该支持LRU（最近最少使用）缓存策略', () => {
      const maxSize = 3;
      const lruCache = new CacheManager({ maxSize, strategy: 'lru' });

      // 添加缓存项直到达到最大容量
      lruCache.set('key1', 'data1');
      lruCache.set('key2', 'data2');
      lruCache.set('key3', 'data3');

      // 验证所有项都存在
      expect(lruCache.has('key1')).toBe(true);
      expect(lruCache.has('key2')).toBe(true);
      expect(lruCache.has('key3')).toBe(true);

      // 访问key1（使其成为最近使用的）
      lruCache.get('key1');

      // 添加新项（应该移除最少使用的key2）
      lruCache.set('key4', 'data4');

      // 验证LRU策略生效
      expect(lruCache.has('key1')).toBe(true); // 最近访问过
      expect(lruCache.has('key2')).toBe(false); // 应该被移除
      expect(lruCache.has('key3')).toBe(true);
      expect(lruCache.has('key4')).toBe(true); // 新添加的
    });

    it('应该支持FIFO（先进先出）缓存策略', () => {
      const maxSize = 3;
      const fifoCache = new CacheManager({ maxSize, strategy: 'fifo' });

      // 按顺序添加缓存项
      fifoCache.set('key1', 'data1');
      fifoCache.set('key2', 'data2');
      fifoCache.set('key3', 'data3');

      // 添加新项（应该移除最先添加的key1）
      fifoCache.set('key4', 'data4');

      // 验证FIFO策略生效
      expect(fifoCache.has('key1')).toBe(false); // 最先添加，应该被移除
      expect(fifoCache.has('key2')).toBe(true);
      expect(fifoCache.has('key3')).toBe(true);
      expect(fifoCache.has('key4')).toBe(true);
    });

    it('应该支持基于优先级的缓存策略', () => {
      const priorityCache = new CacheManager({ strategy: 'priority' });

      // 添加不同优先级的缓存项
      priorityCache.set('low', 'data1', { priority: 1 });
      priorityCache.set('medium', 'data2', { priority: 5 });
      priorityCache.set('high', 'data3', { priority: 10 });

      // 在内存压力下，低优先级项应该首先被移除
      priorityCache.evictLowPriority();

      expect(priorityCache.has('low')).toBe(false);
      expect(priorityCache.has('medium')).toBe(true);
      expect(priorityCache.has('high')).toBe(true);
    });
  });

  /**
   * 属性测试5: 缓存性能
   * 验证缓存机制的性能特征
   */
  describe('缓存性能', () => {
    it('应该提供快速的缓存访问性能', () => {
      const cache = new CacheManager();
      const testData = { id: 1, name: '性能测试数据' };
      const key = 'performance-test';

      // 存储数据
      cache.set(key, testData);

      // 测量访问时间
      const startTime = performance.now();
      
      // 多次访问缓存
      for (let i = 0; i < 1000; i++) {
        cache.get(key);
      }
      
      const endTime = performance.now();
      const accessTime = endTime - startTime;

      // 缓存访问应该很快（小于10ms）
      expect(accessTime).toBeLessThan(10);
    });

    it('应该有效管理内存使用', () => {
      const cache = new CacheManager({ maxSize: 100 });
      
      // 添加大量数据
      for (let i = 0; i < 200; i++) {
        cache.set(`key${i}`, { id: i, data: `data${i}` });
      }

      // 验证缓存大小不超过限制
      expect(cache.size()).toBeLessThanOrEqual(100);
    });

    it('应该避免内存泄漏', () => {
      const cache = new CacheManager();
      const initialMemory = process.memoryUsage().heapUsed;

      // 添加大量数据然后清理
      for (let i = 0; i < 1000; i++) {
        cache.set(`key${i}`, { id: i, data: new Array(1000).fill('data') });
      }

      cache.clear();

      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // 内存增长应该在合理范围内
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // 小于1MB
    });
  });

  /**
   * 属性测试6: 缓存错误处理
   * 验证缓存机制正确处理各种错误情况
   */
  describe('缓存错误处理', () => {
    it('应该处理序列化错误', () => {
      const cache = new CacheManager();
      
      // 创建包含循环引用的对象
      const circularObj = { name: 'test' };
      circularObj.self = circularObj;

      // 尝试缓存循环引用对象
      expect(() => {
        cache.set('circular', circularObj);
      }).not.toThrow();

      // 应该能够处理或跳过有问题的数据
      const result = cache.get('circular');
      expect(result).toBeDefined();
    });

    it('应该处理存储空间不足的情况', () => {
      const cache = new CacheManager({ maxSize: 1 });

      // 尝试存储超出容量的数据
      cache.set('key1', 'data1');
      cache.set('key2', 'data2');
      cache.set('key3', 'data3');

      // 应该优雅地处理容量限制
      expect(cache.size()).toBeLessThanOrEqual(1);
    });

    it('应该处理无效的缓存键', () => {
      const cache = new CacheManager();

      // 测试各种无效键
      const invalidKeys = [null, undefined, '', 0, false, {}];

      invalidKeys.forEach(key => {
        expect(() => {
          cache.set(key, 'data');
        }).not.toThrow();

        expect(() => {
          cache.get(key);
        }).not.toThrow();
      });
    });

    it('应该在缓存损坏时提供降级方案', async () => {
      const cache = new CacheManager();
      
      // 模拟缓存损坏
      cache.set('corrupted', 'valid-data');
      
      // 手动损坏缓存数据
      if (cache._storage) {
        cache._storage.set('corrupted', 'invalid-json-data');
      }

      // 应该能够检测并处理损坏的缓存
      const result = cache.get('corrupted');
      
      // 应该返回null或默认值，而不是抛出错误
      expect(result).toBeNull();
    });
  });

  /**
   * 属性测试7: 缓存配置和定制
   * 验证缓存可以根据不同需求进行配置
   */
  describe('缓存配置和定制', () => {
    it('应该支持自定义缓存键生成策略', () => {
      const customKeyGenerator = (params) => {
        return `custom_${JSON.stringify(params)}_${Date.now()}`;
      };

      const cache = new CacheManager({ keyGenerator: customKeyGenerator });
      
      const params = { module: 'production', action: 'list' };
      const key = cache.generateKey(params);

      expect(key).toMatch(/^custom_/);
      expect(key).toContain(JSON.stringify(params));
    });

    it('应该支持条件缓存', () => {
      const shouldCache = (data) => {
        // 只缓存包含有效数据的响应
        return data && Array.isArray(data) && data.length > 0;
      };

      const cache = new CacheManager({ shouldCache });

      // 有效数据应该被缓存
      const validData = [{ id: 1, name: '有效数据' }];
      cache.set('valid', validData);
      expect(cache.has('valid')).toBe(true);

      // 无效数据不应该被缓存
      const invalidData = [];
      cache.set('invalid', invalidData);
      expect(cache.has('invalid')).toBe(false);
    });

    it('应该支持缓存预热', async () => {
      const cache = new CacheManager();
      
      // 预定义需要预热的数据
      const preloadData = {
        'production-plans': [{ id: 1, name: '计划A' }],
        'equipment-list': [{ id: 1, name: '设备A' }]
      };

      // 执行缓存预热
      await cache.preload(preloadData);

      // 验证预热数据已缓存
      Object.keys(preloadData).forEach(key => {
        expect(cache.has(key)).toBe(true);
        expect(cache.get(key)).toEqual(preloadData[key]);
      });
    });
  });
});