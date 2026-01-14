/**
 * EmployeePersistence - 员工数据持久化管理器
 * 
 * 功能：
 * - 专门处理员工数据的持久化操作
 * - 实现员工数据的保存、加载、更新、删除
 * - 提供数据版本控制和迁移机制
 * - 实现数据完整性验证和恢复
 * 
 * Requirements: 1.1, 1.4, 1.5, 4.1, 4.3
 */

import PersistenceManager from './PersistenceManager.js';

/**
 * 员工数据存储配置
 */
const EMPLOYEE_CONFIG = {
  // 存储键
  STORAGE_KEY: 'employees',
  BACKUP_KEY: 'employees_backup',
  METADATA_KEY: 'employees_metadata',
  BACKUP_HISTORY_KEY: 'employees_backup_history',
  EXPORT_KEY: 'employees_export',
  AUDIT_LOG_KEY: 'employees_audit_log',
  STARTUP_FLAG_KEY: 'employees_startup_flag',
  
  // 数据版本
  CURRENT_VERSION: '1.0',
  
  // 数据验证规则
  REQUIRED_FIELDS: ['id', 'name', 'department', 'position'],
  
  // 性能配置
  BATCH_SIZE: 100,
  MAX_EMPLOYEES: 10000,
  
  // 备份配置
  BACKUP_INTERVAL: 30 * 60 * 1000, // 30分钟
  MAX_BACKUP_COUNT: 5, // 最多保留5个备份
  AUTO_BACKUP_ENABLED: false,  // 禁用自动备份以提升性能
  
  // 数据完整性配置
  INTEGRITY_CHECK_INTERVAL: 10 * 60 * 1000, // 10分钟
  CORRUPTION_THRESHOLD: 0.1, // 10%的数据损坏阈值
  
  // 审计日志配置
  AUDIT_LOG_ENABLED: false,  // 禁用审计日志以提升性能
  MAX_AUDIT_LOG_ENTRIES: 1000, // 最多保留1000条审计日志
  AUDIT_LOG_RETENTION_DAYS: 30, // 审计日志保留30天
  
  // 启动检查配置
  STARTUP_INTEGRITY_CHECK: true,
  ABNORMAL_EXIT_DETECTION: true
};

/**
 * 员工数据错误类型
 */
class EmployeeDataError extends Error {
  constructor(message, type, employeeId = null) {
    super(message);
    this.name = 'EmployeeDataError';
    this.type = type;
    this.employeeId = employeeId;
  }
}

/**
 * 员工持久化管理器
 */
class EmployeePersistence {
  /**
   * 数据缓存
   * @private
   */
  static _cache = null;
  
  /**
   * 最后更新时间
   * @private
   */
  static _lastUpdate = null;
  
  /**
   * 备份定时器
   * @private
   */
  static _backupTimer = null;
  
  /**
   * 完整性检查定时器
   * @private
   */
  static _integrityTimer = null;
  
  /**
   * 备份历史记录
   * @private
   */
  static _backupHistory = [];

  /**
   * 审计日志缓存
   * @private
   */
  static _auditLogCache = [];

  /**
   * 会话ID
   * @private
   */
  static _sessionId = null;

  /**
   * 初始化备份和完整性检查机制
   */
  static initialize() {
    console.log('[EmployeePersistence] 初始化备份和完整性检查机制...');
    
    // 检查是否为异常退出后的启动
    this._checkAbnormalExit();
    
    // 设置正常启动标记
    this._setStartupFlag();
    
    // 启动自动备份
    if (EMPLOYEE_CONFIG.AUTO_BACKUP_ENABLED) {
      this._startAutoBackup();
    }
    
    // 启动完整性检查
    this._startIntegrityCheck();
    
    // 加载备份历史
    this._loadBackupHistory();
    
    // 初始化审计日志
    this._initializeAuditLog();
  }

  /**
   * 停止所有定时器
   */
  static cleanup() {
    if (this._backupTimer) {
      clearInterval(this._backupTimer);
      this._backupTimer = null;
    }
    
    if (this._integrityTimer) {
      clearInterval(this._integrityTimer);
      this._integrityTimer = null;
    }
    
    // 清除启动标记，表示正常退出
    this._clearStartupFlag();
    
    console.log('[EmployeePersistence] 清理完成');
  }

