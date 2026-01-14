/**
 * DataPreloader - 数据预加载服务
 * 
 * 功能：
 * - 在应用启动时预加载常用数据
 * - 优化用户体验，减少等待时间
 * - 智能预加载策略
 * - 后台数据更新
 * 
 * Requirements: 10.5
 */

import DataService from './DataService';

/**
 * 数据预加载器类
 */
class DataPreloader {
  constructor() {
    this.preloadQueue = [];
    this.preloadStatus = new Map();
    this.preloadPromises = new Map();
    this.isPreloading = false;
    this.preloadConfig = {
      // 预加载优先级配置
      priority: {
        high: ['production', 'equipment'],
        medium: ['quality', 'inventory'],
        low: ['reports']
      },
      // 预加载延迟配置（毫秒）
      delays: {
        high: 0,
        medium: 1000,
        low: 3000
      },
      // 预加载数据配置
      modules: {
        production: {
          methods: ['getProductionPlans', 'getProductionTasks'],
          params: { page: 1, pageSize: 20 }
        },
        equipment: {
          methods: ['getEquipment', 'getMolds'],
          params: { page: 1, pageSize: 20 }
        },
        quality: {
          methods: ['getQualityInspections', 'getDefectRecords'],
          params: { page: 1, pageSize: 20 }
        },
        inventory: {
          methods: ['getInventory', 'getInventoryTransactions'],
          params: { page: 1, pageSize: 20 }
        },
        reports: {
          methods: ['getProductionReports', 'getQualityReports'],
          params: { page: 1, pageSize: 10 }
        }
      }
    };
  }

