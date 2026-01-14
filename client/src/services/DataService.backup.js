/**
 * DataService - 统一的前端数据服务层
 * 
 * 功能：
 * - 提供统一的API调用接口
 * - 处理API错误和异常
 * - 支持数据缓存和刷新
 * - 提供加载状态管理
 * 
 * Requirements: 7.1, 7.2
 */

const {
  ProductionAPI,
  InventoryAPI,
  QualityAPI,
  EquipmentAPI,
  SchedulingAPI
} = require('./api');

/**
 * DataService - 统一的数据服务类
 * 
 * 提供所有模块的API调用方法，包括：
 * - 生产模块（生产计划、生产任务、工作报告）
 * - 设备模块（设备、模具、设备维护）
 * - 质量模块（质量检验、缺陷记录）
 * - 库存模块（库存、出入库记录）
 * - 报表模块（生产报表、质量报表、设备报表）
 */
class DataService {
  // ============================================================================
  // 缓存机制配置
  // ============================================================================

  /**
   * 缓存存储对象
   * @private
   */
  static _cache = new Map();

  /**
   * 缓存配置
   * @private
   */
  static _cacheConfig = {
    // 默认缓存过期时间（毫秒）
    defaultTTL: 5 * 60 * 1000, // 5分钟
    // 各模块的缓存过期时间配置
    moduleTTL: {
      production: 3 * 60 * 1000,    // 生产数据：3分钟
      equipment: 10 * 60 * 1000,    // 设备数据：10分钟
      quality: 2 * 60 * 1000,       // 质量数据：2分钟
      inventory: 1 * 60 * 1000,     // 库存数据：1分钟
      reports: 5 * 60 * 1000        // 报表数据：5分钟
    }
  };

  /**
   * 生成缓存键
   * @param {string} module - 模块名
   * @param {string} method - 方法名
   * @param {Object} params - 参数对象
   * @returns {string} 缓存键
   * @private
   */
  static _generateCacheKey(module, method, params = {}) {
    const paramStr = JSON.stringify(params, Object.keys(params).sort());
    return `${module}:${method}:${paramStr}`;
  }