  /**
   * 保存员工列表到持久化存储
   * @param {Array} employees - 员工数组
   * @returns {Promise<boolean>} 保存是否成功
   */
  static async saveEmployees(employees) {
    try {
      console.log('[EmployeePersistence] 开始保存员工数据，数量:', employees.length);
      
      // 验证员工数据
      const validatedEmployees = this._validateEmployees(employees);
      
      // 准备存储数据
      const storageData = {
        version: EMPLOYEE_CONFIG.CURRENT_VERSION,
        timestamp: new Date().toISOString(),
        employees: validatedEmployees,
        metadata: {
          count: validatedEmployees.length,
          lastModified: new Date().toISOString(),
          checksum: this._generateDataChecksum(validatedEmployees)
        }
      };
      
      // 保存到持久化存储
      const success = await PersistenceManager.save(
        EMPLOYEE_CONFIG.STORAGE_KEY, 
        storageData
      );
      
      if (success) {
        // 更新缓存
        this._cache = validatedEmployees;
        this._lastUpdate = new Date().toISOString();
        
        // 保存元数据
        await this._saveMetadata(storageData.metadata);
        
        // 记录审计日志
        try {
          await this._logAuditEvent('SAVE_EMPLOYEES', {
            count: validatedEmployees.length,
            checksum: storageData.metadata.checksum,
            success: true
          });
        } catch (auditError) {
          console.warn('[EmployeePersistence] 审计日志记录失败:', auditError);
        }
        
        console.log('[EmployeePersistence] 员工数据保存成功');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('[EmployeePersistence] 保存员工数据失败:', error);
      
      // 记录审计日志（失败情况）
      try {
        await this._logAuditEvent('SAVE_EMPLOYEES', {
          count: employees ? employees.length : 0,
          success: false,
          error: error.message
        });
      } catch (auditError) {
        console.warn('[EmployeePersistence] 审计日志记录失败:', auditError);
      }
      
      // 根据错误类型进行不同处理
      if (error.type === 'STORAGE_FULL') {
        throw new EmployeeDataError('存储空间不足，请清理数据后重试', 'STORAGE_FULL');
      } else if (error.type === 'STORAGE_UNAVAILABLE') {
        console.warn('[EmployeePersistence] 存储不可用，数据已保存到内存模式');
        // 更新缓存，即使存储失败也保持内存中的数据
        this._cache = this._validateEmployees(employees);
        this._lastUpdate = new Date().toISOString();
        return true; // 内存模式下视为成功
      } else {
        throw new EmployeeDataError('保存员工数据失败: ' + error.message, 'SAVE_FAILED');
      }
    }
  }

  /**
   * 从持久化存储加载员工列表
   * @returns {Promise<Array>} 员工数组
   */
  static async loadEmployees() {
    try {
      console.log('[EmployeePersistence] 开始加载员工数据...');
      
      // 检查缓存
      if (this._cache && this._isCacheValid()) {
        console.log('[EmployeePersistence] 使用缓存数据，员工数量:', this._cache.length);
        return [...this._cache]; // 返回副本
      }
      
      // 从持久化存储加载
      const storageData = await PersistenceManager.load(
        EMPLOYEE_CONFIG.STORAGE_KEY,
        null
      );
      
      if (!storageData) {
        console.log('[EmployeePersistence] 未找到持久化数据，返回空数组');
        return [];
      }
      
      // 验证和迁移数据
      const employees = await this._validateAndMigrateData(storageData);
      
      // 更新缓存
      this._cache = employees;
      this._lastUpdate = new Date().toISOString();
      
      console.log('[EmployeePersistence] 员工数据加载成功，数量:', employees.length);
      return [...employees]; // 返回副本
      
    } catch (error) {
      console.error('[EmployeePersistence] 加载员工数据失败:', error);
      
      // 多层降级策略
      try {
        // 1. 尝试从备份恢复
        const backupData = await this._loadFromBackup();
        if (backupData) {
          console.log('[EmployeePersistence] 从备份恢复数据成功，数量:', backupData.length);
          this._cache = backupData;
          this._lastUpdate = new Date().toISOString();
          return [...backupData];
        }
      } catch (backupError) {
        console.warn('[EmployeePersistence] 备份恢复也失败:', backupError);
      }
      
      try {
        // 2. 尝试从元数据恢复部分信息
        const metadata = await PersistenceManager.load(EMPLOYEE_CONFIG.METADATA_KEY);
        if (metadata) {
          console.log('[EmployeePersistence] 找到元数据，但无法恢复完整数据');
        }
      } catch (metadataError) {
        console.warn('[EmployeePersistence] 元数据也无法访问:', metadataError);
      }
      
      // 3. 最后的降级方案：返回空数组，但保持缓存（如果有的话）
      if (this._cache) {
        console.log('[EmployeePersistence] 使用内存缓存作为降级方案，数量:', this._cache.length);
        return [...this._cache];
      }
      
      console.log('[EmployeePersistence] 无法恢复任何数据，返回空数组');
      return [];
    }
  }

  /**
   * 添加单个员工
   * @param {Object} employee - 员工对象
   * @returns {Promise<Object>} 添加的员工对象（包含生成的ID）
   */
  static async addEmployee(employee) {
    try {
      console.log('[EmployeePersistence] 添加员工:', employee.name);
      
      // 验证员工数据
      const validatedEmployee = this._validateSingleEmployee(employee);
      
      // 生成唯一ID（如果没有）
      if (!validatedEmployee.id) {
        validatedEmployee.id = this._generateEmployeeId();
      }
      
      // 添加元数据
      validatedEmployee._persistence = {
        source: 'local',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        syncStatus: 'pending'
      };
      
      // 加载现有员工数据
      const employees = await this.loadEmployees();
      
      // 检查ID冲突
      if (employees.some(emp => emp.id === validatedEmployee.id)) {
        validatedEmployee.id = this._generateEmployeeId();
      }
      
      // 添加到列表
      employees.push(validatedEmployee);
      
      // 保存更新后的列表
      const success = await this.saveEmployees(employees);
      
      if (success) {
        // 记录审计日志
        await this._logAuditEvent('ADD_EMPLOYEE', {
          employeeId: validatedEmployee.id,
          name: validatedEmployee.name,
          department: validatedEmployee.department,
          success: true
        });
        
        console.log('[EmployeePersistence] 员工添加成功, ID:', validatedEmployee.id);
        return validatedEmployee;
      }
      
      throw new EmployeeDataError('保存失败', 'SAVE_FAILED');
      
    } catch (error) {
      console.error('[EmployeePersistence] 添加员工失败:', error);
      
      // 记录审计日志（失败情况）
      try {
        await this._logAuditEvent('ADD_EMPLOYEE', {
          employeeId: employee.id || 'unknown',
          name: employee.name || 'unknown',
          success: false,
          error: error.message
        });
      } catch (auditError) {
        console.warn('[EmployeePersistence] 审计日志记录失败:', auditError);
      }
      
      throw new EmployeeDataError('添加员工失败', 'ADD_FAILED', employee.id);
    }
  }

  /**
   * 更新单个员工
   * @param {number|string} id - 员工ID
   * @param {Object} employeeData - 更新的员工数据
   * @returns {Promise<Object>} 更新后的员工对象
   */
  static async updateEmployee(id, employeeData) {
    try {
      console.log('[EmployeePersistence] 更新员工, ID:', id);
      
      // 加载现有员工数据
      const employees = await this.loadEmployees();
      
      // 查找要更新的员工
      const employeeIndex = employees.findIndex(emp => emp.id == id);
      if (employeeIndex === -1) {
        throw new EmployeeDataError('员工不存在', 'NOT_FOUND', id);
      }
      
      // 合并更新数据
      const updatedEmployee = {
        ...employees[employeeIndex],
        ...employeeData,
        id: employees[employeeIndex].id, // 保持原ID不变
        _persistence: {
          ...employees[employeeIndex]._persistence,
          lastModified: new Date().toISOString(),
          syncStatus: 'pending'
        }
      };
      
      // 验证更新后的数据
      const validatedEmployee = this._validateSingleEmployee(updatedEmployee);
      
      // 更新列表
      employees[employeeIndex] = validatedEmployee;
      
      // 保存更新后的列表
      const success = await this.saveEmployees(employees);
      
      if (success) {
        // 记录审计日志
        await this._logAuditEvent('UPDATE_EMPLOYEE', {
          employeeId: id,
          name: validatedEmployee.name,
          changes: Object.keys(employeeData),
          success: true
        });
        
        console.log('[EmployeePersistence] 员工更新成功, ID:', id);
        return validatedEmployee;
      }
      
      throw new EmployeeDataError('保存失败', 'SAVE_FAILED', id);
      
    } catch (error) {
      console.error('[EmployeePersistence] 更新员工失败:', error);
      
      // 记录审计日志（失败情况）
      try {
        await this._logAuditEvent('UPDATE_EMPLOYEE', {
          employeeId: id,
          success: false,
          error: error.message
        });
      } catch (auditError) {
        console.warn('[EmployeePersistence] 审计日志记录失败:', auditError);
      }
      
      throw new EmployeeDataError('更新员工失败', 'UPDATE_FAILED', id);
    }
  }

  /**
   * 删除单个员工
   * @param {number|string} id - 员工ID
   * @returns {Promise<boolean>} 删除是否成功
   */
  static async deleteEmployee(id) {
    try {
      console.log('[EmployeePersistence] 删除员工, ID:', id);
      
      // 加载现有员工数据
      const employees = await this.loadEmployees();
      
      // 查找要删除的员工
      const employeeIndex = employees.findIndex(emp => emp.id == id);
      if (employeeIndex === -1) {
        console.warn('[EmployeePersistence] 要删除的员工不存在, ID:', id);
        return true; // 已经不存在，视为删除成功
      }
      
      // 从列表中移除
      employees.splice(employeeIndex, 1);
      
      // 保存更新后的列表
      const success = await this.saveEmployees(employees);
      
      if (success) {
        // 记录审计日志
        await this._logAuditEvent('DELETE_EMPLOYEE', {
          employeeId: id,
          success: true
        });
        
        console.log('[EmployeePersistence] 员工删除成功, ID:', id);
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('[EmployeePersistence] 删除员工失败:', error);
      
      // 记录审计日志（失败情况）
      try {
        await this._logAuditEvent('DELETE_EMPLOYEE', {
          employeeId: id,
          success: false,
          error: error.message
        });
      } catch (auditError) {
        console.warn('[EmployeePersistence] 审计日志记录失败:', auditError);
      }
      
      throw new EmployeeDataError('删除员工失败', 'DELETE_FAILED', id);
    }
  }

  /**
   * 清除所有员工数据
   * @returns {Promise<boolean>} 清除是否成功
   */
  static async clearAllEmployees() {
    try {
      console.log('[EmployeePersistence] 清除所有员工数据...');
      
      // 清除主数据
      const success1 = await PersistenceManager.remove(EMPLOYEE_CONFIG.STORAGE_KEY);
      
      // 清除备份数据
      const success2 = await PersistenceManager.remove(EMPLOYEE_CONFIG.BACKUP_KEY);
      
      // 清除元数据
      const success3 = await PersistenceManager.remove(EMPLOYEE_CONFIG.METADATA_KEY);
      
      // 清除缓存
      this._cache = null;
      this._lastUpdate = null;
      
      console.log('[EmployeePersistence] 所有员工数据清除完成');
      return success1; // 主要关心主数据的清除结果
      
    } catch (error) {
      console.error('[EmployeePersistence] 清除员工数据失败:', error);
      return false;
    }
  }

  /**
   * 获取员工数据统计信息
   * @returns {Promise<Object>} 统计信息
   */
  static async getEmployeeStats() {
    try {
      const employees = await this.loadEmployees();
      
      // 按部门统计
      const departmentStats = {};
      employees.forEach(emp => {
        const dept = emp.department || '未知部门';
        departmentStats[dept] = (departmentStats[dept] || 0) + 1;
      });
      
      // 按职位统计
      const positionStats = {};
      employees.forEach(emp => {
        const pos = emp.position || '未知职位';
        positionStats[pos] = (positionStats[pos] || 0) + 1;
      });
      
      // 获取存储状态信息
      const storageInfo = PersistenceManager.getStorageInfo();
      
      return {
        total: employees.length,
        departments: departmentStats,
        positions: positionStats,
        lastUpdate: this._lastUpdate,
        cacheStatus: this._cache ? 'cached' : 'not_cached',
        storage: {
          type: storageInfo.storageType,
          usage: storageInfo.usage,
          isNearLimit: storageInfo.usage.isNearLimit,
          available: storageInfo.usage.percentage < 100
        }
      };
      
    } catch (error) {
      console.error('[EmployeePersistence] 获取统计信息失败:', error);
      return {
        total: 0,
        departments: {},
        positions: {},
        lastUpdate: null,
        cacheStatus: 'error',
        storage: {
          type: 'unknown',
          usage: { percentage: 0, isNearLimit: false },
          available: false
        }
      };
    }
  }

  /**
   * 获取存储健康状态
   * @returns {Promise<Object>} 存储健康状态
   */
  static async getStorageHealth() {
    try {
      const storageInfo = PersistenceManager.getStorageInfo();
      const employees = await this.loadEmployees();
      
      return {
        status: storageInfo.storageType === 'memory' ? 'degraded' : 'healthy',
        storageType: storageInfo.storageType,
        dataIntegrity: employees.length > 0 ? 'good' : 'empty',
        cacheStatus: this._cache ? 'active' : 'inactive',
        lastUpdate: this._lastUpdate,
        warnings: this._generateHealthWarnings(storageInfo, employees),
        recommendations: this._generateHealthRecommendations(storageInfo, employees)
      };
    } catch (error) {
      console.error('[EmployeePersistence] 获取存储健康状态失败:', error);
      return {
        status: 'error',
        storageType: 'unknown',
        dataIntegrity: 'unknown',
        cacheStatus: 'unknown',
        lastUpdate: null,
        warnings: ['无法获取存储状态'],
        recommendations: ['请检查浏览器存储设置']
      };
    }
  }

  // ============================================================================
  // 批量操作功能
  // ============================================================================

  /**
   * 批量添加员工（优化版）
   * @param {Array} employeesData - 员工数据数组
   * @param {Object} options - 批量操作选项
   * @returns {Promise<Object>} 批量添加结果
   */
  static async batchAddEmployees(employeesData, options = {}) {
    try {
      const {
        chunkSize = 100,
        validateAll = true,
        skipDuplicates = true,
        progressCallback = null,
        optimizeStorage = true
      } = options;
      
      console.log('[EmployeePersistence] 开始优化批量添加员工，数量:', employeesData.length);
      
      const results = {
        success: 0,
        failed: 0,
        skipped: 0,
        errors: [],
        addedEmployees: [],
        duplicates: [],
        performance: {
          validationTime: 0,
          processingTime: 0,
          storageTime: 0
        }
      };
      
      const startTime = performance.now();
      
      // 阶段1: 批量验证
      let validationStart = performance.now();
      const validatedEmployees = [];
      const existingEmployees = await this.loadEmployees();
      const existingIds = new Set(existingEmployees.map(emp => emp.id));
      const existingNames = new Set(existingEmployees.map(emp => emp.name.toLowerCase()));
      
      for (let i = 0; i < employeesData.length; i++) {
        try {
          const employee = employeesData[i];
          
          // 跳过重复员工
          if (skipDuplicates) {
            if (employee.name && existingNames.has(employee.name.toLowerCase())) {
              results.skipped++;
              results.duplicates.push({
                index: i,
                name: employee.name,
                reason: 'duplicate_name'
              });
              continue;
            }
          }
          
          const validatedEmployee = this._validateSingleEmployee(employee);
          
          // 生成唯一ID
          if (!validatedEmployee.id) {
            validatedEmployee.id = this._generateEmployeeId();
          }
          
          // 确保ID唯一
          while (existingIds.has(validatedEmployee.id)) {
            validatedEmployee.id = this._generateEmployeeId();
          }
          existingIds.add(validatedEmployee.id);
          
          // 添加元数据
          validatedEmployee._persistence = {
            source: 'batch_add',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            syncStatus: 'pending',
            batchId: Date.now()
          };
          
          validatedEmployees.push(validatedEmployee);
          results.success++;
          
        } catch (error) {
          results.failed++;
          results.errors.push({
            index: i,
            employee: employeesData[i],
            error: error.message
          });
        }
        
        // 进度回调
        if (progressCallback && i % 50 === 0) {
          const progress = (i / employeesData.length) * 50; // 验证阶段占50%
          progressCallback(progress, { phase: 'validation', processed: i + 1, total: employeesData.length });
        }
      }
      
      results.performance.validationTime = performance.now() - validationStart;
      
      if (validatedEmployees.length === 0) {
        throw new EmployeeDataError('没有有效的员工数据可以添加', 'NO_VALID_DATA');
      }
      
      // 阶段2: 分块处理和存储
      let processingStart = performance.now();
      const allEmployees = [...existingEmployees, ...validatedEmployees];
      
      // 如果启用存储优化，使用批量保存
      if (optimizeStorage && validatedEmployees.length > 10) {
        const chunks = this._chunkArray(validatedEmployees, chunkSize);
        
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          
          // 处理当前块
          allEmployees.splice(existingEmployees.length, 0, ...chunk);
          
          // 进度回调
          if (progressCallback) {
            const progress = 50 + ((i + 1) / chunks.length) * 50; // 处理阶段占50%
            progressCallback(progress, { 
              phase: 'processing', 
              chunk: i + 1, 
              totalChunks: chunks.length,
              processed: (i + 1) * chunkSize
            });
          }
        }
      }
      
      results.performance.processingTime = performance.now() - processingStart;
      
      // 阶段3: 保存到存储
      let storageStart = performance.now();
      const saveSuccess = await this.saveEmployees(allEmployees);
      results.performance.storageTime = performance.now() - storageStart;
      
      if (saveSuccess) {
        results.addedEmployees = validatedEmployees;
        
        // 记录批量审计日志
        await this._logAuditEvent('BATCH_ADD_EMPLOYEES', {
          totalAttempted: employeesData.length,
          successful: results.success,
          failed: results.failed,
          skipped: results.skipped,
          batchSize: employeesData.length,
          performance: results.performance,
          optimized: optimizeStorage
        });
        
        const totalTime = performance.now() - startTime;
        console.log('[EmployeePersistence] 优化批量添加员工完成');
        console.log(`  - 成功: ${results.success}, 失败: ${results.failed}, 跳过: ${results.skipped}`);
        console.log(`  - 总耗时: ${totalTime.toFixed(2)}ms`);
        console.log(`  - 验证耗时: ${results.performance.validationTime.toFixed(2)}ms`);
        console.log(`  - 处理耗时: ${results.performance.processingTime.toFixed(2)}ms`);
        console.log(`  - 存储耗时: ${results.performance.storageTime.toFixed(2)}ms`);
        
        return {
          success: true,
          results: results,
          message: `批量添加完成，成功 ${results.success} 个，失败 ${results.failed} 个，跳过 ${results.skipped} 个`,
          performance: results.performance
        };
      }
      
      throw new EmployeeDataError('批量保存失败', 'BATCH_SAVE_FAILED');
      
    } catch (error) {
      console.error('[EmployeePersistence] 优化批量添加员工失败:', error);
      
      // 记录失败的审计日志
      try {
        await this._logAuditEvent('BATCH_ADD_EMPLOYEES', {
          totalAttempted: employeesData.length,
          successful: 0,
          failed: employeesData.length,
          success: false,
          error: error.message
        });
      } catch (auditError) {
        console.warn('[EmployeePersistence] 审计日志记录失败:', auditError);
      }
      
      throw new EmployeeDataError('优化批量添加员工失败', 'BATCH_ADD_FAILED');
    }
  }

  /**
   * 分块数组
   * @private
   */
  static _chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * 批量更新员工
   * @param {Array} updates - 更新数据数组 [{id, data}]
   * @returns {Promise<Object>} 批量更新结果
   */
  static async batchUpdateEmployees(updates) {
    try {
      console.log('[EmployeePersistence] 开始批量更新员工，数量:', updates.length);
      
      const results = {
        success: 0,
        failed: 0,
        errors: [],
        updatedEmployees: []
      };
      
      // 加载现有员工数据
      const employees = await this.loadEmployees();
      const employeeMap = new Map(employees.map(emp => [emp.id, emp]));
      
      // 处理每个更新
      for (let i = 0; i < updates.length; i++) {
        try {
          const { id, data } = updates[i];
          
          if (!employeeMap.has(id)) {
            results.failed++;
            results.errors.push({
              index: i,
              id: id,
              error: '员工不存在'
            });
            continue;
          }
          
          // 合并更新数据
          const existingEmployee = employeeMap.get(id);
          const updatedEmployee = {
            ...existingEmployee,
            ...data,
            id: existingEmployee.id, // 保持原ID不变
            _persistence: {
              ...existingEmployee._persistence,
              lastModified: new Date().toISOString(),
              syncStatus: 'pending'
            }
          };
          
          // 验证更新后的数据
          const validatedEmployee = this._validateSingleEmployee(updatedEmployee);
          
          // 更新映射
          employeeMap.set(id, validatedEmployee);
          results.updatedEmployees.push(validatedEmployee);
          results.success++;
          
        } catch (error) {
          results.failed++;
          results.errors.push({
            index: i,
            id: updates[i].id,
            error: error.message
          });
        }
      }
      
      if (results.success > 0) {
        // 保存更新后的员工列表
        const updatedEmployees = Array.from(employeeMap.values());
        const saveSuccess = await this.saveEmployees(updatedEmployees);
        
        if (saveSuccess) {
          console.log('[EmployeePersistence] 批量更新员工成功，成功:', results.success, '失败:', results.failed);
          
          return {
            success: true,
            results: results,
            message: `批量更新完成，成功 ${results.success} 个，失败 ${results.failed} 个`
          };
        }
      }
      
      throw new EmployeeDataError('批量保存失败', 'BATCH_SAVE_FAILED');
      
    } catch (error) {
      console.error('[EmployeePersistence] 批量更新员工失败:', error);
      throw new EmployeeDataError('批量更新员工失败', 'BATCH_UPDATE_FAILED');
    }
  }

  /**
   * 批量删除员工
   * @param {Array} ids - 员工ID数组
   * @returns {Promise<Object>} 批量删除结果
   */
  static async batchDeleteEmployees(ids) {
    try {
      console.log('[EmployeePersistence] 开始批量删除员工，数量:', ids.length);
      
      const results = {
        success: 0,
        failed: 0,
        errors: [],
        deletedIds: []
      };
      
      // 加载现有员工数据
      const employees = await this.loadEmployees();
      const existingIds = new Set(employees.map(emp => emp.id));
      
      // 检查哪些ID存在
      const idsToDelete = [];
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        if (existingIds.has(id)) {
          idsToDelete.push(id);
          results.deletedIds.push(id);
          results.success++;
        } else {
          results.failed++;
          results.errors.push({
            index: i,
            id: id,
            error: '员工不存在'
          });
        }
      }
      
      if (idsToDelete.length > 0) {
        // 过滤掉要删除的员工
        const remainingEmployees = employees.filter(emp => !idsToDelete.includes(emp.id));
        
        // 保存更新后的员工列表
        const saveSuccess = await this.saveEmployees(remainingEmployees);
        
        if (saveSuccess) {
          console.log('[EmployeePersistence] 批量删除员工成功，成功:', results.success, '失败:', results.failed);
          
          return {
            success: true,
            results: results,
            message: `批量删除完成，成功 ${results.success} 个，失败 ${results.failed} 个`
          };
        }
      }
      
      return {
        success: results.failed === 0,
        results: results,
        message: `批量删除完成，成功 ${results.success} 个，失败 ${results.failed} 个`
      };
      
    } catch (error) {
      console.error('[EmployeePersistence] 批量删除员工失败:', error);
      throw new EmployeeDataError('批量删除员工失败', 'BATCH_DELETE_FAILED');
    }
  }

