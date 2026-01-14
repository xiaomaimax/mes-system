/**
 * useDataService Hook - 数据服务层状态管理
 * 
 * 功能：
 * - 实现数据加载状态管理
 * - 实现错误处理
 * - 实现数据缓存机制
 * 
 * Requirements: 7.3, 7.4
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 缓存管理器 - 用于管理API响应缓存
 * Property 4: 数据缓存有效性
 */
class CacheManager {
  constructor(ttl = 5 * 60 * 1000) { // 默认缓存5分钟
    this.cache = new Map();
    this.ttl = ttl;
  }

  /**
   * 生成缓存键
   * @param {string} key - 缓存键
   * @returns {string} 生成的缓存键
   */
  _generateKey(key) {
    return typeof key === 'string' ? key : JSON.stringify(key);
  }

  /**
   * 获取缓存数据
   * @param {string|Object} key - 缓存键
   * @returns {Object|null} 缓存数据或null
   */
  get(key) {
    const cacheKey = this._generateKey(key);
    const cached = this.cache.get(cacheKey);

    if (!cached) return null;

    // 检查缓存是否过期
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  /**
   * 设置缓存数据
   * @param {string|Object} key - 缓存键
   * @param {Object} data - 缓存数据
   */
  set(key, data) {
    const cacheKey = this._generateKey(key);
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * 清除缓存
   * @param {string|Object} key - 缓存键，如果不提供则清除所有缓存
   */
  clear(key) {
    if (key) {
      const cacheKey = this._generateKey(key);
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }

  /**
   * 获取缓存大小
   * @returns {number} 缓存项数量
   */
  size() {
    return this.cache.size;
  }
}

// 全局缓存管理器实例
const globalCache = new CacheManager();

/**
 * useDataService Hook - 管理数据加载、缓存和错误处理
 * 
 * @param {Function} fetchFn - 数据获取函数，应返回Promise
 * @param {Array} dependencies - 依赖项数组，用于控制何时重新加载数据
 * @param {Object} options - 配置选项
 * @param {boolean} options.useCache - 是否使用缓存，默认true
 * @param {number} options.cacheTTL - 缓存过期时间（毫秒），默认5分钟
 * @param {string} options.cacheKey - 缓存键，如果不提供则使用fetchFn作为键
 * 
 * @returns {Object} 返回对象包含：
 *   - data: 获取的数据
 *   - loading: 是否正在加载
 *   - error: 错误信息
 *   - refetch: 手动刷新数据的函数
 *   - clearCache: 清除缓存的函数
 * 
 * Requirements: 7.3, 7.4
 * Property 7: 加载状态管理
 */
export const useDataService = (fetchFn, dependencies = [], options = {}) => {
  const {
    useCache = true,
    cacheTTL = 5 * 60 * 1000,
    cacheKey = null
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 使用 useRef 来存储 fetchFn，避免依赖项变化导致的无限循环
  const fetchFnRef = useRef(fetchFn);
  const cacheKeyRef = useRef(cacheKey || fetchFn.toString());
  const cacheManagerRef = useRef(new CacheManager(cacheTTL));

  // 当 fetchFn 改变时，更新 ref
  useEffect(() => {
    fetchFnRef.current = fetchFn;
    cacheKeyRef.current = cacheKey || fetchFn.toString();
  }, [fetchFn, cacheKey]);

  /**
   * 加载数据的核心函数
   * Requirements: 7.3, 7.4
   */
  const loadData = useCallback(async (skipCache = false) => {
    try {
      console.log('[useDataService] 开始加载数据, skipCache:', skipCache, 'cacheKey:', cacheKeyRef.current);
      setLoading(true);
      setError(null);

      // 检查缓存
      if (useCache && !skipCache) {
        const cachedData = globalCache.get(cacheKeyRef.current);
        if (cachedData) {
          console.log('[useDataService] 使用缓存数据:', cacheKeyRef.current, '数据项数:', cachedData?.items?.length);
          setData(cachedData);
          setLoading(false);
          return;
        } else {
          console.log('[useDataService] 缓存中没有数据，将从API获取');
        }
      } else {
        console.log('[useDataService] 跳过缓存，直接从API获取数据');
      }

      // 检查 fetchFn 是否存在
      if (!fetchFnRef.current || typeof fetchFnRef.current !== 'function') {
        throw new Error('数据获取函数未定义或不是有效的函数');
      }

      // 调用 fetchFn 获取数据
      console.log('[useDataService] 调用fetchFn获取数据...');
      const result = await fetchFnRef.current();
      console.log('[useDataService] fetchFn返回结果:', result);

      // 验证响应
      if (!result) {
        throw new Error('服务器无响应');
      }

      // 检查响应状态
      if (result.success === false) {
        throw new Error(result.error?.message || '数据加载失败');
      }

      // 提取数据
      const responseData = result.data || result;
      console.log('[useDataService] 提取的响应数据:', responseData, '数据项数:', responseData?.items?.length);

      // 缓存数据
      if (useCache) {
        console.log('[useDataService] 将数据缓存到:', cacheKeyRef.current);
        globalCache.set(cacheKeyRef.current, responseData);
      }

      console.log('[useDataService] 设置数据到state');
      setData(responseData);
    } catch (err) {
      console.error('[useDataService] 数据加载失败:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [useCache]);

  /**
   * 组件挂载时加载数据
   */
  useEffect(() => {
    loadData();
  }, dependencies);

  /**
   * 手动刷新数据（跳过缓存）
   */
  const refetch = useCallback(() => {
    console.log('[useDataService.refetch] 手动刷新数据，清除缓存并重新加载');
    // 先清除缓存
    globalCache.clear(cacheKeyRef.current);
    // 然后重新加载数据，跳过缓存
    return loadData(true);
  }, [loadData]);

  /**
   * 清除缓存
   */
  const clearCache = useCallback(() => {
    globalCache.clear(cacheKeyRef.current);
  }, []);

  /**
   * 清除所有缓存
   */
  const clearAllCache = useCallback(() => {
    globalCache.clear();
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    clearCache,
    clearAllCache,
    // 暴露缓存管理器供高级用户使用
    cacheManager: globalCache
  };
};

/**
 * useDataServiceWithPagination Hook - 支持分页的数据服务Hook
 * 
 * @param {Function} fetchFn - 数据获取函数，应接收 { page, pageSize } 参数
 * @param {Object} options - 配置选项
 * @param {number} options.initialPage - 初始页码，默认1
 * @param {number} options.initialPageSize - 初始每页数量，默认10
 * @param {boolean} options.useCache - 是否使用缓存，默认true
 * 
 * @returns {Object} 返回对象包含：
 *   - data: 当前页的数据
 *   - loading: 是否正在加载
 *   - error: 错误信息
 *   - pagination: 分页信息 { current, pageSize, total, totalPages }
 *   - goToPage: 跳转到指定页的函数
 *   - changePageSize: 改变每页数量的函数
 *   - refetch: 手动刷新数据的函数
 * 
 * Property 2: 分页一致性
 */
export const useDataServiceWithPagination = (fetchFn, options = {}) => {
  const {
    initialPage = 1,
    initialPageSize = 10,
    useCache = true
  } = options;

  const [pagination, setPagination] = useState({
    current: initialPage,
    pageSize: initialPageSize,
    total: 0,
    totalPages: 0
  });

  // 创建带分页参数的 fetchFn
  const paginatedFetchFn = useCallback(async () => {
    const result = await fetchFn({
      page: pagination.current,
      pageSize: pagination.pageSize
    });

    // 更新分页信息
    if (result.pagination) {
      setPagination(prev => ({
        ...prev,
        total: result.pagination.total || 0,
        totalPages: Math.ceil((result.pagination.total || 0) / pagination.pageSize)
      }));
    }

    return result;
  }, [fetchFn, pagination.current, pagination.pageSize]);

  const { data, loading, error, refetch } = useDataService(
    paginatedFetchFn,
    [pagination.current, pagination.pageSize],
    { useCache, cacheKey: `${fetchFn.toString()}_${pagination.current}_${pagination.pageSize}` }
  );

  /**
   * 跳转到指定页
   */
  const goToPage = useCallback((page) => {
    if (page < 1 || page > pagination.totalPages) {
      console.warn(`[useDataServiceWithPagination] 页码超出范围: ${page}`);
      return;
    }
    setPagination(prev => ({ ...prev, current: page }));
  }, [pagination.totalPages]);

  /**
   * 改变每页数量
   */
  const changePageSize = useCallback((pageSize) => {
    if (pageSize < 1) {
      console.warn(`[useDataServiceWithPagination] 每页数量必须大于0: ${pageSize}`);
      return;
    }
    setPagination(prev => ({
      ...prev,
      pageSize,
      current: 1, // 重置到第一页
      totalPages: Math.ceil(prev.total / pageSize)
    }));
  }, []);

  return {
    data,
    loading,
    error,
    pagination,
    goToPage,
    changePageSize,
    refetch
  };
};

export default useDataService;