  /**
   * 获取缓存数据
   * @param {string} key - 缓存键
   * @returns {Object|null} 缓存的数据或null
   * @private
   */
  static _getFromCache(key) {
    const cached = this._cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.expireAt) {
      this._cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * 设置缓存数据
   * @param {string} key - 缓存键
   * @param {Object} data - 要缓存的数据
   * @param {number} ttl - 缓存过期时间（毫秒）
   * @private
   */
  static _setToCache(key, data, ttl) {
    const expireAt = Date.now() + ttl;
    this._cache.set(key, {
      data,
      expireAt,
      createdAt: Date.now()
    });
  }

  /**
   * 清除指定模块的缓存
   * @param {string} module - 模块名
   */
  static clearModuleCache(module) {
    const keysToDelete = [];
    for (const key of this._cache.keys()) {
      if (key.startsWith(`${module}:`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this._cache.delete(key));
  }

  /**
   * 清除所有缓存
   */
  static clearAllCache() {
    this._cache.clear();
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 缓存统计
   */
  static getCacheStats() {
    const now = Date.now();
    let validCount = 0;
    let expiredCount = 0;
    const moduleStats = {};

    for (const [key, cached] of this._cache.entries()) {
      const module = key.split(':')[0];
      if (!moduleStats[module]) {
        moduleStats[module] = { valid: 0, expired: 0 };
      }

      if (now > cached.expireAt) {
        expiredCount++;
        moduleStats[module].expired++;
      } else {
        validCount++;
        moduleStats[module].valid++;
      }
    }

    return {
      total: this._cache.size,
      valid: validCount,
      expired: expiredCount,
      modules: moduleStats
    };
  }

  /**
   * 带缓存的API调用包装器
   * @param {string} module - 模块名
   * @param {string} method - 方法名
   * @param {Function} apiCall - API调用函数
   * @param {Object} params - 参数对象
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} API响应数据
   * @private
   */
  static async _cachedApiCall(module, method, apiCall, params = {}, forceRefresh = false) {
    const cacheKey = this._generateCacheKey(module, method, params);
    
    // 如果不强制刷新，先尝试从缓存获取
    if (!forceRefresh) {
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // 调用API获取数据
      const result = await apiCall();
      
      // 获取该模块的缓存过期时间
      const ttl = this._cacheConfig.moduleTTL[module] || this._cacheConfig.defaultTTL;
      
      // 缓存结果
      this._setToCache(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      // API调用失败时，如果有过期的缓存数据，可以考虑返回
      const expiredCached = this._cache.get(cacheKey);
      if (expiredCached) {
        console.warn(`[DataService] API调用失败，返回过期缓存数据: ${cacheKey}`);
        return expiredCached.data;
      }
      throw error;
    }
  }
  // ============================================================================
  // 生产模块 API 方法
  // ============================================================================

  /**
   * 获取生产计划列表
   * @param {Object} params - 查询参数 { page, pageSize, status, sort }
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 生产计划数据
   * Requirements: 2.1, 2.5, 10.3, 10.5
   */
  static async getProductionPlans(params = {}, forceRefresh = false) {
    return this._cachedApiCall('production', 'getProductionPlans', async () => {
      try {
        const response = await SchedulingAPI.getPlanOrders();
        return {
          success: true,
          data: response.data || [],
          pagination: response.pagination || { total: 0 }
        };
      } catch (error) {
        return this._handleError(error, '获取生产计划失败');
      }
    }, params, forceRefresh);
  }

  /**
   * 获取生产任务列表
   * @param {Object} params - 查询参数 { page, pageSize, status, sort }
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 生产任务数据
   * Requirements: 2.2, 2.5, 10.3, 10.5
   */
  static async getProductionTasks(params = {}, forceRefresh = false) {
    return this._cachedApiCall('production', 'getProductionTasks', async () => {
      try {
        const response = await SchedulingAPI.getProductionTasks(params);
        return {
          success: true,
          data: response.data || [],
          pagination: response.pagination || { total: 0 }
        };
      } catch (error) {
        return this._handleError(error, '获取生产任务失败');
      }
    }, params, forceRefresh);
  }

  /**
   * 获取工作报告列表
   * @param {Object} params - 查询参数 { page, pageSize, status, sort }
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 工作报告数据
   * Requirements: 2.3, 2.5, 10.3, 10.5
   */
  static async getWorkReports(params = {}, forceRefresh = false) {
    return this._cachedApiCall('production', 'getWorkReports', async () => {
      try {
        const response = await ProductionAPI.getDailyProductionReport(params);
        return {
          success: true,
          data: response.data || [],
          pagination: response.pagination || { total: 0 }
        };
      } catch (error) {
        return this._handleError(error, '获取工作报告失败');
      }
    }, params, forceRefresh);
  }

  // ============================================================================
  // 设备模块 API 方法
  // ============================================================================

  /**
   * 获取设备列表
   * @param {Object} params - 查询参数 { page, pageSize, status, sort }
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 设备数据
   * Requirements: 3.1, 3.5, 10.3, 10.5
   */
  static async getEquipment(params = {}, forceRefresh = false) {
    return this._cachedApiCall('equipment', 'getEquipment', async () => {
      try {
        const response = await SchedulingAPI.getDevices();
        return {
          success: true,
          data: response.data || [],
          pagination: response.pagination || { total: 0 }
        };
      } catch (error) {
        return this._handleError(error, '获取设备列表失败');
      }
    }, params, forceRefresh);
  }

  /**
   * 获取模具列表
   * @param {Object} params - 查询参数 { page, pageSize, status, sort }
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 模具数据
   * Requirements: 3.2, 3.5, 10.3, 10.5
   */
  static async getMolds(params = {}, forceRefresh = false) {
    return this._cachedApiCall('equipment', 'getMolds', async () => {
      try {
        const response = await SchedulingAPI.getMolds();
        return {
          success: true,
          data: response.data || [],
          pagination: response.pagination || { total: 0 }
        };
      } catch (error) {
        return this._handleError(error, '获取模具列表失败');
      }
    }, params, forceRefresh);
  }

  /**
   * 获取设备维护记录列表
   * @param {Object} params - 查询参数 { page, pageSize, status, sort }
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 设备维护数据
   * Requirements: 3.3, 3.5, 10.3, 10.5
   */
  static async getEquipmentMaintenance(params = {}, forceRefresh = false) {
    return this._cachedApiCall('equipment', 'getEquipmentMaintenance', async () => {
      try {
        const response = await EquipmentAPI.getEquipmentMaintenance(params);
        return {
          success: true,
          data: response.data || [],
          pagination: response.pagination || { total: 0 }
        };
      } catch (error) {
        return this._handleError(error, '获取设备维护记录失败');
      }
    }, params, forceRefresh);
  }

  // ============================================================================
  // 质量模块 API 方法
  // ============================================================================

  /**
   * 获取质量检验列表
   * @param {Object} params - 查询参数 { page, pageSize, status, sort }
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 质量检验数据
   * Requirements: 4.1, 4.5, 10.3, 10.5
   */
  static async getQualityInspections(params = {}, forceRefresh = false) {
    return this._cachedApiCall('quality', 'getQualityInspections', async () => {
      try {
        const response = await QualityAPI.getQualityInspections(params);
        return {
          success: true,
          data: response.data || [],
          pagination: response.pagination || { total: 0 }
        };
      } catch (error) {
        return this._handleError(error, '获取质量检验数据失败');
      }
    }, params, forceRefresh);
  }

  /**
   * 获取缺陷记录列表
   * @param {Object} params - 查询参数 { page, pageSize, status, sort }
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 缺陷记录数据
   * Requirements: 4.2, 4.5, 10.3, 10.5
   */
  static async getDefectRecords(params = {}, forceRefresh = false) {
    return this._cachedApiCall('quality', 'getDefectRecords', async () => {
      try {
        const response = await QualityAPI.getDefectRecords(params);
        return {
          success: true,
          data: response.data || [],
          pagination: response.pagination || { total: 0 }
        };
      } catch (error) {
        return this._handleError(error, '获取缺陷记录失败');
      }
    }, params, forceRefresh);
  }

  /**
   * 获取检验标准列表
   * @param {Object} params - 查询参数 { page, pageSize, status, sort }
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 检验标准数据
   * Requirements: 4.3, 4.5, 10.3, 10.5
   */
  static async getInspectionStandards(params = {}, forceRefresh = false) {
    return this._cachedApiCall('quality', 'getInspectionStandards', async () => {
      try {
        const response = await QualityAPI.getInspectionStandards();
        return {
          success: true,
          data: response.data || [],
          pagination: response.pagination || { total: 0 }
        };
      } catch (error) {
        return this._handleError(error, '获取检验标准失败');
      }
    }, params, forceRefresh);
  }

  // ============================================================================
  // 库存模块 API 方法
  // ============================================================================

  /**
   * 获取库存列表
   * @param {Object} params - 查询参数 { page, pageSize, status, sort }
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 库存数据
   * Requirements: 5.1, 5.5, 10.3, 10.5
   */
  static async getInventory(params = {}, forceRefresh = false) {
    return this._cachedApiCall('inventory', 'getInventory', async () => {
      try {
        const response = await InventoryAPI.getInventory(params);
        return {
          success: true,
          data: response.data || [],
          pagination: response.pagination || { total: 0 }
        };
      } catch (error) {
        return this._handleError(error, '获取库存数据失败');
      }
    }, params, forceRefresh);
  }

  /**
   * 获取出入库记录列表
   * @param {Object} params - 查询参数 { page, pageSize, status, sort }
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 出入库记录数据
   * Requirements: 5.2, 5.5, 10.3, 10.5
   */
  static async getInventoryTransactions(params = {}, forceRefresh = false) {
    return this._cachedApiCall('inventory', 'getInventoryTransactions', async () => {
      try {
        const response = await InventoryAPI.getInventoryTransactions(params);
        return {
          success: true,
          data: response.data || [],
          pagination: response.pagination || { total: 0 }
        };
      } catch (error) {
        return this._handleError(error, '获取出入库记录失败');
      }
    }, params, forceRefresh);
  }

  /**
   * 获取库位管理数据
   * @param {Object} params - 查询参数 { page, pageSize, status, sort }
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 库位数据
   * Requirements: 5.3, 5.5, 10.3, 10.5
   */
  static async getLocationManagement(params = {}, forceRefresh = false) {
    return this._cachedApiCall('inventory', 'getLocationManagement', async () => {
      try {
        const response = await InventoryAPI.getInventory(params);
        return {
          success: true,
          data: response.data || [],
          pagination: response.pagination || { total: 0 }
        };
      } catch (error) {
        return this._handleError(error, '获取库位数据失败');
      }
    }, params, forceRefresh);
  }

  // ============================================================================
  // 报表模块 API 方法
  // ============================================================================

  /**
   * 获取生产报表数据
   * @param {Object} params - 查询参数 { page, pageSize, status, sort }
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 生产报表数据
   * Requirements: 6.2, 6.5, 10.3, 10.5
   */
  static async getProductionReports(params = {}, forceRefresh = false) {
    return this._cachedApiCall('reports', 'getProductionReports', async () => {
      try {
        const response = await ProductionAPI.getDailyProductionReport(params);
        return {
          success: true,
          data: response.data || [],
          pagination: response.pagination || { total: 0 }
        };
      } catch (error) {
        return this._handleError(error, '获取生产报表失败');
      }
    }, params, forceRefresh);
  }

  /**
   * 获取质量报表数据
   * @param {Object} params - 查询参数 { page, pageSize, status, sort }
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 质量报表数据
   * Requirements: 6.3, 6.5, 10.3, 10.5
   */
  static async getQualityReports(params = {}, forceRefresh = false) {
    return this._cachedApiCall('reports', 'getQualityReports', async () => {
      try {
        const response = await QualityAPI.getDefectRecords(params);
        return {
          success: true,
          data: response.data || [],
          pagination: response.pagination || { total: 0 }
        };
      } catch (error) {
        return this._handleError(error, '获取质量报表失败');
      }
    }, params, forceRefresh);
  }

  /**
   * 获取设备报表数据
   * @param {Object} params - 查询参数 { page, pageSize, status, sort }
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 设备报表数据
   * Requirements: 6.4, 6.5, 10.3, 10.5
   */
  static async getEquipmentReports(params = {}, forceRefresh = false) {
    return this._cachedApiCall('reports', 'getEquipmentReports', async () => {
      try {
        const response = await EquipmentAPI.getEquipmentMaintenance(params);
        return {
          success: true,
          data: response.data || [],
          pagination: response.pagination || { total: 0 }
        };
      } catch (error) {
        return this._handleError(error, '获取设备报表失败');
      }
    }, params, forceRefresh);
  }

  // ============================================================================
  // 辅助方法
  // ============================================================================

  /**
   * 统一的错误处理方法
   * @param {Error} error - 错误对象
   * @param {string} defaultMessage - 默认错误消息
   * @returns {Object} 错误响应对象
   * Requirements: 2.6, 3.6, 4.6, 5.6, 6.6
   */
  static _handleError(error, defaultMessage = '数据加载失败') {
    console.error(`[DataService] ${defaultMessage}:`, error);
    
    return {
      success: false,
      error: {
        code: error.status || 'UNKNOWN_ERROR',
        message: error.message || defaultMessage
      },
      data: null
    };
  }

  /**
   * 验证API响应数据的完整性
   * @param {Object} data - 响应数据
   * @param {Array<string>} requiredFields - 必需字段列表
   * @returns {boolean} 数据是否完整
   * Property 1: API数据完整性
   */
  static validateDataIntegrity(data, requiredFields = []) {
    if (!data) return false;
    
    if (Array.isArray(data)) {
      return data.every(item => 
        requiredFields.every(field => field in item)
      );
    }
    
    return requiredFields.every(field => field in data);
  }

  /**
   * 验证分页信息的一致性
   * @param {Object} pagination - 分页信息
   * @param {Array} items - 数据项
   * @returns {boolean} 分页信息是否一致
   * Property 2: 分页一致性
   */
  static validatePaginationConsistency(pagination, items = []) {
    if (!pagination) return true;
    
    const { page, pageSize, total } = pagination;
    
    // 验证分页参数的有效性
    if (page < 1 || pageSize < 1) return false;
    
    // 验证当前页的数据数量
    const expectedMaxItems = pageSize;
    const isLastPage = page * pageSize >= total;
    
    if (isLastPage) {
      const expectedItems = total - (page - 1) * pageSize;
      return items.length <= expectedItems;
    }
    
    return items.length <= expectedMaxItems;
  }

  /**
   * 验证数据缓存的有效性
   * @param {string} cacheKey - 缓存键
   * @param {Object} expectedData - 期望的数据
   * @returns {boolean} 缓存是否有效
   * Property 4: 数据缓存有效性
   * Requirements: 7.3, 10.3
   */
  static validateCacheEffectiveness(cacheKey, expectedData) {
    const cached = this._getFromCache(cacheKey);
    if (!cached) return false;
    
    // 简单的数据一致性检查
    if (JSON.stringify(cached) === JSON.stringify(expectedData)) {
      return true;
    }
    
    return false;
  }
}

module.exports = DataService;