  // ============================================================================
  // 性能优化功能
  // ============================================================================

  /**
   * 分页加载员工数据
   * @param {Object} options - 分页选项 {page, pageSize, filter, sort}
   * @returns {Promise<Object>} 分页结果
   */
  static async loadEmployeesPaginated(options = {}) {
    try {
      const {
        page = 1,
        pageSize = 50,
        filter = null,
        sort = null
      } = options;
      
      console.log(`[EmployeePersistence] 分页加载员工数据，页码: ${page}, 页大小: ${pageSize}`);
      
      // 加载所有员工数据
      const allEmployees = await this.loadEmployees();
      
      // 应用过滤器
      let filteredEmployees = allEmployees;
      if (filter && typeof filter === 'function') {
        filteredEmployees = allEmployees.filter(filter);
      }
      
      // 应用排序
      if (sort && typeof sort === 'function') {
        filteredEmployees.sort(sort);
      }
      
      // 计算分页
      const total = filteredEmployees.length;
      const totalPages = Math.ceil(total / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, total);
      
      const pageData = filteredEmployees.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: {
          items: pageData,
          pagination: {
            page: page,
            pageSize: pageSize,
            total: total,
            totalPages: totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      };
      
    } catch (error) {
      console.error('[EmployeePersistence] 分页加载失败:', error);
      throw new EmployeeDataError('分页加载失败', 'PAGINATED_LOAD_FAILED');
    }
  }

  /**
   * 搜索员工（优化版）
   * @param {Object} searchOptions - 搜索选项
   * @returns {Promise<Array>} 搜索结果
   */
  static async searchEmployees(searchOptions = {}) {
    try {
      const {
        keyword = '',
        department = '',
        position = '',
        status = '',
        limit = 100,
        useIndices = true,
        fuzzySearch = false,
        sortBy = null,
        sortOrder = 'asc'
      } = searchOptions;
      
      console.log('[EmployeePersistence] 开始优化搜索员工，关键词:', keyword);
      
      const startTime = performance.now();
      let employees = await this.loadEmployees();
      let results = [];
      
      // 如果启用索引且索引存在，使用索引搜索
      if (useIndices && this._searchIndices) {
        results = await this._searchWithIndices(employees, searchOptions);
      } else {
        // 传统搜索方式
        results = await this._searchTraditional(employees, searchOptions);
      }
      
      // 模糊搜索
      if (fuzzySearch && keyword) {
        results = this._applyFuzzySearch(results, keyword);
      }
      
      // 排序
      if (sortBy) {
        results = this._sortResults(results, sortBy, sortOrder);
      }
      
      // 限制结果数量
      if (limit > 0) {
        results = results.slice(0, limit);
      }
      
      const duration = performance.now() - startTime;
      console.log(`[EmployeePersistence] 优化搜索完成，找到 ${results.length} 个结果，耗时: ${duration.toFixed(2)}ms`);
      
      return results;
      
    } catch (error) {
      console.error('[EmployeePersistence] 优化搜索员工失败:', error);
      throw new EmployeeDataError('优化搜索员工失败', 'SEARCH_FAILED');
    }
  }

  /**
   * 使用索引搜索
   * @private
   */
  static async _searchWithIndices(employees, searchOptions) {
    const { keyword, department, position, status } = searchOptions;
    let candidateIndices = new Set();
    let firstFilter = true;
    
    // 部门过滤
    if (department && this._searchIndices.byDepartment.has(department)) {
      const indices = this._searchIndices.byDepartment.get(department);
      if (firstFilter) {
        candidateIndices = new Set(indices);
        firstFilter = false;
      } else {
        candidateIndices = new Set([...candidateIndices].filter(i => indices.includes(i)));
      }
    }
    
    // 职位过滤
    if (position && this._searchIndices.byPosition.has(position)) {
      const indices = this._searchIndices.byPosition.get(position);
      if (firstFilter) {
        candidateIndices = new Set(indices);
        firstFilter = false;
      } else {
        candidateIndices = new Set([...candidateIndices].filter(i => indices.includes(i)));
      }
    }
    
    // 状态过滤
    if (status && this._searchIndices.byStatus.has(status)) {
      const indices = this._searchIndices.byStatus.get(status);
      if (firstFilter) {
        candidateIndices = new Set(indices);
        firstFilter = false;
      } else {
        candidateIndices = new Set([...candidateIndices].filter(i => indices.includes(i)));
      }
    }
    
    // 如果没有使用任何索引过滤，使用所有员工
    if (firstFilter) {
      candidateIndices = new Set(employees.map((_, index) => index));
    }
    
    // 关键词搜索
    let results = [...candidateIndices].map(index => employees[index]);
    
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      results = results.filter(emp => 
        emp.name?.toLowerCase().includes(lowerKeyword) ||
        emp.employeeId?.toLowerCase().includes(lowerKeyword) ||
        emp.phone?.toLowerCase().includes(lowerKeyword) ||
        emp.email?.toLowerCase().includes(lowerKeyword)
      );
    }
    
    return results;
  }

  /**
   * 传统搜索方式
   * @private
   */
  static async _searchTraditional(employees, searchOptions) {
    const { keyword, department, position, status } = searchOptions;
    let results = employees;
    
    // 关键词搜索
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      results = results.filter(emp => 
        emp.name?.toLowerCase().includes(lowerKeyword) ||
        emp.employeeId?.toLowerCase().includes(lowerKeyword) ||
        emp.phone?.toLowerCase().includes(lowerKeyword) ||
        emp.email?.toLowerCase().includes(lowerKeyword)
      );
    }
    
    // 部门过滤
    if (department) {
      results = results.filter(emp => emp.department === department);
    }
    
    // 职位过滤
    if (position) {
      results = results.filter(emp => emp.position === position);
    }
    
    // 状态过滤
    if (status) {
      results = results.filter(emp => emp.status === status);
    }
    
