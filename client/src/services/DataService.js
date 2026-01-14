/**
 * DataService - 统一的前端数据服务层 (Fixed Version)
 * 
 * 功能：
 * - 提供统一的API调用接口
 * - 处理API错误和异常
 * - 支持数据缓存和刷新
 * - 提供加载状态管理
 * - 在API不可用时提供mock数据fallback
 * - 支持数据持久化存储
 * 
 * Requirements: 7.1, 7.2, 1.1, 1.2
 */

// 导入常量定义
import { 
  STATUS_CONSTANTS, 
  PRIORITY_CONSTANTS
} from '../data/mockData.js';

// 导入持久化管理器
import EmployeePersistence from '../utils/EmployeePersistence.js';

/**
 * DataService - 统一的数据服务类
 * 
 * 提供所有模块的API调用方法，包括：
 * - 生产模块（生产计划、生产任务、工作报告）
 * - 设备模块（设备、模具、设备维护）
 * - 质量模块（质量检验、缺陷记录）
 * - 库存模块（库存、出入库记录）
 * - 报表模块（生产报表、质量报表、设备报表）
 * - 员工管理（支持持久化存储）
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
   * 内存数据存储（用于模拟数据持久化）
   * @private
   */
  static _memoryStore = {
    employees: []
  };

  /**
   * 初始化状态
   * @private
   */
  static _initialized = false;

  /**
   * 缓存配置
   * @private
   */
  static _cacheConfig = {
    // 默认缓存过期时间（毫秒）
    defaultTTL: 5 * 60 * 1000, // 5分钟
    // 各模块的缓存过期时间配置
    moduleTTL: {
      production: 2 * 60 * 1000,  // 生产数据2分钟
      equipment: 10 * 60 * 1000,  // 设备数据10分钟
      quality: 5 * 60 * 1000,     // 质量数据5分钟
      inventory: 3 * 60 * 1000,   // 库存数据3分钟
      reports: 15 * 60 * 1000     // 报表数据15分钟
    }
  };

  // ============================================================================
  // 初始化方法
  // ============================================================================

  /**
   * 初始化DataService
   * 从持久化存储恢复员工数据
   */
  static async initialize() {
    if (this._initialized) {
      console.log('[DataService] 已经初始化，跳过');
      return;
    }

    try {
      console.log('[DataService] 开始初始化...');
      
      // 从持久化存储恢复员工数据
      const persistedEmployees = await EmployeePersistence.loadEmployees();
      this._memoryStore.employees = persistedEmployees || [];
      
      console.log(`[DataService] 从持久化存储恢复了 ${this._memoryStore.employees.length} 个员工数据`);
      
      // 检查存储健康状态
      const storageHealth = await EmployeePersistence.getStorageHealth();
      if (storageHealth.status === 'degraded') {
        console.warn('[DataService] 存储状态异常:', storageHealth.warnings);
      }
      
      this._initialized = true;
      console.log('[DataService] 初始化完成');
      
    } catch (error) {
      console.error('[DataService] 初始化失败:', error);
      // 初始化失败时使用空数组，但仍标记为已初始化
      this._memoryStore.employees = [];
      this._initialized = true;
      
      // 记录初始化失败的原因
      console.warn('[DataService] 使用降级模式初始化，员工数据功能可能受限');
    }
  }

  // ============================================================================
  // Mock数据生成器 (Fallback)
  // ============================================================================

  /**
   * 生成mock生产计划数据
   * @private
   */
  static _generateMockProductionPlans() {
    return [
      {
        id: 1,
        planCode: 'PLAN-2026-001',
        productName: '注塑件A',
        planQty: 1000,
        actualQty: 850,
        status: '进行中',
        startDate: '2026-01-10',
        endDate: '2026-01-15',
        priority: '高',
        workshop: '车间A',
        equipment: '注塑机A1'
      },
      {
        id: 2,
        planCode: 'PLAN-2026-002',
        productName: '包装盒B',
        planQty: 2000,
        actualQty: 2000,
        status: '已完成',
        startDate: '2026-01-08',
        endDate: '2026-01-12',
        priority: '中',
        workshop: '车间B',
        equipment: '包装机B1'
      },
      {
        id: 3,
        planCode: 'PLAN-2026-003',
        productName: '电子元件C',
        planQty: 500,
        actualQty: 0,
        status: '等待中',
        startDate: '2026-01-15',
        endDate: '2026-01-20',
        priority: '低',
        workshop: '车间C',
        equipment: '检测设备C1'
      }
    ];
  }

  /**
   * 生成mock生产任务数据
   * @private
   */
  static _generateMockProductionTasks() {
    return [
      {
        id: 1,
        taskCode: 'TASK-2026-001',
        planId: 1,
        productName: '注塑件A',
        targetQty: 500,
        actualQty: 425,
        status: '进行中',
        operator: '张师傅',
        equipment: '注塑机A1',
        startTime: '2026-01-12 08:00',
        endTime: null
      },
      {
        id: 2,
        taskCode: 'TASK-2026-002',
        planId: 1,
        productName: '注塑件A',
        targetQty: 500,
        actualQty: 425,
        status: '已完成',
        operator: '李师傅',
        equipment: '注塑机A2',
        startTime: '2026-01-11 08:00',
        endTime: '2026-01-11 16:00'
      }
    ];
  }

  /**
   * 生成mock设备数据
   * @private
   */
  static _generateMockEquipment() {
    return [
      {
        id: 1,
        equipmentCode: 'EQ-A001',
        equipmentName: '注塑机A1',
        status: '运行中',
        utilization: 85,
        location: '车间A',
        operator: '张师傅',
        lastMaintenance: '2026-01-01'
      },
      {
        id: 2,
        equipmentCode: 'EQ-B001',
        equipmentName: '包装机B1',
        status: '维护中',
        utilization: 0,
        location: '车间B',
        operator: '维修中',
        lastMaintenance: '2025-12-15'
      }
    ];
  }

  /**
   * 生成mock员工数据
   * @private
   */
  static _generateMockEmployees() {
    // 基础mock数据
    const baseMockData = [
      {
        id: 1,
        name: '张师傅',
        shift: '白班',
        department: '生产部',
        position: '操作员'
      },
      {
        id: 2,
        name: '李师傅',
        shift: '白班',
        department: '生产部',
        position: '操作员'
      },
      {
        id: 3,
        name: '王师傅',
        shift: '夜班',
        department: '生产部',
        position: '操作员'
      }
    ];

    // 合并基础数据和内存中的新增数据
    return [...baseMockData, ...this._memoryStore.employees];
  }

  // ============================================================================
  // 缓存管理方法
  // ============================================================================

  /**
   * 生成缓存键
   * @private
   */
  static _generateCacheKey(module, method, params) {
    const paramStr = JSON.stringify(params);
    return `${module}_${method}_${btoa(paramStr)}`;
  }

  /**
   * 从缓存获取数据
   * @private
   */
  static _getFromCache(key) {
    const cached = this._cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    return null;
  }

  /**
   * 设置缓存数据
   * @private
   */
  static _setToCache(key, data, ttl) {
    this._cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }

  /**
   * 清除缓存
   */
  static clearCache(module = null) {
    if (module) {
      // 清除特定模块的缓存
      for (const key of this._cache.keys()) {
        if (key.startsWith(`${module}_`)) {
          this._cache.delete(key);
        }
      }
    } else {
      // 清除所有缓存
      this._cache.clear();
    }
  }

  // ============================================================================
  // 生产模块 API
  // ============================================================================

  /**
   * 获取生产计划列表
   * @param {Object} params - 查询参数 { page, pageSize, status, sort }
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 生产计划数据
   * Requirements: 2.1, 2.5, 10.3, 10.5
   */
  static async getProductionPlans(params = {}, forceRefresh = false) {
    const cacheKey = this._generateCacheKey('production', 'getProductionPlans', params);
    
    // 检查缓存
    if (!forceRefresh) {
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // 尝试从API获取数据
      // 注意：这里暂时使用mock数据，因为API可能不可用
      const mockData = this._generateMockProductionPlans();
      
      const result = {
        success: true,
        data: {
          items: mockData,
          total: mockData.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        }
      };

      // 缓存结果
      const ttl = this._cacheConfig.moduleTTL.production || this._cacheConfig.defaultTTL;
      this._setToCache(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      console.warn('[DataService] 获取生产计划失败，使用mock数据:', error.message);
      
      // 返回mock数据作为fallback
      const mockData = this._generateMockProductionPlans();
      return {
        success: true,
        data: {
          items: mockData,
          total: mockData.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        },
        fromMock: true
      };
    }
  }

  /**
   * 添加生产计划
   * @param {Object} planData - 生产计划数据
   * @returns {Promise<Object>} 添加结果
   */
  static async addProductionPlan(planData) {
    try {
      // 模拟API调用
      console.log('添加生产计划:', planData);
      
      // 清除相关缓存
      this.clearCache('production');
      
      return {
        success: true,
        data: {
          id: Date.now(),
          ...planData
        },
        message: '生产计划添加成功'
      };
    } catch (error) {
      console.error('[DataService] 添加生产计划失败:', error);
      throw error;
    }
  }

  /**
   * 更新生产计划
   * @param {number} id - 生产计划ID
   * @param {Object} planData - 生产计划数据
   * @returns {Promise<Object>} 更新结果
   */
  static async updateProductionPlan(id, planData) {
    try {
      // 模拟API调用
      console.log('更新生产计划:', id, planData);
      
      // 清除相关缓存
      this.clearCache('production');
      
      return {
        success: true,
        data: {
          id,
          ...planData
        },
        message: '生产计划更新成功'
      };
    } catch (error) {
      console.error('[DataService] 更新生产计划失败:', error);
      throw error;
    }
  }

  /**
   * 删除生产计划
   * @param {number} id - 生产计划ID
   * @returns {Promise<Object>} 删除结果
   */
  static async deleteProductionPlan(id) {
    try {
      // 模拟API调用
      console.log('删除生产计划:', id);
      
      // 清除相关缓存
      this.clearCache('production');
      
      return {
        success: true,
        message: '生产计划删除成功'
      };
    } catch (error) {
      console.error('[DataService] 删除生产计划失败:', error);
      throw error;
    }
  }
  /**
   * 获取生产任务列表
   * @param {Object} params - 查询参数 { page, pageSize, status, sort }
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 生产任务数据
   * Requirements: 2.2, 2.5, 10.3, 10.5
   */
  static async getProductionTasks(params = {}, forceRefresh = false) {
    const cacheKey = this._generateCacheKey('production', 'getProductionTasks', params);
    
    if (!forceRefresh) {
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const mockData = this._generateMockProductionTasks();
      
      const result = {
        success: true,
        data: {
          items: mockData,
          total: mockData.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        }
      };

      const ttl = this._cacheConfig.moduleTTL.production || this._cacheConfig.defaultTTL;
      this._setToCache(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      console.warn('[DataService] 获取生产任务失败，使用mock数据:', error.message);
      
      const mockData = this._generateMockProductionTasks();
      return {
        success: true,
        data: {
          items: mockData,
          total: mockData.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        },
        fromMock: true
      };
    }
  }

  /**
   * 添加生产任务
   * @param {Object} taskData - 生产任务数据
   * @returns {Promise<Object>} 添加结果
   */
  static async addProductionTask(taskData) {
    try {
      // 模拟API调用
      console.log('添加生产任务:', taskData);
      
      // 清除相关缓存
      this.clearCache('production');
      
      return {
        success: true,
        data: {
          id: Date.now(),
          ...taskData
        },
        message: '生产任务添加成功'
      };
    } catch (error) {
      console.error('[DataService] 添加生产任务失败:', error);
      throw error;
    }
  }

  /**
   * 更新生产任务
   * @param {number} id - 生产任务ID
   * @param {Object} taskData - 生产任务数据
   * @returns {Promise<Object>} 更新结果
   */
  static async updateProductionTask(id, taskData) {
    try {
      // 模拟API调用
      console.log('更新生产任务:', id, taskData);
      
      // 清除相关缓存
      this.clearCache('production');
      
      return {
        success: true,
        data: {
          id,
          ...taskData
        },
        message: '生产任务更新成功'
      };
    } catch (error) {
      console.error('[DataService] 更新生产任务失败:', error);
      throw error;
    }
  }

  /**
   * 删除生产任务
   * @param {number} id - 生产任务ID
   * @returns {Promise<Object>} 删除结果
   */
  static async deleteProductionTask(id) {
    try {
      // 模拟API调用
      console.log('删除生产任务:', id);
      
      // 清除相关缓存
      this.clearCache('production');
      
      return {
        success: true,
        message: '生产任务删除成功'
      };
    } catch (error) {
      console.error('[DataService] 删除生产任务失败:', error);
      throw error;
    }
  }

  /**
   * 获取工作报告列表
   * @param {Object} params - 查询参数 { page, pageSize, date, sort }
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 工作报告数据
   * Requirements: 2.3, 2.5, 10.3, 10.5
   */
  static async getWorkReports(params = {}, forceRefresh = false) {
    const cacheKey = this._generateCacheKey('production', 'getWorkReports', params);
    
    if (!forceRefresh) {
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const mockData = [
        {
          id: 1,
          reportDate: '2026-01-12',
          operator: '张师傅',
          equipment: '注塑机A1',
          productName: '注塑件A',
          targetQty: 500,
          actualQty: 425,
          defectQty: 25,
          efficiency: 85
        }
      ];
      
      const result = {
        success: true,
        data: {
          items: mockData,
          total: mockData.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        }
      };

      const ttl = this._cacheConfig.moduleTTL.production || this._cacheConfig.defaultTTL;
      this._setToCache(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      console.warn('[DataService] 获取工作报告失败，使用mock数据:', error.message);
      
      return {
        success: true,
        data: { items: [], total: 0, page: 1, pageSize: 10 },
        fromMock: true
      };
    }
  }

  // ============================================================================
  // 设备模块 API
  // ============================================================================

  /**
   * 获取设备列表
   * @param {Object} params - 查询参数 { page, pageSize, status, sort }
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 设备数据
   * Requirements: 3.1, 3.5, 10.3, 10.5
   */
  static async getEquipment(params = {}, forceRefresh = false) {
    const cacheKey = this._generateCacheKey('equipment', 'getEquipment', params);
    
    if (!forceRefresh) {
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const mockData = this._generateMockEquipment();
      
      const result = {
        success: true,
        data: {
          items: mockData,
          total: mockData.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        }
      };

      const ttl = this._cacheConfig.moduleTTL.equipment || this._cacheConfig.defaultTTL;
      this._setToCache(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      console.warn('[DataService] 获取设备数据失败，使用mock数据:', error.message);
      
      const mockData = this._generateMockEquipment();
      return {
        success: true,
        data: {
          items: mockData,
          total: mockData.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        },
        fromMock: true
      };
    }
  }

  /**
   * 获取员工列表
   * @param {Object} params - 查询参数
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 员工数据
   */
  static async getEmployees(params = {}, forceRefresh = false) {
    console.log('[DataService.getEmployees] 开始获取员工数据, params:', params, 'forceRefresh:', forceRefresh);
    
    // 确保已初始化
    await this.initialize();
    
    const cacheKey = this._generateCacheKey('production', 'getEmployees', params);
    console.log('[DataService.getEmployees] 生成缓存键:', cacheKey);
    
    if (!forceRefresh) {
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        console.log('[DataService.getEmployees] 使用缓存数据, 员工数量:', cached.data?.items?.length);
        return cached;
      } else {
        console.log('[DataService.getEmployees] 缓存中没有数据');
      }
    } else {
      console.log('[DataService.getEmployees] 强制刷新，跳过缓存');
    }

    try {
      console.log('[DataService.getEmployees] 生成mock员工数据...');
      const mockData = this._generateMockEmployees();
      console.log('[DataService.getEmployees] 生成的员工数据:', mockData);
      console.log('[DataService.getEmployees] 员工总数:', mockData.length);
      console.log('[DataService.getEmployees] 内存存储中的员工数:', this._memoryStore.employees.length);
      
      const result = {
        success: true,
        data: {
          items: mockData,
          total: mockData.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        }
      };

      console.log('[DataService.getEmployees] 准备返回的结果:', result);

      const ttl = this._cacheConfig.moduleTTL.production || this._cacheConfig.defaultTTL;
      console.log('[DataService.getEmployees] 缓存数据, TTL:', ttl);
      this._setToCache(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      console.warn('[DataService] 获取员工数据失败，使用mock数据:', error.message);
      
      const mockData = this._generateMockEmployees();
      return {
        success: true,
        data: {
          items: mockData,
          total: mockData.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        },
        fromMock: true
      };
    }
  }

  /**
   * 添加员工信息
   * @param {Object} employeeData - 员工数据
   * @returns {Promise<Object>} 添加结果
   */
  static async addEmployee(employeeData) {
    try {
      console.log('[DataService] 开始添加员工，数据:', employeeData);
      
      // 确保已初始化
      await this.initialize();
      
      // 使用EmployeePersistence添加员工
      const newEmployee = await EmployeePersistence.addEmployee(employeeData);
      
      // 同步更新内存存储
      this._memoryStore.employees.push(newEmployee);
      console.log('[DataService] 员工已添加到内存存储，当前员工总数:', this._memoryStore.employees.length);
      
      const result = {
        success: true,
        data: newEmployee,
        message: '员工添加成功'
      };

      console.log('[DataService] 员工添加成功，结果:', result);

      // 清除相关缓存
      console.log('[DataService] 开始清除缓存...');
      this.clearCache('production');
      console.log('[DataService] 缓存清除完成');
      
      return result;
    } catch (error) {
      console.error('[DataService] 添加员工失败:', error);
      console.error('[DataService] 错误堆栈:', error.stack);
      
      // 根据错误类型提供不同的错误信息
      let errorMessage = '添加员工失败';
      if (error.type === 'STORAGE_FULL') {
        errorMessage = '存储空间不足，请清理数据后重试';
      } else if (error.type === 'STORAGE_UNAVAILABLE') {
        errorMessage = '存储不可用，数据已保存到内存模式（页面刷新后可能丢失）';
        
        // 在存储不可用的情况下，仍然尝试添加到内存
        try {
          const newEmployee = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            ...employeeData,
            createDate: new Date().toISOString().split('T')[0],
            updateDate: new Date().toISOString().split('T')[0],
            _persistence: {
              source: 'memory_only',
              createdAt: new Date().toISOString(),
              lastModified: new Date().toISOString(),
              syncStatus: 'memory_only'
            }
          };
          
          this._memoryStore.employees.push(newEmployee);
          this.clearCache('production');
          
          return {
            success: true,
            data: newEmployee,
            message: errorMessage,
            warning: true
          };
        } catch (memoryError) {
          console.error('[DataService] 内存模式添加也失败:', memoryError);
        }
      }
      
      throw new Error(errorMessage + ': ' + error.message);
    }
  }

  /**
   * 更新员工信息
   * @param {number} id - 员工ID
   * @param {Object} employeeData - 员工数据
   * @returns {Promise<Object>} 更新结果
   */
  static async updateEmployee(id, employeeData) {
    try {
      console.log('[DataService] 开始更新员工，ID:', id, '数据:', employeeData);
      
      // 确保已初始化
      await this.initialize();
      
      // 使用EmployeePersistence更新员工
      const updatedEmployee = await EmployeePersistence.updateEmployee(id, employeeData);
      
      // 同步更新内存存储
      const employeeIndex = this._memoryStore.employees.findIndex(emp => emp.id == id);
      if (employeeIndex !== -1) {
        this._memoryStore.employees[employeeIndex] = updatedEmployee;
        console.log('[DataService] 员工信息已在内存存储中更新');
      }
      
      const result = {
        success: true,
        data: updatedEmployee,
        message: '员工信息更新成功'
      };

      console.log('[DataService] 员工更新成功，结果:', result);

      // 清除相关缓存
      this.clearCache('production');
      
      return result;
    } catch (error) {
      console.error('[DataService] 更新员工失败:', error);
      throw new Error('更新员工失败: ' + error.message);
    }
  }

  /**
   * 删除员工
   * @param {number} id - 员工ID
   * @returns {Promise<Object>} 删除结果
   */
  static async deleteEmployee(id) {
    try {
      console.log('[DataService] 开始删除员工，ID:', id);
      
      // 确保已初始化
      await this.initialize();
      
      // 使用EmployeePersistence删除员工
      const success = await EmployeePersistence.deleteEmployee(id);
      
      if (success) {
        // 同步更新内存存储
        const initialLength = this._memoryStore.employees.length;
        this._memoryStore.employees = this._memoryStore.employees.filter(emp => emp.id != id);
        const deletedCount = initialLength - this._memoryStore.employees.length;
        
        console.log('[DataService] 从内存存储中删除了', deletedCount, '个员工');
      }
      
      const result = {
        success: success,
        message: success ? '员工删除成功' : '员工删除失败'
      };

      // 清除相关缓存
      this.clearCache('production');
      
      return result;
    } catch (error) {
      console.error('[DataService] 删除员工失败:', error);
      throw new Error('删除员工失败: ' + error.message);
    }
  }

  // ============================================================================
  // 批量操作和性能优化功能
  // ============================================================================

  /**
   * 批量添加员工
   * @param {Array} employeesData - 员工数据数组
   * @returns {Promise<Object>} 批量添加结果
   */
  static async batchAddEmployees(employeesData) {
    try {
      console.log('[DataService] 开始批量添加员工，数量:', employeesData.length);
      
      // 确保已初始化
      await this.initialize();
      
      // 使用EmployeePersistence批量添加员工
      const result = await EmployeePersistence.batchAddEmployees(employeesData);
      
      if (result.success && result.results.addedEmployees.length > 0) {
        // 同步更新内存存储
        this._memoryStore.employees.push(...result.results.addedEmployees);
        console.log('[DataService] 批量添加到内存存储，当前员工总数:', this._memoryStore.employees.length);
      }
      
      // 清除相关缓存
      this.clearCache('production');
      
      return result;
    } catch (error) {
      console.error('[DataService] 批量添加员工失败:', error);
      throw new Error('批量添加员工失败: ' + error.message);
    }
  }

  /**
   * 批量更新员工
   * @param {Array} updates - 更新数据数组 [{id, data}]
   * @returns {Promise<Object>} 批量更新结果
   */
  static async batchUpdateEmployees(updates) {
    try {
      console.log('[DataService] 开始批量更新员工，数量:', updates.length);
      
      // 确保已初始化
      await this.initialize();
      
      // 使用EmployeePersistence批量更新员工
      const result = await EmployeePersistence.batchUpdateEmployees(updates);
      
      if (result.success && result.results.updatedEmployees.length > 0) {
        // 同步更新内存存储
        const updatedMap = new Map(result.results.updatedEmployees.map(emp => [emp.id, emp]));
        
        this._memoryStore.employees = this._memoryStore.employees.map(emp => 
          updatedMap.has(emp.id) ? updatedMap.get(emp.id) : emp
        );
        
        console.log('[DataService] 批量更新内存存储完成');
      }
      
      // 清除相关缓存
      this.clearCache('production');
      
      return result;
    } catch (error) {
      console.error('[DataService] 批量更新员工失败:', error);
      throw new Error('批量更新员工失败: ' + error.message);
    }
  }

  /**
   * 批量删除员工
   * @param {Array} ids - 员工ID数组
   * @returns {Promise<Object>} 批量删除结果
   */
  static async batchDeleteEmployees(ids) {
    try {
      console.log('[DataService] 开始批量删除员工，数量:', ids.length);
      
      // 确保已初始化
      await this.initialize();
      
      // 使用EmployeePersistence批量删除员工
      const result = await EmployeePersistence.batchDeleteEmployees(ids);
      
      if (result.success && result.results.deletedIds.length > 0) {
        // 同步更新内存存储
        const deletedIds = new Set(result.results.deletedIds);
        const initialLength = this._memoryStore.employees.length;
        
        this._memoryStore.employees = this._memoryStore.employees.filter(emp => !deletedIds.has(emp.id));
        
        const deletedCount = initialLength - this._memoryStore.employees.length;
        console.log('[DataService] 从内存存储中批量删除了', deletedCount, '个员工');
      }
      
      // 清除相关缓存
      this.clearCache('production');
      
      return result;
    } catch (error) {
      console.error('[DataService] 批量删除员工失败:', error);
      throw new Error('批量删除员工失败: ' + error.message);
    }
  }

  /**
   * 分页获取员工数据
   * @param {Object} params - 分页参数 {page, pageSize, filter, sort}
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 分页员工数据
   */
  static async getEmployeesPaginated(params = {}, forceRefresh = false) {
    try {
      console.log('[DataService] 分页获取员工数据, params:', params);
      
      // 确保已初始化
      await this.initialize();
      
      const cacheKey = this._generateCacheKey('production', 'getEmployeesPaginated', params);
      
      if (!forceRefresh) {
        const cached = this._getFromCache(cacheKey);
        if (cached) {
          console.log('[DataService] 使用缓存的分页数据');
          return cached;
        }
      }
      
      // 使用EmployeePersistence分页加载
      const result = await EmployeePersistence.loadEmployeesPaginated(params);
      
      // 缓存结果
      const ttl = this._cacheConfig.moduleTTL.production || this._cacheConfig.defaultTTL;
      this._setToCache(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      console.error('[DataService] 分页获取员工数据失败:', error);
      throw new Error('分页获取员工数据失败: ' + error.message);
    }
  }

  /**
   * 搜索员工
   * @param {Object} searchOptions - 搜索选项
   * @returns {Promise<Object>} 搜索结果
   */
  static async searchEmployees(searchOptions = {}) {
    try {
      console.log('[DataService] 搜索员工, options:', searchOptions);
      
      // 确保已初始化
      await this.initialize();
      
      // 使用EmployeePersistence搜索
      const employees = await EmployeePersistence.searchEmployees(searchOptions);
      
      return {
        success: true,
        data: {
          items: employees,
          total: employees.length,
          searchOptions: searchOptions
        }
      };
    } catch (error) {
      console.error('[DataService] 搜索员工失败:', error);
      throw new Error('搜索员工失败: ' + error.message);
    }
  }

  /**
   * 获取员工统计信息（优化版）
   * @param {boolean} forceRefresh - 是否强制刷新
   * @returns {Promise<Object>} 统计信息
   */
  static async getEmployeeStatsOptimized(forceRefresh = false) {
    try {
      console.log('[DataService] 获取优化的员工统计信息');
      
      // 确保已初始化
      await this.initialize();
      
      const cacheKey = 'employee_stats_optimized';
      
      if (!forceRefresh) {
        const cached = this._getFromCache(cacheKey);
        if (cached) {
          console.log('[DataService] 使用缓存的统计数据');
          return cached;
        }
      }
      
      // 使用EmployeePersistence获取优化统计
      const stats = await EmployeePersistence.getEmployeeStatsOptimized();
      
      const result = {
        success: true,
        data: stats
      };
      
      // 缓存结果
      const ttl = 2 * 60 * 1000; // 2分钟缓存
      this._setToCache(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      console.error('[DataService] 获取优化统计信息失败:', error);
      throw new Error('获取统计信息失败: ' + error.message);
    }
  }

  /**
   * 优化员工数据存储
   * @returns {Promise<Object>} 优化结果
   */
  static async optimizeEmployeeData() {
    try {
      console.log('[DataService] 开始优化员工数据存储');
      
      // 确保已初始化
      await this.initialize();
      
      // 使用EmployeePersistence优化数据
      const result = await EmployeePersistence.optimizeData();
      
      if (result.success) {
        // 重新加载内存存储
        const employees = await EmployeePersistence.loadEmployees();
        this._memoryStore.employees = employees;
        
        // 清除所有缓存
        this.clearCache();
        
        console.log('[DataService] 数据优化完成，重新加载了', employees.length, '个员工');
      }
      
      return result;
    } catch (error) {
      console.error('[DataService] 优化员工数据失败:', error);
      throw new Error('优化数据失败: ' + error.message);
    }
  }

  /**
   * 获取存储性能信息
   * @returns {Object} 性能信息
   */
  static getStoragePerformanceInfo() {
    try {
      // 获取PersistenceManager性能统计
      const persistenceStats = PersistenceManager.getPerformanceStats();
      
      // 获取DataService缓存统计
      const cacheStats = {
        cacheSize: this._cache.size,
        memoryEmployeeCount: this._memoryStore.employees.length,
        initialized: this._initialized
      };
      
      return {
        success: true,
        data: {
          persistence: persistenceStats,
          cache: cacheStats,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('[DataService] 获取性能信息失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================================================
  // 工艺管理模块 API
  // ============================================================================

  /**
   * 获取产品主数据列表
   * @param {Object} params - 查询参数 { page, pageSize, category, status }
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 产品主数据
   */
  static async getProcessProducts(params = {}, forceRefresh = false) {
    const cacheKey = this._generateCacheKey('process', 'getProcessProducts', params);
    
    if (!forceRefresh) {
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Mock产品主数据
      const mockData = [
        {
          id: 1,
          key: '1',
          productCode: 'P001',
          productName: '塑料外壳A',
          category: '注塑件',
          specification: '150×80×25mm',
          material: 'ABS塑料',
          status: '生效',
          createDate: '2024-01-15',
          version: 'V2.1'
        },
        {
          id: 2,
          key: '2',
          productCode: 'P002',
          productName: '电子组件B',
          category: '电子件',
          specification: '50×30×10mm',
          material: 'PCB板',
          status: '生效',
          createDate: '2024-02-20',
          version: 'V1.5'
        },
        {
          id: 3,
          key: '3',
          productCode: 'P003',
          productName: '机械零件C',
          category: '机加件',
          specification: '100×50×20mm',
          material: '铝合金',
          status: '待审核',
          createDate: '2024-03-10',
          version: 'V1.0'
        }
      ];
      
      const result = {
        success: true,
        data: {
          items: mockData,
          total: mockData.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        }
      };

      const ttl = this._cacheConfig.moduleTTL.production || this._cacheConfig.defaultTTL;
      this._setToCache(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      console.warn('[DataService] 获取产品主数据失败，使用mock数据:', error.message);
      
      return {
        success: true,
        data: { items: [], total: 0, page: 1, pageSize: 10 },
        fromMock: true
      };
    }
  }

  /**
   * 获取工序主数据列表
   * @param {Object} params - 查询参数 { page, pageSize, category, workCenter }
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 工序主数据
   */
  static async getProcessOperations(params = {}, forceRefresh = false) {
    const cacheKey = this._generateCacheKey('process', 'getProcessOperations', params);
    
    if (!forceRefresh) {
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Mock工序主数据
      const mockData = [
        {
          id: 1,
          key: '1',
          operationCode: 'OP001',
          operationName: '注塑成型',
          category: '成型工序',
          workCenter: '注塑车间',
          standardTime: 45,
          setupTime: 15,
          status: '生效'
        },
        {
          id: 2,
          key: '2',
          operationCode: 'OP002',
          operationName: '机械加工',
          category: '加工工序',
          workCenter: '机加车间',
          standardTime: 60,
          setupTime: 20,
          status: '生效'
        },
        {
          id: 3,
          key: '3',
          operationCode: 'OP003',
          operationName: '表面处理',
          category: '后处理',
          workCenter: '表处车间',
          standardTime: 30,
          setupTime: 10,
          status: '生效'
        }
      ];
      
      const result = {
        success: true,
        data: {
          items: mockData,
          total: mockData.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        }
      };

      const ttl = this._cacheConfig.moduleTTL.production || this._cacheConfig.defaultTTL;
      this._setToCache(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      console.warn('[DataService] 获取工序主数据失败，使用mock数据:', error.message);
      
      return {
        success: true,
        data: { items: [], total: 0, page: 1, pageSize: 10 },
        fromMock: true
      };
    }
  }

  /**
   * 获取设备主数据列表
   * @param {Object} params - 查询参数 { page, pageSize, workCenter, status }
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 设备主数据
   */
  static async getProcessEquipment(params = {}, forceRefresh = false) {
    const cacheKey = this._generateCacheKey('process', 'getProcessEquipment', params);
    
    if (!forceRefresh) {
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Mock设备主数据
      const mockData = [
        {
          id: 1,
          key: '1',
          equipmentCode: 'EQ001',
          equipmentName: '注塑机A',
          model: 'INJ-200T',
          workCenter: '注塑车间',
          capacity: '200吨',
          status: '运行中',
          efficiency: 95
        },
        {
          id: 2,
          key: '2',
          equipmentCode: 'EQ002',
          equipmentName: '数控机床B',
          model: 'CNC-500',
          workCenter: '机加车间',
          capacity: '500mm',
          status: '运行中',
          efficiency: 88
        },
        {
          id: 3,
          key: '3',
          equipmentCode: 'EQ003',
          equipmentName: '喷涂线C',
          model: 'SPRAY-AUTO',
          workCenter: '表处车间',
          capacity: '100件/小时',
          status: '维护中',
          efficiency: 0
        }
      ];
      
      const result = {
        success: true,
        data: {
          items: mockData,
          total: mockData.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        }
      };

      const ttl = this._cacheConfig.moduleTTL.equipment || this._cacheConfig.defaultTTL;
      this._setToCache(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      console.warn('[DataService] 获取设备主数据失败，使用mock数据:', error.message);
      
      return {
        success: true,
        data: { items: [], total: 0, page: 1, pageSize: 10 },
        fromMock: true
      };
    }
  }

  /**
   * 添加产品主数据
   * @param {Object} productData - 产品数据
   * @returns {Promise<Object>} 添加结果
   */
  static async addProcessProduct(productData) {
    try {
      // 模拟API调用
      console.log('添加产品主数据:', productData);
      
      // 清除相关缓存
      this.clearCache('process');
      
      return {
        success: true,
        data: {
          id: Date.now(),
          ...productData,
          createDate: new Date().toISOString().split('T')[0],
          status: '生效'
        },
        message: '产品添加成功'
      };
    } catch (error) {
      console.error('[DataService] 添加产品主数据失败:', error);
      throw error;
    }
  }

  /**
   * 添加工序主数据
   * @param {Object} operationData - 工序数据
   * @returns {Promise<Object>} 添加结果
   */
  static async addProcessOperation(operationData) {
    try {
      // 模拟API调用
      console.log('添加工序主数据:', operationData);
      
      // 清除相关缓存
      this.clearCache('process');
      
      return {
        success: true,
        data: {
          id: Date.now(),
          ...operationData,
          status: '生效'
        },
        message: '工序添加成功'
      };
    } catch (error) {
      console.error('[DataService] 添加工序主数据失败:', error);
      throw error;
    }
  }

  /**
   * 添加设备主数据
   * @param {Object} equipmentData - 设备数据
   * @returns {Promise<Object>} 添加结果
   */
  static async addProcessEquipment(equipmentData) {
    try {
      // 模拟API调用
      console.log('添加设备主数据:', equipmentData);
      
      // 清除相关缓存
      this.clearCache('process');
      
      return {
        success: true,
        data: {
          id: Date.now(),
          ...equipmentData,
          status: '运行中'
        },
        message: '设备添加成功'
      };
    } catch (error) {
      console.error('[DataService] 添加设备主数据失败:', error);
      throw error;
    }
  }

  // ============================================================================
  // 其他模块的简化实现（返回空数据或基础mock数据）
  // ============================================================================

  static async getMolds(params = {}, forceRefresh = false) {
    return { success: true, data: { items: [], total: 0 } };
  }

  static async getEquipmentMaintenance(params = {}, forceRefresh = false) {
    return { success: true, data: { items: [], total: 0 } };
  }

  static async getQualityInspections(params = {}, forceRefresh = false) {
    const cacheKey = this._generateCacheKey('quality', 'getQualityInspections', params);
    
    if (!forceRefresh) {
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Mock quality inspections data
      const mockData = [
        {
          id: 1,
          inspectionCode: 'IQC-20260112001',
          type: 'IQC',
          productName: '塑料杯A',
          batchNumber: 'B20260112001',
          inspectionDate: '2026-01-12',
          inspector: '张检验员',
          result: '合格',
          passRate: 98.5,
          sampleSize: 100,
          defectCount: 1,
          status: '已完成'
        },
        {
          id: 2,
          inspectionCode: 'PQC-20260112001',
          type: 'PQC',
          productName: '包装盒B',
          batchNumber: 'B20260112002',
          inspectionDate: '2026-01-12',
          inspector: '李检验员',
          result: '合格',
          passRate: 97.2,
          sampleSize: 50,
          defectCount: 1,
          status: '已完成'
        },
        {
          id: 3,
          inspectionCode: 'FQC-20260112001',
          type: 'FQC',
          productName: '电子元件C',
          batchNumber: 'B20260112003',
          inspectionDate: '2026-01-12',
          inspector: '王检验员',
          result: '不合格',
          passRate: 94.0,
          sampleSize: 25,
          defectCount: 2,
          status: '已完成'
        }
      ];
      
      const result = {
        success: true,
        data: {
          items: mockData,
          total: mockData.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        }
      };

      const ttl = this._cacheConfig.moduleTTL.quality || this._cacheConfig.defaultTTL;
      this._setToCache(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      console.warn('[DataService] 获取质量检验数据失败，使用mock数据:', error.message);
      
      return {
        success: true,
        data: { items: [], total: 0, page: 1, pageSize: 10 },
        fromMock: true
      };
    }
  }

  /**
   * 添加质量检验
   * @param {Object} inspectionData - 质量检验数据
   * @returns {Promise<Object>} 添加结果
   */
  static async addQualityInspection(inspectionData) {
    try {
      // 模拟API调用
      console.log('添加质量检验:', inspectionData);
      
      // 清除相关缓存
      this.clearCache('quality');
      
      return {
        success: true,
        data: {
          id: Date.now(),
          ...inspectionData,
          inspectionDate: inspectionData.inspectionDate?.format?.('YYYY-MM-DD') || inspectionData.inspectionDate,
          passRate: inspectionData.sampleSize && inspectionData.defectCount !== undefined 
            ? ((inspectionData.sampleSize - inspectionData.defectCount) / inspectionData.sampleSize * 100).toFixed(1)
            : 0
        },
        message: '质量检验添加成功'
      };
    } catch (error) {
      console.error('[DataService] 添加质量检验失败:', error);
      throw error;
    }
  }

  /**
   * 更新质量检验
   * @param {number} id - 质量检验ID
   * @param {Object} inspectionData - 质量检验数据
   * @returns {Promise<Object>} 更新结果
   */
  static async updateQualityInspection(id, inspectionData) {
    try {
      // 模拟API调用
      console.log('更新质量检验:', id, inspectionData);
      
      // 清除相关缓存
      this.clearCache('quality');
      
      return {
        success: true,
        data: {
          id,
          ...inspectionData,
          inspectionDate: inspectionData.inspectionDate?.format?.('YYYY-MM-DD') || inspectionData.inspectionDate,
          passRate: inspectionData.sampleSize && inspectionData.defectCount !== undefined 
            ? ((inspectionData.sampleSize - inspectionData.defectCount) / inspectionData.sampleSize * 100).toFixed(1)
            : 0
        },
        message: '质量检验更新成功'
      };
    } catch (error) {
      console.error('[DataService] 更新质量检验失败:', error);
      throw error;
    }
  }

  /**
   * 删除质量检验
   * @param {number} id - 质量检验ID
   * @returns {Promise<Object>} 删除结果
   */
  static async deleteQualityInspection(id) {
    try {
      // 模拟API调用
      console.log('删除质量检验:', id);
      
      // 清除相关缓存
      this.clearCache('quality');
      
      return {
        success: true,
        message: '质量检验删除成功'
      };
    } catch (error) {
      console.error('[DataService] 删除质量检验失败:', error);
      throw error;
    }
  }

  static async getDefectRecords(params = {}, forceRefresh = false) {
    const cacheKey = this._generateCacheKey('quality', 'getDefectRecords', params);
    
    if (!forceRefresh) {
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Mock defect records data
      const mockData = [
        {
          id: 1,
          defectCode: 'DEF-001',
          productName: '塑料杯A',
          batchNumber: 'B20260112001',
          defectType: '外观缺陷',
          defectDescription: '表面划痕',
          severity: '轻微',
          quantity: 5,
          inspector: '张检验员',
          inspectionDate: '2026-01-12',
          status: '已处理'
        },
        {
          id: 2,
          defectCode: 'DEF-002',
          productName: '包装盒B',
          batchNumber: 'B20260112002',
          defectType: '尺寸缺陷',
          defectDescription: '尺寸超差',
          severity: '严重',
          quantity: 2,
          inspector: '李检验员',
          inspectionDate: '2026-01-12',
          status: '待处理'
        }
      ];
      
      const result = {
        success: true,
        data: {
          items: mockData,
          total: mockData.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        }
      };

      const ttl = this._cacheConfig.moduleTTL.quality || this._cacheConfig.defaultTTL;
      this._setToCache(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      console.warn('[DataService] 获取缺陷记录失败，使用mock数据:', error.message);
      
      return {
        success: true,
        data: { items: [], total: 0, page: 1, pageSize: 10 },
        fromMock: true
      };
    }
  }

  /**
   * 添加缺陷记录
   * @param {Object} defectData - 缺陷记录数据
   * @returns {Promise<Object>} 添加结果
   */
  static async addDefectRecord(defectData) {
    try {
      // 模拟API调用
      console.log('添加缺陷记录:', defectData);
      
      // 清除相关缓存
      this.clearCache('quality');
      
      return {
        success: true,
        data: {
          id: Date.now(),
          ...defectData,
          inspectionDate: defectData.inspectionDate?.format?.('YYYY-MM-DD') || defectData.inspectionDate
        },
        message: '缺陷记录添加成功'
      };
    } catch (error) {
      console.error('[DataService] 添加缺陷记录失败:', error);
      throw error;
    }
  }

  /**
   * 更新缺陷记录
   * @param {number} id - 缺陷记录ID
   * @param {Object} defectData - 缺陷记录数据
   * @returns {Promise<Object>} 更新结果
   */
  static async updateDefectRecord(id, defectData) {
    try {
      // 模拟API调用
      console.log('更新缺陷记录:', id, defectData);
      
      // 清除相关缓存
      this.clearCache('quality');
      
      return {
        success: true,
        data: {
          id,
          ...defectData,
          inspectionDate: defectData.inspectionDate?.format?.('YYYY-MM-DD') || defectData.inspectionDate
        },
        message: '缺陷记录更新成功'
      };
    } catch (error) {
      console.error('[DataService] 更新缺陷记录失败:', error);
      throw error;
    }
  }

  /**
   * 删除缺陷记录
   * @param {number} id - 缺陷记录ID
   * @returns {Promise<Object>} 删除结果
   */
  static async deleteDefectRecord(id) {
    try {
      // 模拟API调用
      console.log('删除缺陷记录:', id);
      
      // 清除相关缓存
      this.clearCache('quality');
      
      return {
        success: true,
        message: '缺陷记录删除成功'
      };
    } catch (error) {
      console.error('[DataService] 删除缺陷记录失败:', error);
      throw error;
    }
  }

  static async getInspectionStandards(params = {}, forceRefresh = false) {
    const cacheKey = this._generateCacheKey('quality', 'getInspectionStandards', params);
    
    if (!forceRefresh) {
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Mock inspection standards data
      const mockData = [
        {
          id: 1,
          standardCode: 'STD-001',
          standardName: '塑料杯外观检验标准',
          productType: '塑料杯',
          version: 'V1.0',
          status: '有效',
          inspectionItems: [
            { item: '外观', requirement: '无划痕、无气泡', method: '目视检查' },
            { item: '尺寸', requirement: '±0.1mm', method: '卡尺测量' }
          ],
          createdDate: '2026-01-01',
          updatedDate: '2026-01-10'
        },
        {
          id: 2,
          standardCode: 'STD-002',
          standardName: '包装盒质量检验标准',
          productType: '包装盒',
          version: 'V1.1',
          status: '有效',
          inspectionItems: [
            { item: '印刷质量', requirement: '清晰无模糊', method: '目视检查' },
            { item: '折痕', requirement: '无破损', method: '手工检查' }
          ],
          createdDate: '2026-01-02',
          updatedDate: '2026-01-08'
        }
      ];
      
      const result = {
        success: true,
        data: {
          items: mockData,
          total: mockData.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        }
      };

      const ttl = this._cacheConfig.moduleTTL.quality || this._cacheConfig.defaultTTL;
      this._setToCache(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      console.warn('[DataService] 获取检验标准失败，使用mock数据:', error.message);
      
      return {
        success: true,
        data: { items: [], total: 0, page: 1, pageSize: 10 },
        fromMock: true
      };
    }
  }

  static async getInventory(params = {}, forceRefresh = false) {
    const cacheKey = this._generateCacheKey('inventory', 'getInventory', params);
    
    if (!forceRefresh) {
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Mock inventory data
      const mockData = [
        {
          id: 1,
          material_id: 1,
          material_name: '塑料原料PVC',
          material_code: 'MAT-001',
          specification: 'PVC-001',
          category: '原材料',
          unit: 'kg',
          supplier: '塑料公司A',
          unit_price: 12.50,
          current_stock: 850,
          min_stock: 100,
          max_stock: 1000,
          warehouse_location: 'A01-01-01',
          shelf_life: 365,
          status: 'active',
          last_updated: '2026-01-12 10:30:00'
        },
        {
          id: 2,
          material_id: 2,
          material_name: '包装盒材料',
          material_code: 'MAT-002',
          specification: 'BOX-001',
          category: '包装材料',
          unit: '个',
          supplier: '包装公司B',
          unit_price: 2.80,
          current_stock: 320,
          min_stock: 50,
          max_stock: 500,
          warehouse_location: 'B02-02-03',
          shelf_life: 180,
          status: 'active',
          last_updated: '2026-01-12 09:15:00'
        },
        {
          id: 3,
          material_id: 3,
          material_name: '电子元件',
          material_code: 'MAT-003',
          specification: 'ELEC-001',
          category: '电子元件',
          unit: '个',
          supplier: '电子公司C',
          unit_price: 15.00,
          current_stock: 45,
          min_stock: 50,
          max_stock: 200,
          warehouse_location: 'C03-01-02',
          shelf_life: 730,
          status: 'active',
          last_updated: '2026-01-11 16:45:00'
        }
      ];
      
      const result = {
        success: true,
        data: {
          items: mockData,
          total: mockData.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        }
      };

      const ttl = this._cacheConfig.moduleTTL.inventory || this._cacheConfig.defaultTTL;
      this._setToCache(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      console.warn('[DataService] 获取库存数据失败，使用mock数据:', error.message);
      
      return {
        success: true,
        data: { items: [], total: 0, page: 1, pageSize: 10 },
        fromMock: true
      };
    }
  }

  static async getInventoryTransactions(params = {}, forceRefresh = false) {
    const cacheKey = this._generateCacheKey('inventory', 'getInventoryTransactions', params);
    
    if (!forceRefresh) {
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Mock inventory transaction data
      const mockData = [
        {
          id: 1,
          transaction_code: 'IN-20260112001',
          type: 'inbound',
          material_id: 1,
          material_name: '塑料原料PVC',
          material_code: 'MAT-001',
          quantity: 200,
          unit: 'kg',
          unit_price: 12.50,
          total_amount: 2500.00,
          warehouse_location: 'A01-01-01',
          supplier: '塑料公司A',
          operator: '张仓管',
          transaction_date: '2026-01-12 08:30:00',
          status: '已完成',
          remarks: '正常入库'
        },
        {
          id: 2,
          transaction_code: 'OUT-20260112001',
          type: 'outbound',
          material_id: 1,
          material_name: '塑料原料PVC',
          material_code: 'MAT-001',
          quantity: 50,
          unit: 'kg',
          unit_price: 12.50,
          total_amount: 625.00,
          warehouse_location: 'A01-01-01',
          recipient: '生产车间A',
          operator: '李仓管',
          transaction_date: '2026-01-12 10:15:00',
          status: '已完成',
          remarks: '生产领料'
        },
        {
          id: 3,
          transaction_code: 'IN-20260112002',
          type: 'inbound',
          material_id: 2,
          material_name: '包装盒材料',
          material_code: 'MAT-002',
          quantity: 100,
          unit: '个',
          unit_price: 2.80,
          total_amount: 280.00,
          warehouse_location: 'B02-02-03',
          supplier: '包装公司B',
          operator: '王仓管',
          transaction_date: '2026-01-12 09:00:00',
          status: '已完成',
          remarks: '采购入库'
        }
      ];
      
      const result = {
        success: true,
        data: {
          items: mockData,
          total: mockData.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        }
      };

      const ttl = this._cacheConfig.moduleTTL.inventory || this._cacheConfig.defaultTTL;
      this._setToCache(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      console.warn('[DataService] 获取库存交易记录失败，使用mock数据:', error.message);
      
      return {
        success: true,
        data: { items: [], total: 0, page: 1, pageSize: 10 },
        fromMock: true
      };
    }
  }

  static async getLocationManagement(params = {}, forceRefresh = false) {
    const cacheKey = this._generateCacheKey('inventory', 'getLocationManagement', params);
    
    if (!forceRefresh) {
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Mock location management data
      const mockData = [
        {
          id: 1,
          locationCode: 'A01-01-01',
          locationName: '原料区A01货架01层01位',
          warehouseCode: 'WH001',
          warehouseName: '原料仓库',
          zoneCode: 'A01',
          zoneName: '原料区A',
          rackCode: 'R001',
          rackName: '货架001',
          level: 1,
          position: 1,
          capacity: 1000,
          currentStock: 850,
          utilization: 85.0,
          status: '正常',
          materialType: '塑料原料',
          lastUpdated: '2026-01-12 10:30:00'
        },
        {
          id: 2,
          locationCode: 'B02-02-03',
          locationName: '成品区B02货架02层03位',
          warehouseCode: 'WH002',
          warehouseName: '成品仓库',
          zoneCode: 'B02',
          zoneName: '成品区B',
          rackCode: 'R015',
          rackName: '货架015',
          level: 2,
          position: 3,
          capacity: 500,
          currentStock: 320,
          utilization: 64.0,
          status: '正常',
          materialType: '成品',
          lastUpdated: '2026-01-12 09:15:00'
        },
        {
          id: 3,
          locationCode: 'C03-01-02',
          locationName: '半成品区C03货架01层02位',
          warehouseCode: 'WH003',
          warehouseName: '半成品仓库',
          zoneCode: 'C03',
          zoneName: '半成品区C',
          rackCode: 'R008',
          rackName: '货架008',
          level: 1,
          position: 2,
          capacity: 800,
          currentStock: 0,
          utilization: 0.0,
          status: '空闲',
          materialType: '半成品',
          lastUpdated: '2026-01-11 16:45:00'
        }
      ];
      
      const result = {
        success: true,
        data: {
          items: mockData,
          total: mockData.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        }
      };

      const ttl = this._cacheConfig.moduleTTL.inventory || this._cacheConfig.defaultTTL;
      this._setToCache(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      console.warn('[DataService] 获取库位管理数据失败，使用mock数据:', error.message);
      
      return {
        success: true,
        data: { items: [], total: 0, page: 1, pageSize: 10 },
        fromMock: true
      };
    }
  }

  static async getProductionReports(params = {}, forceRefresh = false) {
    return { success: true, data: { items: [], total: 0 } };
  }

  static async getQualityReports(params = {}, forceRefresh = false) {
    return { success: true, data: { items: [], total: 0 } };
  }

  static async getEquipmentReports(params = {}, forceRefresh = false) {
    return { success: true, data: { items: [], total: 0 } };
  }

  // ============================================================================
  // 设备档案模块 API
  // ============================================================================

  /**
   * 获取设备档案列表
   * @param {Object} params - 查询参数 { page, pageSize, equipmentCode, category, status }
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 设备档案数据
   */
  static async getEquipmentArchives(params = {}, forceRefresh = false) {
    const cacheKey = this._generateCacheKey('equipment', 'getEquipmentArchives', params);
    
    if (!forceRefresh) {
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Mock设备档案数据
      const mockData = [
        {
          id: 1,
          equipment_code: 'EQ-001',
          equipment_name: '注塑机A1',
          category: '注塑设备',
          model: 'INJ-200T',
          manufacturer: '海天国际',
          purchase_date: '2023-01-15',
          warranty_end_date: '2025-01-15',
          original_value: 150000,
          current_value: 120000,
          location: '车间A',
          status: 'running',
          technical_specs: {
            capacity: '200吨',
            power: '45kW',
            dimensions: '4.5×2.2×2.8m'
          },
          documents: [],
          maintenance_records: 5,
          repair_records: 2,
          remarks: '主力生产设备'
        },
        {
          id: 2,
          equipment_code: 'EQ-002',
          equipment_name: '包装机B1',
          category: '包装设备',
          model: 'PACK-AUTO-500',
          manufacturer: '包装机械公司',
          purchase_date: '2023-03-20',
          warranty_end_date: '2025-03-20',
          original_value: 80000,
          current_value: 68000,
          location: '车间B',
          status: 'idle',
          technical_specs: {
            capacity: '500件/小时',
            power: '15kW',
            dimensions: '3.0×1.5×2.0m'
          },
          documents: [],
          maintenance_records: 3,
          repair_records: 1,
          remarks: '备用设备'
        },
        {
          id: 3,
          equipment_code: 'EQ-003',
          equipment_name: '检测设备C1',
          category: '检测设备',
          model: 'TEST-PRO-100',
          manufacturer: '检测设备公司',
          purchase_date: '2023-06-10',
          warranty_end_date: '2025-06-10',
          original_value: 120000,
          current_value: 105000,
          location: '质检室',
          status: 'maintenance',
          technical_specs: {
            accuracy: '±0.01mm',
            power: '5kW',
            dimensions: '2.0×1.0×1.5m'
          },
          documents: [],
          maintenance_records: 2,
          repair_records: 0,
          remarks: '精密检测设备'
        }
      ];

      // 应用搜索过滤
      let filteredData = mockData;
      if (params.equipmentCode) {
        filteredData = filteredData.filter(item => 
          item.equipment_code.toLowerCase().includes(params.equipmentCode.toLowerCase()) ||
          item.equipment_name.toLowerCase().includes(params.equipmentCode.toLowerCase())
        );
      }
      if (params.category) {
        filteredData = filteredData.filter(item => item.category === params.category);
      }
      if (params.status) {
        filteredData = filteredData.filter(item => item.status === params.status);
      }
      
      const result = {
        success: true,
        data: {
          items: filteredData,
          total: filteredData.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        }
      };

      const ttl = this._cacheConfig.moduleTTL.equipment || this._cacheConfig.defaultTTL;
      this._setToCache(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      console.warn('[DataService] 获取设备档案失败，使用mock数据:', error.message);
      
      return {
        success: true,
        data: { items: [], total: 0, page: 1, pageSize: 10 },
        fromMock: true
      };
    }
  }

  /**
   * 添加设备档案
   * @param {Object} archiveData - 设备档案数据
   * @returns {Promise<Object>} 添加结果
   */
  static async addEquipmentArchive(archiveData) {
    try {
      // 模拟API调用
      console.log('添加设备档案:', archiveData);
      
      // 清除相关缓存
      this.clearCache('equipment');
      
      return {
        success: true,
        data: {
          id: Date.now(),
          ...archiveData,
          equipment_code: archiveData.equipmentCode,
          equipment_name: archiveData.equipmentName,
          purchase_date: archiveData.purchaseDate?.format?.('YYYY-MM-DD') || archiveData.purchaseDate,
          warranty_end_date: archiveData.warrantyEndDate?.format?.('YYYY-MM-DD') || archiveData.warrantyEndDate,
          original_value: archiveData.originalValue,
          current_value: archiveData.currentValue,
          technical_specs: {},
          documents: [],
          maintenance_records: 0,
          repair_records: 0
        },
        message: '设备档案添加成功'
      };
    } catch (error) {
      console.error('[DataService] 添加设备档案失败:', error);
      throw error;
    }
  }

  /**
   * 更新设备档案
   * @param {number} id - 设备档案ID
   * @param {Object} archiveData - 设备档案数据
   * @returns {Promise<Object>} 更新结果
   */
  static async updateEquipmentArchive(id, archiveData) {
    try {
      // 模拟API调用
      console.log('更新设备档案:', id, archiveData);
      
      // 清除相关缓存
      this.clearCache('equipment');
      
      return {
        success: true,
        data: {
          id,
          ...archiveData,
          equipment_code: archiveData.equipmentCode,
          equipment_name: archiveData.equipmentName,
          purchase_date: archiveData.purchaseDate?.format?.('YYYY-MM-DD') || archiveData.purchaseDate,
          warranty_end_date: archiveData.warrantyEndDate?.format?.('YYYY-MM-DD') || archiveData.warrantyEndDate,
          original_value: archiveData.originalValue,
          current_value: archiveData.currentValue
        },
        message: '设备档案更新成功'
      };
    } catch (error) {
      console.error('[DataService] 更新设备档案失败:', error);
      throw error;
    }
  }

  /**
   * 删除设备档案
   * @param {number} id - 设备档案ID
   * @returns {Promise<Object>} 删除结果
   */
  static async deleteEquipmentArchive(id) {
    try {
      // 模拟API调用
      console.log('删除设备档案:', id);
      
      // 清除相关缓存
      this.clearCache('equipment');
      
      return {
        success: true,
        message: '设备档案删除成功'
      };
    } catch (error) {
      console.error('[DataService] 删除设备档案失败:', error);
      throw error;
    }
  }
}

// 自动初始化DataService
if (typeof window !== 'undefined') {
  // 在浏览器环境中自动初始化
  document.addEventListener('DOMContentLoaded', () => {
    DataService.initialize();
  });
  
  // 如果DOM已经加载完成，立即初始化
  if (document.readyState === 'loading') {
    // DOM还在加载中，等待DOMContentLoaded事件
  } else {
    // DOM已经加载完成，立即初始化
    DataService.initialize();
  }
}

export default DataService;