  /**
   * 开始预加载数据
   * @param {Object} options - 预加载选项
   * @param {Array} options.modules - 要预加载的模块列表
   * @param {boolean} options.background - 是否在后台执行
   */
  async startPreload(options = {}) {
    const { modules = null, background = true } = options;
    
    if (this.isPreloading) {
      console.log('[DataPreloader] 预加载已在进行中');
      return;
    }

    this.isPreloading = true;
    console.log('[DataPreloader] 开始数据预加载');

    try {
      // 构建预加载队列
      this.buildPreloadQueue(modules);
      
      // 执行预加载
      if (background) {
        this.executeBackgroundPreload();
      } else {
        await this.executePreload();
      }
    } catch (error) {
      console.error('[DataPreloader] 预加载失败:', error);
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * 构建预加载队列
   * @param {Array} targetModules - 目标模块列表
   * @private
   */
  buildPreloadQueue(targetModules = null) {
    this.preloadQueue = [];
    const { priority, modules } = this.preloadConfig;
    
    // 按优先级构建队列
    ['high', 'medium', 'low'].forEach(level => {
      priority[level].forEach(module => {
        if (targetModules && !targetModules.includes(module)) {
          return;
        }
        
        if (modules[module]) {
          modules[module].methods.forEach(method => {
            this.preloadQueue.push({
              module,
              method,
              params: modules[module].params,
              priority: level,
              delay: this.preloadConfig.delays[level]
            });
          });
        }
      });
    });

    console.log(`[DataPreloader] 构建预加载队列，共 ${this.preloadQueue.length} 个任务`);
  }

  /**
   * 执行后台预加载
   * @private
   */
  executeBackgroundPreload() {
    // 使用 setTimeout 确保不阻塞主线程
    setTimeout(() => {
      this.executePreload().catch(error => {
        console.error('[DataPreloader] 后台预加载失败:', error);
      });
    }, 100);
  }

  /**
   * 执行预加载
   * @private
   */
  async executePreload() {
    const startTime = Date.now();
    let successCount = 0;
    let failureCount = 0;

    for (const task of this.preloadQueue) {
      try {
        // 应用延迟
        if (task.delay > 0) {
          await this.delay(task.delay);
        }

        // 执行预加载任务
        await this.executePreloadTask(task);
        successCount++;
        
        console.log(`[DataPreloader] 预加载成功: ${task.module}.${task.method}`);
      } catch (error) {
        failureCount++;
        console.warn(`[DataPreloader] 预加载失败: ${task.module}.${task.method}`, error);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[DataPreloader] 预加载完成: 成功 ${successCount}, 失败 ${failureCount}, 耗时 ${duration}ms`);
  }

  /**
   * 执行单个预加载任务
   * @param {Object} task - 预加载任务
   * @private
   */
  async executePreloadTask(task) {
    const { module, method, params } = task;
    const taskKey = `${module}.${method}`;
    
    // 检查是否已经在预加载中
    if (this.preloadPromises.has(taskKey)) {
      return this.preloadPromises.get(taskKey);
    }

    // 设置预加载状态
    this.preloadStatus.set(taskKey, 'loading');
    
    // 执行预加载
    const promise = DataService[method](params, false); // 不强制刷新缓存
    this.preloadPromises.set(taskKey, promise);

    try {
      const result = await promise;
      this.preloadStatus.set(taskKey, 'success');
      return result;
    } catch (error) {
      this.preloadStatus.set(taskKey, 'error');
      throw error;
    } finally {
      this.preloadPromises.delete(taskKey);
    }
  }

  /**
   * 延迟执行
   * @param {number} ms - 延迟毫秒数
   * @private
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取预加载状态
   * @param {string} module - 模块名
   * @param {string} method - 方法名
   * @returns {string} 预加载状态
   */
  getPreloadStatus(module, method) {
    const taskKey = `${module}.${method}`;
    return this.preloadStatus.get(taskKey) || 'not_started';
  }

  /**
   * 获取所有预加载状态
   * @returns {Object} 预加载状态映射
   */
  getAllPreloadStatus() {
    const status = {};
    for (const [key, value] of this.preloadStatus.entries()) {
      status[key] = value;
    }
    return status;
  }

  /**
   * 清除预加载状态
   */
  clearPreloadStatus() {
    this.preloadStatus.clear();
    this.preloadPromises.clear();
  }

  /**
   * 预加载特定模块
   * @param {string} module - 模块名
   * @param {Object} options - 选项
   */
  async preloadModule(module, options = {}) {
    const { background = true } = options;
    
    if (!this.preloadConfig.modules[module]) {
      console.warn(`[DataPreloader] 未知模块: ${module}`);
      return;
    }

    console.log(`[DataPreloader] 预加载模块: ${module}`);
    
    const tasks = this.preloadConfig.modules[module].methods.map(method => ({
      module,
      method,
      params: this.preloadConfig.modules[module].params,
      priority: 'high',
      delay: 0
    }));

    if (background) {
      setTimeout(() => {
        this.executeModuleTasks(tasks).catch(error => {
          console.error(`[DataPreloader] 模块 ${module} 预加载失败:`, error);
        });
      }, 100);
    } else {
      await this.executeModuleTasks(tasks);
    }
  }

  /**
   * 执行模块任务
   * @param {Array} tasks - 任务列表
   * @private
   */
  async executeModuleTasks(tasks) {
    const promises = tasks.map(task => this.executePreloadTask(task));
    await Promise.allSettled(promises);
  }

  /**
   * 智能预加载
   * 根据用户行为和历史数据决定预加载策略
   * @param {Object} userContext - 用户上下文
   */
  async smartPreload(userContext = {}) {
    const { currentModule, recentModules = [], userRole } = userContext;
    
    // 基于当前模块预加载相关数据
    if (currentModule) {
      await this.preloadModule(currentModule, { background: true });
    }

    // 基于最近访问的模块预加载
    for (const module of recentModules.slice(0, 2)) {
      if (module !== currentModule) {
        await this.preloadModule(module, { background: true });
      }
    }

    // 基于用户角色预加载
    const roleBasedModules = this.getRoleBasedModules(userRole);
    for (const module of roleBasedModules) {
      if (!recentModules.includes(module)) {
        await this.preloadModule(module, { background: true });
      }
    }
  }

  /**
   * 获取基于角色的模块列表
   * @param {string} userRole - 用户角色
   * @returns {Array} 模块列表
   * @private
   */
  getRoleBasedModules(userRole) {
    const roleModules = {
      'production_manager': ['production', 'equipment'],
      'quality_inspector': ['quality', 'production'],
      'warehouse_manager': ['inventory', 'production'],
      'admin': ['production', 'equipment', 'quality', 'inventory']
    };
    
    return roleModules[userRole] || ['production'];
  }

  /**
   * 获取预加载统计信息
   * @returns {Object} 统计信息
   */
  getPreloadStats() {
    const allStatus = this.getAllPreloadStatus();
    const stats = {
      total: Object.keys(allStatus).length,
      success: 0,
      error: 0,
      loading: 0,
      not_started: 0
    };

    Object.values(allStatus).forEach(status => {
      stats[status] = (stats[status] || 0) + 1;
    });

    return stats;
  }
}

// 创建单例实例
const dataPreloader = new DataPreloader();

export default dataPreloader;