    return results;
  }

  /**
   * 应用模糊搜索
   * @private
   */
  static _applyFuzzySearch(results, keyword) {
    const lowerKeyword = keyword.toLowerCase();
    
    return results.map(emp => {
      let score = 0;
      
      // 计算匹配分数
      if (emp.name?.toLowerCase().includes(lowerKeyword)) score += 10;
      if (emp.employeeId?.toLowerCase().includes(lowerKeyword)) score += 8;
      if (emp.department?.toLowerCase().includes(lowerKeyword)) score += 5;
      if (emp.position?.toLowerCase().includes(lowerKeyword)) score += 5;
      if (emp.phone?.toLowerCase().includes(lowerKeyword)) score += 3;
      if (emp.email?.toLowerCase().includes(lowerKeyword)) score += 3;
      
      // 计算编辑距离（简化版）
      const nameDistance = this._calculateEditDistance(emp.name?.toLowerCase() || '', lowerKeyword);
      if (nameDistance <= 2) score += (3 - nameDistance);
      
      return { ...emp, _searchScore: score };
    })
    .filter(emp => emp._searchScore > 0)
    .sort((a, b) => b._searchScore - a._searchScore)
    .map(emp => {
      delete emp._searchScore;
      return emp;
    });
  }

  /**
   * 计算编辑距离（简化版）
   * @private
   */
  static _calculateEditDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0) return len2;
    if (len2 === 0) return len1;
    
    const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));
    
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    
    return matrix[len1][len2];
  }

  /**
   * 排序结果
   * @private
   */
  static _sortResults(results, sortBy, sortOrder) {
    return results.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      // 处理不同数据类型
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * 获取员工统计信息（优化版）
   * @returns {Promise<Object>} 统计信息
   */
  static async getEmployeeStatsOptimized() {
    try {
      // 检查缓存
      const cacheKey = 'employee_stats';
      const cached = this._statsCache?.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 60000) { // 1分钟缓存
        return cached.data;
      }
      
      const employees = await this.loadEmployees();
      
      // 使用Map提高统计性能
      const departmentMap = new Map();
      const positionMap = new Map();
      const statusMap = new Map();
      
      employees.forEach(emp => {
        // 部门统计
        const dept = emp.department || '未知部门';
        departmentMap.set(dept, (departmentMap.get(dept) || 0) + 1);
        
        // 职位统计
        const pos = emp.position || '未知职位';
        positionMap.set(pos, (positionMap.get(pos) || 0) + 1);
        
        // 状态统计
        const status = emp.status || '未知状态';
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      });
      
      const stats = {
        total: employees.length,
        departments: Object.fromEntries(departmentMap),
        positions: Object.fromEntries(positionMap),
        statuses: Object.fromEntries(statusMap),
        lastUpdate: this._lastUpdate,
        cacheStatus: this._cache ? 'cached' : 'not_cached',
        performance: {
          compressionEnabled: EMPLOYEE_CONFIG.COMPRESSION_ENABLED,
          backupEnabled: EMPLOYEE_CONFIG.AUTO_BACKUP_ENABLED,
          cacheHit: cached ? true : false
        }
      };
      
      // 缓存统计结果
      if (!this._statsCache) {
        this._statsCache = new Map();
      }
      this._statsCache.set(cacheKey, {
        data: stats,
        timestamp: Date.now()
      });
      
      return stats;
      
    } catch (error) {
      console.error('[EmployeePersistence] 获取优化统计信息失败:', error);
      return {
        total: 0,
        departments: {},
        positions: {},
        statuses: {},
        lastUpdate: null,
        cacheStatus: 'error',
        performance: {
          compressionEnabled: false,
          backupEnabled: false,
          cacheHit: false
        }
      };
    }
  }

  /**
   * 数据压缩和优化（增强版）
   * @param {Object} options - 优化选项
   * @returns {Promise<Object>} 优化结果
   */
  static async optimizeData(options = {}) {
    try {
      const {
        deepCleanup = true,
        compressData = true,
        defragmentStorage = true,
        optimizeIndices = true,
        progressCallback = null
      } = options;
      
      console.log('[EmployeePersistence] 开始增强数据优化...');
      
      const startTime = performance.now();
      const results = {
        phases: [],
        employeeCount: 0,
        spaceSaved: 0,
        optimizationDetails: {},
        performance: {}
      };
      
      // 阶段1: 数据分析
      if (progressCallback) progressCallback(5, { phase: 'analysis' });
      
      const analysisStart = performance.now();
      const employees = await this.loadEmployees();
      const dataAnalysis = await this._performDataAnalysis(employees);
      
      results.phases.push({
        phase: 'analysis',
        duration: performance.now() - analysisStart,
        findings: dataAnalysis
      });
      
      // 阶段2: 深度清理
      if (deepCleanup) {
        if (progressCallback) progressCallback(20, { phase: 'deep_cleanup' });
        
        const cleanupStart = performance.now();
        const cleanupResult = await this._performDeepCleanup(employees, dataAnalysis);
        
        results.phases.push({
          phase: 'deep_cleanup',
          duration: performance.now() - cleanupStart,
          ...cleanupResult
        });
        
        results.spaceSaved += cleanupResult.spaceSaved || 0;
      }
      
      // 阶段3: 数据压缩优化
      if (compressData) {
        if (progressCallback) progressCallback(40, { phase: 'compression' });
        
        const compressionStart = performance.now();
        const compressionResult = await this._optimizeDataCompression();
        
        results.phases.push({
          phase: 'compression',
          duration: performance.now() - compressionStart,
          ...compressionResult
        });
        
        results.spaceSaved += compressionResult.spaceSaved || 0;
      }
      
      // 阶段4: 存储碎片整理
      if (defragmentStorage) {
        if (progressCallback) progressCallback(60, { phase: 'defragmentation' });
        
        const defragStart = performance.now();
        const defragResult = await this._performStorageDefragmentation();
        
        results.phases.push({
          phase: 'defragmentation',
          duration: performance.now() - defragStart,
          ...defragResult
        });
        
        results.spaceSaved += defragResult.spaceSaved || 0;
      }
      
      // 阶段5: 索引优化
      if (optimizeIndices) {
        if (progressCallback) progressCallback(80, { phase: 'index_optimization' });
        
        const indexStart = performance.now();
        const indexResult = await this._optimizeDataIndices(employees);
        
        results.phases.push({
          phase: 'index_optimization',
          duration: performance.now() - indexStart,
          ...indexResult
        });
      }
      
      // 阶段6: 执行PersistenceManager维护
      if (progressCallback) progressCallback(90, { phase: 'storage_maintenance' });
      
      const maintenanceStart = performance.now();
      const maintenanceResult = await PersistenceManager.performMaintenance({
        cleanExpired: true,
        cleanCorrupted: true,
        optimizeStorage: true,
        compactData: true,
        defragmentStorage: true,
        aggressiveCleanup: deepCleanup,
        progressCallback: (progress, data) => {
          if (progressCallback) {
            progressCallback(90 + (progress * 0.1), { phase: 'storage_maintenance', ...data });
          }
        }
      });
      
      results.phases.push({
        phase: 'storage_maintenance',
        duration: performance.now() - maintenanceStart,
        maintenance: maintenanceResult.results
      });
      
      results.spaceSaved += maintenanceResult.results?.spaceSaved || 0;
      
      // 清理缓存
      this._cache = null;
      this._lastUpdate = null;
      
      // 清理统计缓存
      if (this._statsCache) {
        this._statsCache.clear();
      }
      
      // 重新加载数据以验证优化结果
      const finalEmployees = await this.loadEmployees();
      results.employeeCount = finalEmployees.length;
      
      const totalDuration = performance.now() - startTime;
      results.performance.totalDuration = totalDuration;
      
      const result = {
        success: maintenanceResult.success,
        ...results,
        message: '增强数据优化完成'
      };
      
      console.log('[EmployeePersistence] 增强数据优化完成:', result);
      
      if (progressCallback) progressCallback(100, { phase: 'completed', result });
      
      return result;
      
    } catch (error) {
      console.error('[EmployeePersistence] 增强数据优化失败:', error);
      return {
        success: false,
        error: error.message,
        message: '增强数据优化失败'
      };
    }
  }

  /**
   * 执行数据分析
   * @private
   */
  static async _performDataAnalysis(employees) {
    const analysis = {
      totalEmployees: employees.length,
      dataQuality: {
        complete: 0,
        incomplete: 0,
        duplicates: 0,
        inconsistencies: 0
      },
      fieldAnalysis: {},
      sizeAnalysis: {
        totalSize: 0,
        averageSize: 0,
        largestEmployee: null,
        smallestEmployee: null
      },
      recommendations: []
    };
    
    const fieldCounts = {};
    const duplicateCheck = new Map();
    let totalSize = 0;
    let maxSize = 0;
    let minSize = Infinity;
    
    employees.forEach((emp, index) => {
      const empString = JSON.stringify(emp);
      const empSize = empString.length;
      totalSize += empSize;
      
      // 大小分析
      if (empSize > maxSize) {
        maxSize = empSize;
        analysis.sizeAnalysis.largestEmployee = { index, id: emp.id, size: empSize };
      }
      if (empSize < minSize) {
        minSize = empSize;
        analysis.sizeAnalysis.smallestEmployee = { index, id: emp.id, size: empSize };
      }
      
      // 数据完整性检查
      const requiredFields = EMPLOYEE_CONFIG.REQUIRED_FIELDS;
      const missingFields = requiredFields.filter(field => !emp[field]);
      
      if (missingFields.length === 0) {
        analysis.dataQuality.complete++;
      } else {
        analysis.dataQuality.incomplete++;
      }
      
      // 字段分析
      Object.keys(emp).forEach(field => {
        if (!fieldCounts[field]) {
          fieldCounts[field] = { count: 0, emptyCount: 0 };
        }
        fieldCounts[field].count++;
        if (!emp[field] || emp[field] === '') {
          fieldCounts[field].emptyCount++;
        }
      });
      
      // 重复检查
      const key = `${emp.name}_${emp.department}_${emp.position}`;
      if (duplicateCheck.has(key)) {
        analysis.dataQuality.duplicates++;
      } else {
        duplicateCheck.set(key, true);
      }
    });
    
    analysis.sizeAnalysis.totalSize = totalSize;
    analysis.sizeAnalysis.averageSize = employees.length > 0 ? totalSize / employees.length : 0;
    analysis.fieldAnalysis = fieldCounts;
    
    // 生成建议
    if (analysis.dataQuality.incomplete > 0) {
      analysis.recommendations.push(`发现 ${analysis.dataQuality.incomplete} 个员工数据不完整`);
    }
    if (analysis.dataQuality.duplicates > 0) {
      analysis.recommendations.push(`发现 ${analysis.dataQuality.duplicates} 个可能的重复员工`);
    }
    if (analysis.sizeAnalysis.averageSize > 2048) {
      analysis.recommendations.push('员工数据平均大小较大，建议启用压缩');
    }
    
    return analysis;
  }

  /**
   * 执行深度清理
   * @private
   */
  static async _performDeepCleanup(employees, analysis) {
    const result = {
      cleanedEmployees: 0,
      normalizedFields: 0,
      removedDuplicates: 0,
      spaceSaved: 0
    };
    
    const cleanedEmployees = [];
    const seenEmployees = new Map();
    
    for (const emp of employees) {
      let cleaned = false;
      const originalSize = JSON.stringify(emp).length;
      
      // 创建清理后的员工副本
      const cleanedEmp = { ...emp };
      
      // 字段标准化
      if (cleanedEmp.name) {
        const normalizedName = cleanedEmp.name.trim().replace(/\s+/g, ' ');
        if (normalizedName !== cleanedEmp.name) {
          cleanedEmp.name = normalizedName;
          result.normalizedFields++;
          cleaned = true;
        }
      }
      
      if (cleanedEmp.department) {
        const normalizedDept = cleanedEmp.department.trim();
        if (normalizedDept !== cleanedEmp.department) {
          cleanedEmp.department = normalizedDept;
          result.normalizedFields++;
          cleaned = true;
        }
      }
      
      if (cleanedEmp.position) {
        const normalizedPos = cleanedEmp.position.trim();
        if (normalizedPos !== cleanedEmp.position) {
          cleanedEmp.position = normalizedPos;
          result.normalizedFields++;
          cleaned = true;
        }
      }
      
      // 移除空字段
      Object.keys(cleanedEmp).forEach(key => {
        if (cleanedEmp[key] === '' || cleanedEmp[key] === null) {
          delete cleanedEmp[key];
          cleaned = true;
        }
      });
      
      // 重复检查
      const empKey = `${cleanedEmp.name}_${cleanedEmp.department}_${cleanedEmp.position}`;
      if (seenEmployees.has(empKey)) {
        result.removedDuplicates++;
        continue; // 跳过重复员工
      }
      seenEmployees.set(empKey, true);
      
      if (cleaned) {
        result.cleanedEmployees++;
        const newSize = JSON.stringify(cleanedEmp).length;
        result.spaceSaved += (originalSize - newSize);
      }
      
      cleanedEmployees.push(cleanedEmp);
    }
    
    // 如果有清理，保存清理后的数据
    if (result.cleanedEmployees > 0 || result.removedDuplicates > 0) {
      await this.saveEmployees(cleanedEmployees);
    }
    
    return result;
  }

  /**
   * 优化数据压缩
   * @private
   */
  static async _optimizeDataCompression() {
    const result = {
      compressedItems: 0,
      spaceSaved: 0,
      compressionRatio: 1.0
    };
    
    try {
      // 获取当前存储信息
      const storageInfo = PersistenceManager.getStorageInfo();
      
      // 如果存储使用率高，启用更激进的压缩
      if (storageInfo.usage.percentage > 50) {
        console.log('[EmployeePersistence] 启用激进压缩模式');
        
        // 重新保存员工数据以触发压缩
        const employees = await this.loadEmployees();
        const originalSize = JSON.stringify(employees).length;
        
        // 临时启用强制压缩
        const success = await this.saveEmployees(employees);
        
        if (success) {
          const newStorageInfo = PersistenceManager.getStorageInfo();
          const newSize = newStorageInfo.stats.totalSize;
          
          result.spaceSaved = Math.max(0, originalSize - newSize);
          result.compressionRatio = newSize / originalSize;
          result.compressedItems = 1;
        }
      }
      
    } catch (error) {
      console.error('[EmployeePersistence] 压缩优化失败:', error);
    }
    
    return result;
  }

  /**
   * 执行存储碎片整理
   * @private
   */
  static async _performStorageDefragmentation() {
    const result = {
      defragmentedItems: 0,
      spaceSaved: 0
    };
    
    try {
      // 重新组织员工数据存储
      const employees = await this.loadEmployees();
      
      if (employees.length > 0) {
        // 按ID排序以优化存储布局
        employees.sort((a, b) => (a.id || 0) - (b.id || 0));
        
        // 重新保存以触发存储重组
        const success = await this.saveEmployees(employees);
        
        if (success) {
          result.defragmentedItems = employees.length;
          console.log('[EmployeePersistence] 存储碎片整理完成');
        }
      }
      
    } catch (error) {
      console.error('[EmployeePersistence] 存储碎片整理失败:', error);
    }
    
    return result;
  }

  /**
   * 优化数据索引
   * @private
   */
  static async _optimizeDataIndices(employees) {
    const result = {
      indicesCreated: 0,
      indexSize: 0,
      searchOptimization: {}
    };
    
    try {
      // 创建常用字段的索引映射
      const indices = {
        byDepartment: new Map(),
        byPosition: new Map(),
        byStatus: new Map(),
        byName: new Map()
      };
      
      employees.forEach((emp, index) => {
        // 部门索引
        if (emp.department) {
          if (!indices.byDepartment.has(emp.department)) {
            indices.byDepartment.set(emp.department, []);
          }
          indices.byDepartment.get(emp.department).push(index);
        }
        
        // 职位索引
        if (emp.position) {
          if (!indices.byPosition.has(emp.position)) {
            indices.byPosition.set(emp.position, []);
          }
          indices.byPosition.get(emp.position).push(index);
        }
        
        // 状态索引
        if (emp.status) {
          if (!indices.byStatus.has(emp.status)) {
            indices.byStatus.set(emp.status, []);
          }
          indices.byStatus.get(emp.status).push(index);
        }
        
        // 姓名索引（用于快速搜索）
        if (emp.name) {
          const nameKey = emp.name.toLowerCase();
          if (!indices.byName.has(nameKey)) {
            indices.byName.set(nameKey, []);
          }
          indices.byName.get(nameKey).push(index);
        }
      });
      
      // 保存索引到缓存
      this._searchIndices = indices;
      
      result.indicesCreated = Object.keys(indices).length;
      result.indexSize = JSON.stringify(indices).length;
      result.searchOptimization = {
        departments: indices.byDepartment.size,
        positions: indices.byPosition.size,
        statuses: indices.byStatus.size,
        names: indices.byName.size
      };
      
      console.log('[EmployeePersistence] 数据索引优化完成:', result.searchOptimization);
      
    } catch (error) {
      console.error('[EmployeePersistence] 索引优化失败:', error);
    }
    
    return result;
  }

  // ============================================================================
  // 数据备份和恢复功能
  // ============================================================================

  /**
   * 创建数据备份
   * @param {boolean} isAutoBackup - 是否为自动备份
   * @returns {Promise<Object>} 备份结果
   */
  static async createBackup(isAutoBackup = false) {
    try {
      console.log('[EmployeePersistence] 开始创建数据备份...');
      
      // 获取当前员工数据
      const employees = await this.loadEmployees();
      
      if (employees.length === 0) {
        console.log('[EmployeePersistence] 没有数据需要备份');
        return { success: false, reason: 'no_data' };
      }
      
      // 创建备份数据
      const backupData = {
        version: EMPLOYEE_CONFIG.CURRENT_VERSION,
        timestamp: new Date().toISOString(),
        type: isAutoBackup ? 'auto' : 'manual',
        employees: employees,
        metadata: {
          count: employees.length,
          checksum: this._generateDataChecksum(employees),
          source: 'backup_creation',
          backupId: this._generateBackupId()
        }
      };
      
      // 保存备份
      const backupKey = `${EMPLOYEE_CONFIG.BACKUP_KEY}_${backupData.metadata.backupId}`;
      const success = await PersistenceManager.save(backupKey, backupData);
      
      if (success) {
        // 更新备份历史
        await this._updateBackupHistory(backupData.metadata);
        
        // 清理旧备份
        await this._cleanupOldBackups();
        
        console.log('[EmployeePersistence] 数据备份创建成功, ID:', backupData.metadata.backupId);
        
        return {
          success: true,
          backupId: backupData.metadata.backupId,
          timestamp: backupData.timestamp,
          count: backupData.metadata.count,
          type: backupData.type
        };
      }
      
      return { success: false, reason: 'save_failed' };
      
    } catch (error) {
      console.error('[EmployeePersistence] 创建备份失败:', error);
      return { success: false, reason: 'error', error: error.message };
    }
  }

  /**
   * 从备份恢复数据
   * @param {string} backupId - 备份ID，如果为空则使用最新备份
   * @returns {Promise<Object>} 恢复结果
   */
  static async restoreFromBackup(backupId = null) {
    try {
      console.log('[EmployeePersistence] 开始从备份恢复数据...');
      
      let backupData = null;
      
      if (backupId) {
        // 恢复指定备份
        const backupKey = `${EMPLOYEE_CONFIG.BACKUP_KEY}_${backupId}`;
        backupData = await PersistenceManager.load(backupKey);
      } else {
        // 恢复最新备份
        backupData = await this._getLatestBackup();
      }
      
      if (!backupData) {
        console.log('[EmployeePersistence] 未找到可用的备份数据');
        return { success: false, reason: 'no_backup' };
      }
      
      // 验证备份数据完整性
      const integrityCheck = await this._verifyBackupIntegrity(backupData);
      if (!integrityCheck.valid) {
        console.warn('[EmployeePersistence] 备份数据完整性验证失败:', integrityCheck.errors);
        return { 
          success: false, 
          reason: 'integrity_failed', 
          errors: integrityCheck.errors 
        };
      }
      
      // 恢复数据
      const success = await this.saveEmployees(backupData.employees);
      
      if (success) {
        console.log('[EmployeePersistence] 数据恢复成功，恢复了', backupData.employees.length, '条员工记录');
        
        return {
          success: true,
          backupId: backupData.metadata?.backupId,
          timestamp: backupData.timestamp,
          count: backupData.employees.length,
          type: backupData.type || 'unknown'
        };
      }
      
      return { success: false, reason: 'restore_failed' };
      
    } catch (error) {
      console.error('[EmployeePersistence] 从备份恢复失败:', error);
      return { success: false, reason: 'error', error: error.message };
    }
  }

  /**
   * 获取备份列表
   * @returns {Promise<Array>} 备份列表
   */
  static async getBackupList() {
    try {
      await this._loadBackupHistory();
      
      // 验证备份是否仍然存在
      const validBackups = [];
      
      for (const backup of this._backupHistory) {
        const backupKey = `${EMPLOYEE_CONFIG.BACKUP_KEY}_${backup.backupId}`;
        const backupData = await PersistenceManager.load(backupKey);
        
        if (backupData) {
          validBackups.push({
            ...backup,
            size: JSON.stringify(backupData).length,
            valid: true
          });
        } else {
          validBackups.push({
            ...backup,
            valid: false
          });
        }
      }
      
      // 按时间戳降序排列
      validBackups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return validBackups;
      
    } catch (error) {
      console.error('[EmployeePersistence] 获取备份列表失败:', error);
      return [];
    }
  }

  /**
   * 删除指定备份
   * @param {string} backupId - 备份ID
   * @returns {Promise<boolean>} 删除是否成功
   */
  static async deleteBackup(backupId) {
    try {
      console.log('[EmployeePersistence] 删除备份, ID:', backupId);
      
      const backupKey = `${EMPLOYEE_CONFIG.BACKUP_KEY}_${backupId}`;
      const success = await PersistenceManager.remove(backupKey);
      
      if (success) {
        // 从备份历史中移除
        this._backupHistory = this._backupHistory.filter(
          backup => backup.backupId !== backupId
        );
        
        // 保存更新后的备份历史
        await this._saveBackupHistory();
        
        console.log('[EmployeePersistence] 备份删除成功');
      }
      
      return success;
      
    } catch (error) {
      console.error('[EmployeePersistence] 删除备份失败:', error);
      return false;
    }
  }

  // ============================================================================
  // 数据导入导出功能
  // ============================================================================

  /**
   * 导出员工数据
   * @param {Object} options - 导出选项
   * @returns {Promise<Object>} 导出结果
   */
  static async exportEmployeeData(options = {}) {
    try {
      console.log('[EmployeePersistence] 开始导出员工数据...');
      
      const {
        format = 'json', // json | csv
        includeMetadata = true,
        filename = null
      } = options;
      
      // 获取员工数据
      const employees = await this.loadEmployees();
      
      if (employees.length === 0) {
        return { success: false, reason: 'no_data' };
      }
      
      let exportData;
      let mimeType;
      let defaultFilename;
      
      if (format === 'csv') {
        exportData = this._convertToCSV(employees);
        mimeType = 'text/csv';
        defaultFilename = `employees_${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        // JSON格式
        const jsonData = {
          version: EMPLOYEE_CONFIG.CURRENT_VERSION,
          exportDate: new Date().toISOString(),
          count: employees.length,
          employees: employees
        };
        
        if (includeMetadata) {
          const stats = await this.getEmployeeStats();
          jsonData.metadata = {
            departments: stats.departments,
            positions: stats.positions,
            storageInfo: stats.storage
          };
        }
        
        exportData = JSON.stringify(jsonData, null, 2);
        mimeType = 'application/json';
        defaultFilename = `employees_${new Date().toISOString().split('T')[0]}.json`;
      }
      
      // 创建下载链接
      const blob = new Blob([exportData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      // 触发下载
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || defaultFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理URL对象
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      console.log('[EmployeePersistence] 数据导出成功，文件名:', link.download);
      
      return {
        success: true,
        filename: link.download,
        count: employees.length,
        format: format,
        size: exportData.length
      };
      
    } catch (error) {
      console.error('[EmployeePersistence] 导出数据失败:', error);
      return { success: false, reason: 'error', error: error.message };
    }
  }

  /**
   * 导入员工数据
   * @param {File|string} data - 文件对象或数据字符串
   * @param {Object} options - 导入选项
   * @returns {Promise<Object>} 导入结果
   */
  static async importEmployeeData(data, options = {}) {
    try {
      console.log('[EmployeePersistence] 开始导入员工数据...');
      
      const {
        format = 'auto', // auto | json | csv
        merge = false, // 是否与现有数据合并
        validate = true // 是否验证数据
      } = options;
      
      let importData;
      let detectedFormat = format;
      
      // 读取数据
      if (data instanceof File) {
        const text = await this._readFileAsText(data);
        
        // 自动检测格式
        if (format === 'auto') {
          detectedFormat = data.name.toLowerCase().endsWith('.csv') ? 'csv' : 'json';
        }
        
        importData = text;
      } else if (typeof data === 'string') {
        importData = data;
        
        // 自动检测格式
        if (format === 'auto') {
          try {
            JSON.parse(data);
            detectedFormat = 'json';
          } catch {
            detectedFormat = 'csv';
          }
        }
      } else {
        throw new Error('不支持的数据类型');
      }
      
      // 解析数据
      let employees;
      
      if (detectedFormat === 'csv') {
        employees = this._parseCSV(importData);
      } else {
        const jsonData = JSON.parse(importData);
        employees = jsonData.employees || jsonData;
      }
      
      // 验证数据
      if (validate) {
        employees = this._validateEmployees(employees);
      }
      
      if (employees.length === 0) {
        return { success: false, reason: 'no_valid_data' };
      }
      
      // 处理数据合并
      let finalEmployees = employees;
      
      if (merge) {
        const existingEmployees = await this.loadEmployees();
        
        // 合并数据，避免ID冲突
        const existingIds = new Set(existingEmployees.map(emp => emp.id));
        
        employees.forEach(emp => {
          if (!emp.id || existingIds.has(emp.id)) {
            emp.id = this._generateEmployeeId();
          }
        });
        
        finalEmployees = [...existingEmployees, ...employees];
      }
      
      // 保存数据
      const success = await this.saveEmployees(finalEmployees);
      
      if (success) {
        console.log('[EmployeePersistence] 数据导入成功，导入了', employees.length, '条记录');
        
        return {
          success: true,
          imported: employees.length,
          total: finalEmployees.length,
          format: detectedFormat,
          merged: merge
        };
      }
      
      return { success: false, reason: 'save_failed' };
      
    } catch (error) {
      console.error('[EmployeePersistence] 导入数据失败:', error);
      return { success: false, reason: 'error', error: error.message };
    }
  }

  // ============================================================================
  // 数据完整性校验功能
  // ============================================================================

  /**
   * 执行数据完整性检查
   * @returns {Promise<Object>} 检查结果
   */
  static async performIntegrityCheck() {
    try {
      console.log('[EmployeePersistence] 开始数据完整性检查...');
      
      const result = {
        timestamp: new Date().toISOString(),
        status: 'healthy',
        issues: [],
        statistics: {},
        recommendations: []
      };
      
      // 1. 检查主数据
      const mainDataCheck = await this._checkMainDataIntegrity();
      result.statistics.mainData = mainDataCheck;
      
      if (!mainDataCheck.valid) {
        result.status = 'corrupted';
        result.issues.push({
          type: 'main_data_corruption',
          severity: 'critical',
          description: '主数据损坏',
          details: mainDataCheck.errors
        });
      }
      
      // 2. 检查备份数据
      const backupCheck = await this._checkBackupIntegrity();
      result.statistics.backups = backupCheck;
      
      if (backupCheck.corruptedCount > 0) {
        result.issues.push({
          type: 'backup_corruption',
          severity: 'warning',
          description: `发现 ${backupCheck.corruptedCount} 个损坏的备份`,
          details: backupCheck.corruptedBackups
        });
      }
      
      // 3. 检查数据一致性
      const consistencyCheck = await this._checkDataConsistency();
      result.statistics.consistency = consistencyCheck;
      
      if (!consistencyCheck.consistent) {
        result.issues.push({
          type: 'data_inconsistency',
          severity: 'warning',
          description: '数据一致性问题',
          details: consistencyCheck.issues
        });
      }
      
      // 4. 检查存储健康状态
      const storageHealth = await this.getStorageHealth();
      result.statistics.storage = storageHealth;
      
      if (storageHealth.status === 'degraded') {
        result.issues.push({
          type: 'storage_degraded',
          severity: 'warning',
          description: '存储状态降级',
          details: storageHealth.warnings
        });
      }
      
      // 生成建议
      result.recommendations = this._generateIntegrityRecommendations(result);
      
      // 确定最终状态
      if (result.issues.some(issue => issue.severity === 'critical')) {
        result.status = 'critical';
      } else if (result.issues.length > 0) {
        result.status = 'warning';
      }
      
      console.log('[EmployeePersistence] 完整性检查完成，状态:', result.status);
      
      return result;
      
    } catch (error) {
      console.error('[EmployeePersistence] 完整性检查失败:', error);
      return {
        timestamp: new Date().toISOString(),
        status: 'error',
        issues: [{
          type: 'check_failed',
          severity: 'critical',
          description: '完整性检查失败',
          details: error.message
        }],
        statistics: {},
        recommendations: ['请检查系统状态并重试']
      };
    }
  }

  /**
   * 自动修复数据问题
   * @param {Object} integrityResult - 完整性检查结果
   * @returns {Promise<Object>} 修复结果
   */
  static async autoRepairData(integrityResult) {
    try {
      console.log('[EmployeePersistence] 开始自动修复数据问题...');
      
      const repairResult = {
        timestamp: new Date().toISOString(),
        repaired: [],
        failed: [],
        skipped: []
      };
      
      for (const issue of integrityResult.issues) {
        try {
          switch (issue.type) {
            case 'main_data_corruption':
              const mainRepair = await this._repairMainDataCorruption();
              if (mainRepair.success) {
                repairResult.repaired.push({
                  type: issue.type,
                  method: 'backup_restore',
                  details: mainRepair
                });
              } else {
                repairResult.failed.push({
                  type: issue.type,
                  reason: mainRepair.reason
                });
              }
              break;
              
            case 'backup_corruption':
              const backupRepair = await this._repairBackupCorruption(issue.details);
              repairResult.repaired.push({
                type: issue.type,
                method: 'cleanup_corrupted',
                details: backupRepair
              });
              break;
              
            case 'data_inconsistency':
              const consistencyRepair = await this._repairDataInconsistency(issue.details);
              if (consistencyRepair.success) {
                repairResult.repaired.push({
                  type: issue.type,
                  method: 'data_normalization',
                  details: consistencyRepair
                });
              } else {
                repairResult.failed.push({
                  type: issue.type,
                  reason: consistencyRepair.reason
                });
              }
              break;
              
            default:
              repairResult.skipped.push({
                type: issue.type,
                reason: 'no_auto_repair_available'
              });
          }
        } catch (repairError) {
          console.error(`[EmployeePersistence] 修复 ${issue.type} 失败:`, repairError);
          repairResult.failed.push({
            type: issue.type,
            reason: repairError.message
          });
        }
      }
      
      console.log('[EmployeePersistence] 自动修复完成');
      console.log('  - 修复成功:', repairResult.repaired.length);
      console.log('  - 修复失败:', repairResult.failed.length);
      console.log('  - 跳过修复:', repairResult.skipped.length);
      
      return repairResult;
      
    } catch (error) {
      console.error('[EmployeePersistence] 自动修复失败:', error);
      return {
        timestamp: new Date().toISOString(),
        repaired: [],
        failed: [{
          type: 'auto_repair',
          reason: error.message
        }],
        skipped: []
      };
    }
  }

  /**
   * 生成健康警告
   * @private
   */
  static _generateHealthWarnings(storageInfo, employees) {
    const warnings = [];
    
    if (storageInfo.storageType === 'memory') {
      warnings.push('当前使用内存模式，数据在页面刷新后可能丢失');
    }
    
    if (storageInfo.usage.isNearLimit) {
      warnings.push(`存储空间使用率达到 ${storageInfo.usage.percentage.toFixed(1)}%，接近限制`);
    }
    
    if (employees.length === 0 && this._lastUpdate) {
      warnings.push('数据为空，但之前有更新记录，可能存在数据丢失');
    }
    
    if (!this._cache) {
      warnings.push('内存缓存未激活，可能影响性能');
    }
    
    return warnings;
  }

  /**
   * 生成健康建议
   * @private
   */
  static _generateHealthRecommendations(storageInfo, employees) {
    const recommendations = [];
    
    if (storageInfo.storageType === 'memory') {
      recommendations.push('建议检查浏览器存储设置，启用localStorage');
    }
    
    if (storageInfo.usage.isNearLimit) {
      recommendations.push('建议清理旧数据或导出重要数据');
    }
    
    if (employees.length > EMPLOYEE_CONFIG.MAX_EMPLOYEES * 0.8) {
      recommendations.push('员工数据接近上限，建议考虑数据归档');
    }
    
    if (!this._lastUpdate || Date.now() - new Date(this._lastUpdate).getTime() > 24 * 60 * 60 * 1000) {
      recommendations.push('建议定期备份员工数据');
    }
    
    return recommendations;
  }

  // ============================================================================
  // 私有辅助方法
  // ============================================================================

  /**
   * 验证员工数组
   * @private
   */
  static _validateEmployees(employees) {
    if (!Array.isArray(employees)) {
      throw new EmployeeDataError('员工数据必须是数组', 'INVALID_FORMAT');
    }
    
    if (employees.length > EMPLOYEE_CONFIG.MAX_EMPLOYEES) {
      throw new EmployeeDataError('员工数量超过限制', 'TOO_MANY_EMPLOYEES');
    }
    
    return employees.map((emp, index) => {
      try {
        // 对于已存在的员工（有ID），需要验证ID字段
        if (emp.id) {
          // 检查所有必需字段
          for (const field of EMPLOYEE_CONFIG.REQUIRED_FIELDS) {
            if (!emp[field]) {
              throw new EmployeeDataError(`缺少必需字段: ${field}`, 'MISSING_FIELD');
            }
          }
        }
        return this._validateSingleEmployee(emp);
      } catch (error) {
        console.warn(`[EmployeePersistence] 员工数据验证失败，索引 ${index}:`, error.message);
        // 跳过无效的员工数据
        return null;
      }
    }).filter(emp => emp !== null);
  }

  /**
   * 验证单个员工数据
   * @private
   */
  static _validateSingleEmployee(employee) {
    if (!employee || typeof employee !== 'object') {
      throw new EmployeeDataError('无效的员工数据格式', 'INVALID_FORMAT');
    }
    
    // 检查必需字段（除了id，因为id可能在添加时生成）
    const requiredFieldsForValidation = EMPLOYEE_CONFIG.REQUIRED_FIELDS.filter(field => field !== 'id');
    for (const field of requiredFieldsForValidation) {
      if (!employee[field]) {
        throw new EmployeeDataError(`缺少必需字段: ${field}`, 'MISSING_FIELD');
      }
    }
    
    // 数据类型验证
    const validatedEmployee = {
      id: employee.id, // id可能为空，在addEmployee中生成
      employeeId: String(employee.employeeId || ''),
      name: String(employee.name || '').trim(),
      department: String(employee.department || '').trim(),
      position: String(employee.position || '').trim(),
      phone: String(employee.phone || '').trim(),
      email: String(employee.email || '').trim(),
      gender: String(employee.gender || ''),
      age: employee.age ? Number(employee.age) : null,
      education: String(employee.education || ''),
      skillLevel: String(employee.skillLevel || ''),
      joinDate: employee.joinDate || null,
      emergencyContact: String(employee.emergencyContact || ''),
      address: String(employee.address || ''),
      remark: String(employee.remark || ''),
      status: String(employee.status || '在职'),
      shift: String(employee.shift || ''),
      createDate: employee.createDate || new Date().toISOString().split('T')[0],
      updateDate: employee.updateDate || new Date().toISOString().split('T')[0],
      _persistence: employee._persistence || {}
    };
    
    // 验证姓名长度
    if (validatedEmployee.name.length < 1 || validatedEmployee.name.length > 50) {
      throw new EmployeeDataError('员工姓名长度无效', 'INVALID_NAME_LENGTH');
    }
    
    return validatedEmployee;
  }

  /**
   * 生成员工ID
   * @private
   */
  static _generateEmployeeId() {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  /**
   * 生成数据校验和
   * @private
   */
  static _generateDataChecksum(employees) {
    const dataString = JSON.stringify(employees.map(emp => ({
      id: emp.id,
      name: emp.name,
      department: emp.department,
      position: emp.position
    })));
    
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * 检查缓存是否有效
   * @private
   */
  static _isCacheValid() {
    if (!this._lastUpdate) return false;
    
    const cacheAge = Date.now() - new Date(this._lastUpdate).getTime();
    const maxCacheAge = 5 * 60 * 1000; // 5分钟
    
    return cacheAge < maxCacheAge;
  }

  /**
   * 验证和迁移数据
   * @private
   */
  static async _validateAndMigrateData(storageData) {
    try {
      // 检查数据版本
      if (storageData.version !== EMPLOYEE_CONFIG.CURRENT_VERSION) {
        console.log('[EmployeePersistence] 检测到旧版本数据，开始迁移...');
        storageData = await this._migrateData(storageData);
      }
      
      // 验证数据完整性
      if (storageData.metadata && storageData.metadata.checksum) {
        const currentChecksum = this._generateDataChecksum(storageData.employees);
        if (currentChecksum !== storageData.metadata.checksum) {
          console.warn('[EmployeePersistence] 数据校验和不匹配，可能已损坏');
        }
      }
      
      // 验证员工数据
      return this._validateEmployees(storageData.employees || []);
      
    } catch (error) {
      console.error('[EmployeePersistence] 数据验证失败:', error);
      throw new EmployeeDataError('数据验证失败', 'VALIDATION_FAILED');
    }
  }

  /**
   * 数据迁移
   * @private
   */
  static async _migrateData(oldData) {
    console.log('[EmployeePersistence] 执行数据迁移...');
    
    // 这里可以实现不同版本之间的数据迁移逻辑
    const migratedData = {
      version: EMPLOYEE_CONFIG.CURRENT_VERSION,
      timestamp: new Date().toISOString(),
      employees: oldData.employees || oldData.data || [],
      metadata: {
        count: (oldData.employees || oldData.data || []).length,
        lastModified: new Date().toISOString(),
        migrated: true,
        originalVersion: oldData.version || 'unknown'
      }
    };
    
    // 保存迁移后的数据
    await this.saveEmployees(migratedData.employees);
    
    console.log('[EmployeePersistence] 数据迁移完成');
    return migratedData;
  }

  /**
   * 保存元数据
   * @private
   */
  static async _saveMetadata(metadata) {
    try {
      await PersistenceManager.save(EMPLOYEE_CONFIG.METADATA_KEY, metadata);
    } catch (error) {
      console.warn('[EmployeePersistence] 保存元数据失败:', error);
    }
  }

  /**
   * 从备份加载数据
   * @private
   */
  static async _loadFromBackup() {
    try {
      console.log('[EmployeePersistence] 尝试从备份恢复数据...');
      
      const backupData = await PersistenceManager.load(EMPLOYEE_CONFIG.BACKUP_KEY);
      if (backupData && backupData.employees) {
        return this._validateEmployees(backupData.employees);
      }
      
      return null;
    } catch (error) {
      console.warn('[EmployeePersistence] 从备份恢复失败:', error);
      return null;
    }
  }

  // ============================================================================
  // 备份机制私有方法
  // ============================================================================

  /**
   * 启动自动备份
   * @private
   */
  static _startAutoBackup() {
    if (this._backupTimer) {
      clearInterval(this._backupTimer);
    }
    
    this._backupTimer = setInterval(async () => {
      try {
        console.log('[EmployeePersistence] 执行自动备份...');
        await this.createBackup(true);
      } catch (error) {
        console.error('[EmployeePersistence] 自动备份失败:', error);
      }
    }, EMPLOYEE_CONFIG.BACKUP_INTERVAL);
    
    console.log('[EmployeePersistence] 自动备份已启动，间隔:', EMPLOYEE_CONFIG.BACKUP_INTERVAL / 1000, '秒');
  }

  /**
   * 启动完整性检查
   * @private
   */
  static _startIntegrityCheck() {
    if (this._integrityTimer) {
      clearInterval(this._integrityTimer);
    }
    
    this._integrityTimer = setInterval(async () => {
      try {
        console.log('[EmployeePersistence] 执行定期完整性检查...');
        const result = await this.performIntegrityCheck();
        
        if (result.status === 'critical') {
          console.error('[EmployeePersistence] 发现严重数据问题，尝试自动修复...');
          await this.autoRepairData(result);
        }
      } catch (error) {
        console.error('[EmployeePersistence] 定期完整性检查失败:', error);
      }
    }, EMPLOYEE_CONFIG.INTEGRITY_CHECK_INTERVAL);
    
    console.log('[EmployeePersistence] 完整性检查已启动，间隔:', EMPLOYEE_CONFIG.INTEGRITY_CHECK_INTERVAL / 1000, '秒');
  }

  /**
   * 生成备份ID
   * @private
   */
  static _generateBackupId() {
    return `backup_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }

  /**
   * 更新备份历史
   * @private
   */
  static async _updateBackupHistory(backupMetadata) {
    try {
      this._backupHistory.push({
        backupId: backupMetadata.backupId,
        timestamp: new Date().toISOString(),
        count: backupMetadata.count,
        checksum: backupMetadata.checksum,
        type: backupMetadata.type || 'manual'
      });
      
      // 保持历史记录数量限制
      if (this._backupHistory.length > EMPLOYEE_CONFIG.MAX_BACKUP_COUNT * 2) {
        this._backupHistory = this._backupHistory.slice(-EMPLOYEE_CONFIG.MAX_BACKUP_COUNT);
      }
      
      await this._saveBackupHistory();
    } catch (error) {
      console.warn('[EmployeePersistence] 更新备份历史失败:', error);
    }
  }

  /**
   * 保存备份历史
   * @private
   */
  static async _saveBackupHistory() {
    try {
      await PersistenceManager.save(EMPLOYEE_CONFIG.BACKUP_HISTORY_KEY, this._backupHistory);
    } catch (error) {
      console.warn('[EmployeePersistence] 保存备份历史失败:', error);
    }
  }

  /**
   * 加载备份历史
   * @private
   */
  static async _loadBackupHistory() {
    try {
      const history = await PersistenceManager.load(EMPLOYEE_CONFIG.BACKUP_HISTORY_KEY, []);
      this._backupHistory = Array.isArray(history) ? history : [];
    } catch (error) {
      console.warn('[EmployeePersistence] 加载备份历史失败:', error);
      this._backupHistory = [];
    }
  }

  /**
   * 清理旧备份
   * @private
   */
  static async _cleanupOldBackups() {
    try {
      if (this._backupHistory.length <= EMPLOYEE_CONFIG.MAX_BACKUP_COUNT) {
        return;
      }
      
      // 按时间戳排序，保留最新的备份
      this._backupHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      const backupsToDelete = this._backupHistory.slice(EMPLOYEE_CONFIG.MAX_BACKUP_COUNT);
      
      for (const backup of backupsToDelete) {
        const backupKey = `${EMPLOYEE_CONFIG.BACKUP_KEY}_${backup.backupId}`;
        await PersistenceManager.remove(backupKey);
        console.log('[EmployeePersistence] 清理旧备份:', backup.backupId);
      }
      
      // 更新历史记录
      this._backupHistory = this._backupHistory.slice(0, EMPLOYEE_CONFIG.MAX_BACKUP_COUNT);
      await this._saveBackupHistory();
      
      console.log('[EmployeePersistence] 旧备份清理完成，删除了', backupsToDelete.length, '个备份');
      
    } catch (error) {
      console.error('[EmployeePersistence] 清理旧备份失败:', error);
    }
  }

  /**
   * 获取最新备份
   * @private
   */
  static async _getLatestBackup() {
    try {
      await this._loadBackupHistory();
      
      if (this._backupHistory.length === 0) {
        return null;
      }
      
      // 按时间戳排序，获取最新的
      this._backupHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      const latestBackup = this._backupHistory[0];
      const backupKey = `${EMPLOYEE_CONFIG.BACKUP_KEY}_${latestBackup.backupId}`;
      
      return await PersistenceManager.load(backupKey);
    } catch (error) {
      console.error('[EmployeePersistence] 获取最新备份失败:', error);
      return null;
    }
  }

  /**
   * 验证备份完整性
   * @private
   */
  static async _verifyBackupIntegrity(backupData) {
    const result = {
      valid: true,
      errors: []
    };
    
    try {
      // 检查基本结构
      if (!backupData.employees || !Array.isArray(backupData.employees)) {
        result.valid = false;
        result.errors.push('备份数据结构无效');
        return result;
      }
      
      // 检查校验和
      if (backupData.metadata && backupData.metadata.checksum) {
        const currentChecksum = this._generateDataChecksum(backupData.employees);
        if (currentChecksum !== backupData.metadata.checksum) {
          result.valid = false;
          result.errors.push('数据校验和不匹配');
        }
      }
      
      // 检查数据数量
      if (backupData.metadata && backupData.metadata.count !== backupData.employees.length) {
        result.valid = false;
        result.errors.push('数据数量不匹配');
      }
      
      // 验证员工数据
      try {
        this._validateEmployees(backupData.employees);
      } catch (validationError) {
        result.valid = false;
        result.errors.push('员工数据验证失败: ' + validationError.message);
      }
      
    } catch (error) {
      result.valid = false;
      result.errors.push('备份验证过程出错: ' + error.message);
    }
    
    return result;
  }

  // ============================================================================
  // 导入导出私有方法
  // ============================================================================

  /**
   * 转换为CSV格式
   * @private
   */
  static _convertToCSV(employees) {
    if (employees.length === 0) {
      return '';
    }
    
    // CSV头部
    const headers = [
      'ID', '工号', '姓名', '部门', '职位', '电话', '邮箱', 
      '性别', '年龄', '学历', '技能等级', '入职日期', 
      '紧急联系人', '地址', '备注', '状态', '班次', 
      '创建日期', '更新日期'
    ];
    
    // 数据行
    const rows = employees.map(emp => [
      emp.id || '',
      emp.employeeId || '',
      emp.name || '',
      emp.department || '',
      emp.position || '',
      emp.phone || '',
      emp.email || '',
      emp.gender || '',
      emp.age || '',
      emp.education || '',
      emp.skillLevel || '',
      emp.joinDate || '',
      emp.emergencyContact || '',
      emp.address || '',
      emp.remark || '',
      emp.status || '',
      emp.shift || '',
      emp.createDate || '',
      emp.updateDate || ''
    ]);
    
    // 组合CSV内容
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    return csvContent;
  }

  /**
   * 解析CSV数据
   * @private
   */
  static _parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV文件格式无效');
    }
    
    // 解析头部
    const headers = this._parseCSVLine(lines[0]);
    
    // 解析数据行
    const employees = [];
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = this._parseCSVLine(lines[i]);
        
        if (values.length !== headers.length) {
          console.warn(`[EmployeePersistence] CSV第${i + 1}行数据列数不匹配，跳过`);
          continue;
        }
        
        const employee = {};
        
        // 映射字段
        const fieldMapping = {
          'ID': 'id',
          '工号': 'employeeId',
          '姓名': 'name',
          '部门': 'department',
          '职位': 'position',
          '电话': 'phone',
          '邮箱': 'email',
          '性别': 'gender',
          '年龄': 'age',
          '学历': 'education',
          '技能等级': 'skillLevel',
          '入职日期': 'joinDate',
          '紧急联系人': 'emergencyContact',
          '地址': 'address',
          '备注': 'remark',
          '状态': 'status',
          '班次': 'shift',
          '创建日期': 'createDate',
          '更新日期': 'updateDate'
        };
        
        headers.forEach((header, index) => {
          const fieldName = fieldMapping[header] || header.toLowerCase();
          let value = values[index];
          
          // 数据类型转换
          if (fieldName === 'age' && value) {
            value = parseInt(value) || null;
          } else if (fieldName === 'id' && value) {
            value = parseInt(value) || null;
          }
          
          employee[fieldName] = value;
        });
        
        employees.push(employee);
        
      } catch (error) {
        console.warn(`[EmployeePersistence] CSV第${i + 1}行解析失败:`, error.message);
      }
    }
    
    return employees;
  }

  /**
   * 解析CSV行
   * @private
   */
  static _parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // 转义的引号
          current += '"';
          i++; // 跳过下一个引号
        } else {
          // 切换引号状态
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // 字段分隔符
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    // 添加最后一个字段
    result.push(current);
    
    return result;
  }

  /**
   * 读取文件为文本
   * @private
   */
  static _readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      
      reader.onerror = (error) => {
        reject(new Error('文件读取失败: ' + error.message));
      };
      
      reader.readAsText(file, 'UTF-8');
    });
  }

  // ============================================================================
  // 完整性检查私有方法
  // ============================================================================

  /**
   * 检查主数据完整性
   * @private
   */
  static async _checkMainDataIntegrity() {
    try {
      const employees = await this.loadEmployees();
      
      const result = {
        valid: true,
        count: employees.length,
        errors: [],
        corruptedEmployees: []
      };
      
      // 检查每个员工数据
      employees.forEach((emp, index) => {
        try {
          this._validateSingleEmployee(emp);
        } catch (error) {
          result.valid = false;
          result.errors.push(`员工 ${index + 1} 数据无效: ${error.message}`);
          result.corruptedEmployees.push({
            index,
            id: emp.id,
            name: emp.name,
            error: error.message
          });
        }
      });
      
      // 检查ID重复
      const ids = employees.map(emp => emp.id).filter(id => id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      
      if (duplicateIds.length > 0) {
        result.valid = false;
        result.errors.push(`发现重复ID: ${duplicateIds.join(', ')}`);
      }
      
      return result;
      
    } catch (error) {
      return {
        valid: false,
        count: 0,
        errors: ['主数据检查失败: ' + error.message],
        corruptedEmployees: []
      };
    }
  }

  /**
   * 检查备份完整性
   * @private
   */
  static async _checkBackupIntegrity() {
    try {
      const backupList = await this.getBackupList();
      
      const result = {
        totalCount: backupList.length,
        validCount: 0,
        corruptedCount: 0,
        corruptedBackups: []
      };
      
      for (const backup of backupList) {
        if (backup.valid) {
          result.validCount++;
        } else {
          result.corruptedCount++;
          result.corruptedBackups.push({
            backupId: backup.backupId,
            timestamp: backup.timestamp,
            reason: 'backup_not_found'
          });
        }
      }
      
      return result;
      
    } catch (error) {
      return {
        totalCount: 0,
        validCount: 0,
        corruptedCount: 0,
        corruptedBackups: [],
        error: error.message
      };
    }
  }

  /**
   * 检查数据一致性
   * @private
   */
  static async _checkDataConsistency() {
    try {
      const employees = await this.loadEmployees();
      
      const result = {
        consistent: true,
        issues: []
      };
      
      // 检查部门一致性
      const departments = [...new Set(employees.map(emp => emp.department))];
      const suspiciousDepartments = departments.filter(dept => 
        dept && dept.length < 2 || dept.length > 50
      );
      
      if (suspiciousDepartments.length > 0) {
        result.consistent = false;
        result.issues.push({
          type: 'department_inconsistency',
          description: '部门名称异常',
          details: suspiciousDepartments
        });
      }
      
      // 检查职位一致性
      const positions = [...new Set(employees.map(emp => emp.position))];
      const suspiciousPositions = positions.filter(pos => 
        pos && pos.length < 2 || pos.length > 50
      );
      
      if (suspiciousPositions.length > 0) {
        result.consistent = false;
        result.issues.push({
          type: 'position_inconsistency',
          description: '职位名称异常',
          details: suspiciousPositions
        });
      }
      
      // 检查日期一致性
      const invalidDates = employees.filter(emp => {
        if (emp.createDate && emp.updateDate) {
          return new Date(emp.createDate) > new Date(emp.updateDate);
        }
        return false;
      });
      
      if (invalidDates.length > 0) {
        result.consistent = false;
        result.issues.push({
          type: 'date_inconsistency',
          description: '创建日期晚于更新日期',
          details: invalidDates.map(emp => ({ id: emp.id, name: emp.name }))
        });
      }
      
      return result;
      
    } catch (error) {
      return {
        consistent: false,
        issues: [{
          type: 'check_failed',
          description: '一致性检查失败',
          details: error.message
        }]
      };
    }
  }

  /**
   * 生成完整性建议
   * @private
   */
  static _generateIntegrityRecommendations(integrityResult) {
    const recommendations = [];
    
    for (const issue of integrityResult.issues) {
      switch (issue.type) {
        case 'main_data_corruption':
          recommendations.push('建议立即从备份恢复数据');
          recommendations.push('检查存储设备是否正常工作');
          break;
          
        case 'backup_corruption':
          recommendations.push('建议创建新的数据备份');
          recommendations.push('清理损坏的备份文件');
          break;
          
        case 'data_inconsistency':
          recommendations.push('建议检查并修正数据输入流程');
          recommendations.push('考虑添加数据验证规则');
          break;
          
        case 'storage_degraded':
          recommendations.push('检查浏览器存储设置');
          recommendations.push('考虑导出重要数据作为备份');
          break;
      }
    }
    
    // 通用建议
    if (integrityResult.status !== 'healthy') {
      recommendations.push('建议定期执行数据完整性检查');
      recommendations.push('保持数据备份的最新状态');
    }
    
    return [...new Set(recommendations)]; // 去重
  }

  /**
   * 修复主数据损坏
   * @private
   */
  static async _repairMainDataCorruption() {
    try {
      console.log('[EmployeePersistence] 尝试修复主数据损坏...');
      
      // 尝试从最新备份恢复
      const restoreResult = await this.restoreFromBackup();
      
      if (restoreResult.success) {
        return {
          success: true,
          method: 'backup_restore',
          restoredCount: restoreResult.count,
          backupId: restoreResult.backupId
        };
      }
      
      return {
        success: false,
        reason: 'no_valid_backup'
      };
      
    } catch (error) {
      return {
        success: false,
        reason: error.message
      };
    }
  }

  // ============================================================================
  // 审计日志功能
  // ============================================================================

  /**
   * 初始化审计日志
   * @private
   */
  static async _initializeAuditLog() {
    try {
      if (!EMPLOYEE_CONFIG.AUDIT_LOG_ENABLED) {
        return;
      }
      
      // 加载现有审计日志
      const existingLogs = await PersistenceManager.load(EMPLOYEE_CONFIG.AUDIT_LOG_KEY, []);
      this._auditLogCache = Array.isArray(existingLogs) ? existingLogs : [];
      
      // 清理过期日志
      await this._cleanupAuditLogs();
      
      console.log('[EmployeePersistence] 审计日志初始化完成，当前日志数量:', this._auditLogCache.length);
    } catch (error) {
      console.error('[EmployeePersistence] 审计日志初始化失败:', error);
      this._auditLogCache = [];
    }
  }

  /**
   * 记录审计事件
   * @private
   */
  static async _logAuditEvent(action, details = {}) {
    try {
      if (!EMPLOYEE_CONFIG.AUDIT_LOG_ENABLED) {
        return;
      }
      
      const auditEntry = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString(),
        action: action,
        details: details,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        sessionId: this._getSessionId()
      };
      
      // 添加到缓存
      this._auditLogCache.push(auditEntry);
      
      // 限制缓存大小
      if (this._auditLogCache.length > EMPLOYEE_CONFIG.MAX_AUDIT_LOG_ENTRIES) {
        this._auditLogCache = this._auditLogCache.slice(-EMPLOYEE_CONFIG.MAX_AUDIT_LOG_ENTRIES);
      }
      
      // 异步保存到持久化存储
      setTimeout(async () => {
        try {
          await PersistenceManager.save(EMPLOYEE_CONFIG.AUDIT_LOG_KEY, this._auditLogCache);
        } catch (error) {
          console.warn('[EmployeePersistence] 审计日志保存失败:', error);
        }
      }, 0);
      
    } catch (error) {
      console.error('[EmployeePersistence] 审计日志记录失败:', error);
    }
  }

  /**
   * 获取审计日志
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 审计日志列表
   */
  static async getAuditLogs(options = {}) {
    try {
      const {
        startDate = null,
        endDate = null,
        action = null,
        limit = 100
      } = options;
      
      // 确保日志已加载
      if (this._auditLogCache.length === 0) {
        await this._initializeAuditLog();
      }
      
      let logs = [...this._auditLogCache];
      
      // 按时间过滤
      if (startDate) {
        const start = new Date(startDate);
        logs = logs.filter(log => new Date(log.timestamp) >= start);
      }
      
      if (endDate) {
        const end = new Date(endDate);
        logs = logs.filter(log => new Date(log.timestamp) <= end);
      }
      
      // 按操作类型过滤
      if (action) {
        logs = logs.filter(log => log.action === action);
      }
      
      // 按时间戳降序排列
      logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // 限制结果数量
      if (limit > 0) {
        logs = logs.slice(0, limit);
      }
      
      return logs;
      
    } catch (error) {
      console.error('[EmployeePersistence] 获取审计日志失败:', error);
      return [];
    }
  }

  /**
   * 清理过期审计日志
   * @private
   */
  static async _cleanupAuditLogs() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - EMPLOYEE_CONFIG.AUDIT_LOG_RETENTION_DAYS);
      
      const originalCount = this._auditLogCache.length;
      this._auditLogCache = this._auditLogCache.filter(log => 
        new Date(log.timestamp) > cutoffDate
      );
      
      const cleanedCount = originalCount - this._auditLogCache.length;
      
      if (cleanedCount > 0) {
        console.log(`[EmployeePersistence] 清理了 ${cleanedCount} 条过期审计日志`);
        await PersistenceManager.save(EMPLOYEE_CONFIG.AUDIT_LOG_KEY, this._auditLogCache);
      }
      
    } catch (error) {
      console.error('[EmployeePersistence] 清理审计日志失败:', error);
    }
  }

  /**
   * 获取会话ID
   * @private
   */
  static _getSessionId() {
    if (!this._sessionId) {
      this._sessionId = 'session_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    }
    return this._sessionId;
  }

  // ============================================================================
  // 启动检查功能
  // ============================================================================

  /**
   * 检查异常退出
   * @private
   */
  static async _checkAbnormalExit() {
    try {
      if (!EMPLOYEE_CONFIG.ABNORMAL_EXIT_DETECTION) {
        return;
      }
      
      const startupFlag = await PersistenceManager.load(EMPLOYEE_CONFIG.STARTUP_FLAG_KEY);
      
      if (startupFlag && startupFlag.active) {
        console.warn('[EmployeePersistence] 检测到异常退出，执行数据一致性检查...');
        
        // 记录审计日志
        await this._logAuditEvent('ABNORMAL_EXIT_DETECTED', {
          lastStartup: startupFlag.timestamp,
          currentStartup: new Date().toISOString()
        });
        
        // 执行启动完整性检查
        if (EMPLOYEE_CONFIG.STARTUP_INTEGRITY_CHECK) {
          await this._performStartupIntegrityCheck();
        }
      }
      
    } catch (error) {
      console.error('[EmployeePersistence] 异常退出检查失败:', error);
    }
  }

  /**
   * 设置启动标记
   * @private
   */
  static async _setStartupFlag() {
    try {
      const startupFlag = {
        active: true,
        timestamp: new Date().toISOString(),
        version: EMPLOYEE_CONFIG.CURRENT_VERSION
      };
      
      await PersistenceManager.save(EMPLOYEE_CONFIG.STARTUP_FLAG_KEY, startupFlag);
    } catch (error) {
      console.warn('[EmployeePersistence] 设置启动标记失败:', error);
    }
  }

  /**
   * 清除启动标记
   * @private
   */
  static async _clearStartupFlag() {
    try {
      const startupFlag = {
        active: false,
        timestamp: new Date().toISOString(),
        version: EMPLOYEE_CONFIG.CURRENT_VERSION
      };
      
      await PersistenceManager.save(EMPLOYEE_CONFIG.STARTUP_FLAG_KEY, startupFlag);
    } catch (error) {
      console.warn('[EmployeePersistence] 清除启动标记失败:', error);
    }
  }

  /**
   * 执行启动完整性检查
   * @private
   */
  static async _performStartupIntegrityCheck() {
    try {
      console.log('[EmployeePersistence] 开始启动完整性检查...');
      
      const integrityResult = await this.performIntegrityCheck();
      
      // 记录审计日志
      await this._logAuditEvent('STARTUP_INTEGRITY_CHECK', {
        status: integrityResult.status,
        issueCount: integrityResult.issues.length,
        timestamp: integrityResult.timestamp
      });
      
      if (integrityResult.status === 'critical') {
        console.error('[EmployeePersistence] 启动检查发现严重问题，尝试自动修复...');
        
        const repairResult = await this.autoRepairData(integrityResult);
        
        // 记录修复结果
        await this._logAuditEvent('STARTUP_AUTO_REPAIR', {
          repaired: repairResult.repaired.length,
          failed: repairResult.failed.length,
          skipped: repairResult.skipped.length
        });
        
        if (repairResult.failed.length > 0) {
          console.error('[EmployeePersistence] 启动自动修复部分失败，需要人工干预');
        }
      } else if (integrityResult.status === 'warning') {
        console.warn('[EmployeePersistence] 启动检查发现警告问题:', integrityResult.issues.map(i => i.description));
      } else {
        console.log('[EmployeePersistence] 启动完整性检查通过');
      }
      
      return integrityResult;
      
    } catch (error) {
      console.error('[EmployeePersistence] 启动完整性检查失败:', error);
      
      // 记录审计日志
      await this._logAuditEvent('STARTUP_INTEGRITY_CHECK', {
        status: 'error',
        error: error.message
      });
      
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * 修复备份损坏
   * @private
   */
  static async _repairBackupCorruption(corruptedBackups) {
    try {
      console.log('[EmployeePersistence] 清理损坏的备份...');
      
      let cleanedCount = 0;
      
      for (const backup of corruptedBackups) {
        try {
          await this.deleteBackup(backup.backupId);
          cleanedCount++;
        } catch (error) {
          console.warn('[EmployeePersistence] 清理备份失败:', backup.backupId, error);
        }
      }
      
      // 创建新备份
      const newBackup = await this.createBackup(false);
      
      return {
        success: true,
        cleanedCount,
        newBackupCreated: newBackup.success,
        newBackupId: newBackup.backupId
      };
      
    } catch (error) {
      return {
        success: false,
        reason: error.message
      };
    }
  }

  /**
   * 修复数据一致性问题
   * @private
   */
  static async _repairDataInconsistency(issues) {
    try {
      console.log('[EmployeePersistence] 修复数据一致性问题...');
      
      const employees = await this.loadEmployees();
      let modified = false;
      
      for (const issue of issues) {
        switch (issue.type) {
          case 'date_inconsistency':
            // 修复日期不一致问题
            for (const empInfo of issue.details) {
              const emp = employees.find(e => e.id === empInfo.id);
              if (emp && emp.createDate && emp.updateDate) {
                if (new Date(emp.createDate) > new Date(emp.updateDate)) {
                  emp.updateDate = emp.createDate;
                  modified = true;
                }
              }
            }
            break;
            
          case 'department_inconsistency':
          case 'position_inconsistency':
            // 这些问题需要人工干预，自动修复可能不合适
            console.log('[EmployeePersistence] 跳过需要人工干预的一致性问题:', issue.type);
            break;
        }
      }
      
      if (modified) {
        const saveResult = await this.saveEmployees(employees);
        return {
          success: saveResult,
          modifiedCount: employees.length
        };
      }
      
      return {
        success: true,
        modifiedCount: 0
      };
      
    } catch (error) {
      return {
        success: false,
        reason: error.message
      };
    }
  }
}

// 自动初始化
if (typeof window !== 'undefined') {
  // 在浏览器环境中自动初始化
  document.addEventListener('DOMContentLoaded', () => {
    EmployeePersistence.initialize();
  });
  
  // 如果DOM已经加载完成，立即初始化
  if (document.readyState === 'loading') {
    // DOM还在加载中，等待DOMContentLoaded事件
  } else {
    // DOM已经加载完成，立即初始化
    EmployeePersistence.initialize();
  }
  
  // 页面卸载时清理
  window.addEventListener('beforeunload', () => {
    EmployeePersistence.cleanup();
  });
}

export default EmployeePersistence;
export { EmployeeDataError, EMPLOYEE_CONFIG };