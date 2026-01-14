/**
 * PersistenceManager - 统一的数据持久化管理器
 * 
 * 功能：
 * - 提供统一的存储接口（localStorage、sessionStorage、降级机制）
 * - 支持数据序列化和反序列化
 * - 实现存储容量检查和错误处理
 * - 提供数据压缩和完整性验证
 * 
 * Requirements: 1.1, 1.2, 6.1, 3.1, 4.1
 */

/**
 * 存储配置常量
 */
const STORAGE_CONFIG = {
  // 存储类型优先级
  STORAGE_TYPES: {
    LOCAL: 'localStorage',
    SESSION: 'sessionStorage',
    MEMORY: 'memory'
  },
  
  // 键前缀
  KEY_PREFIX: 'mes_system_',
  
  // 存储限制
  MAX_STORAGE_SIZE: 10 * 1024 * 1024, // 10MB
  WARNING_THRESHOLD: 0.8, // 80%使用率时警告
  
  // 功能开关
  COMPRESSION_ENABLED: false,  // 禁用压缩以提升性能
  ENCRYPTION_ENABLED: false,
  BACKUP_ENABLED: false,  // 禁用备份以提升性能
  
  // 重试配置
  MAX_RETRIES: 3,
  RETRY_DELAY: 100 // 毫秒
};

/**
 * 存储错误类型
 */
class StorageError extends Error {
  constructor(message, type, originalError = null) {
    super(message);
    this.name = 'StorageError';
    this.type = type;
    this.originalError = originalError;
  }
}

/**
 * 持久化管理器主类
 */
class PersistenceManager {
  /**
   * 当前使用的存储类型
   * @private
   */
  static _currentStorageType = null;
  
  /**
   * 内存存储备用方案
   * @private
   */
  static _memoryStorage = new Map();
  
  /**
   * 存储统计信息
   * @private
   */
  static _storageStats = {
    totalSize: 0,
    itemCount: 0,
    lastCleanup: null
  };

  /**
   * 初始化存储管理器
   * 检测可用的存储类型并设置默认存储
   */
  static initialize() {
    console.log('[PersistenceManager] 初始化存储管理器...');
    
    // 检测并设置最佳存储类型
    this._currentStorageType = this._detectBestStorageType();
    
    console.log(`[PersistenceManager] 使用存储类型: ${this._currentStorageType}`);
    
    // 初始化存储统计
    this._updateStorageStats();
    
    // 执行启动时清理
    this._performStartupCleanup();
    
    return this._currentStorageType;
  }

  /**
   * 检测最佳可用存储类型
   * @private
   */
  static _detectBestStorageType() {
    // 优先尝试localStorage
    if (this._isStorageAvailable(STORAGE_CONFIG.STORAGE_TYPES.LOCAL)) {
      return STORAGE_CONFIG.STORAGE_TYPES.LOCAL;
    }
    
    // 降级到sessionStorage
    if (this._isStorageAvailable(STORAGE_CONFIG.STORAGE_TYPES.SESSION)) {
      console.warn('[PersistenceManager] localStorage不可用，降级到sessionStorage');
      return STORAGE_CONFIG.STORAGE_TYPES.SESSION;
    }
    
    // 最后降级到内存存储
    console.warn('[PersistenceManager] 浏览器存储不可用，降级到内存模式');
    return STORAGE_CONFIG.STORAGE_TYPES.MEMORY;
  }

  /**
   * 检查存储是否可用
   * @private
   */
  static _isStorageAvailable(storageType) {
    try {
      const storage = window[storageType];
      const testKey = '__storage_test__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn(`[PersistenceManager] ${storageType}不可用:`, error.message);
      return false;
    }
  }

  /**
   * 保存数据到持久化存储
   * @param {string} key - 存储键
   * @param {any} data - 要保存的数据
   * @param {Object} options - 保存选项
   * @returns {Promise<boolean>} 保存是否成功
   */
  static async save(key, data, options = {}) {
    const startTime = performance.now();
    
    try {
      // 验证输入
      if (!key || typeof key !== 'string') {
        throw new StorageError('无效的存储键', 'INVALID_KEY');
      }
      
      // 生成完整的存储键
      const fullKey = this._generateStorageKey(key);
      
      // 准备存储数据
      const storageData = this._prepareStorageData(data, options);
      
      // 检查存储空间
      await this._checkStorageSpace(storageData);
      
      // 执行保存操作（带重试）
      const success = await this._saveWithRetry(fullKey, storageData);
      
      if (success) {
        // 更新统计信息
        this._updateStorageStats();
        
        // 创建备份（如果启用）
        if (STORAGE_CONFIG.BACKUP_ENABLED) {
          await this._createBackup(fullKey, storageData);
        }
        
        const duration = performance.now() - startTime;
        // 只在耗时超过1秒时输出警告
        if (duration > 1000) {
          console.warn(`[PersistenceManager] 数据保存耗时较长: ${duration.toFixed(2)}ms, key: ${key}`);
        }
        
        return true;
      }
      
      return false;
      
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`[PersistenceManager] 数据保存失败, 耗时: ${duration.toFixed(2)}ms, 错误:`, error);
      
      // 根据错误类型决定处理策略
      if (error instanceof StorageError) {
        switch (error.type) {
          case 'STORAGE_FULL':
            // 存储空间不足，尝试紧急清理
            console.log('[PersistenceManager] 尝试紧急清理...');
            await this._performEmergencyCleanup();
            throw error;
            
          case 'STORAGE_UNAVAILABLE':
            // 存储不可用，尝试降级到内存模式
            console.warn('[PersistenceManager] 存储不可用，尝试降级到内存模式');
            return await this._fallbackToMemoryMode(key, data);
            
          case 'QUOTA_EXCEEDED':
            // 配额超出，清理后重试
            console.log('[PersistenceManager] 存储配额超出，清理后重试');
            await this._performEmergencyCleanup();
            return await this._saveWithRetry(fullKey, storageData, 1); // 只重试一次
            
          default:
            throw error;
        }
      }
      
      // 其他错误，尝试降级到内存模式
      console.warn('[PersistenceManager] 保存失败，尝试降级到内存模式');
      return await this._fallbackToMemoryMode(key, data);
    }
  }

  /**
   * 从持久化存储加载数据
   * @param {string} key - 存储键
   * @param {any} defaultValue - 默认值
   * @returns {Promise<any>} 加载的数据
   */
  static async load(key, defaultValue = null) {
    const startTime = performance.now();
    
    try {
      // 验证输入
      if (!key || typeof key !== 'string') {
        throw new StorageError('无效的存储键', 'INVALID_KEY');
      }
      
      // 生成完整的存储键
      const fullKey = this._generateStorageKey(key);
      
      // 执行加载操作
      const rawData = await this._loadFromStorage(fullKey);
      
      if (rawData === null) {
        return defaultValue;
      }
      
      // 解析存储数据
      const data = this._parseStorageData(rawData);
      
      const duration = performance.now() - startTime;
      // 只在耗时超过500ms时输出警告
      if (duration > 500) {
        console.warn(`[PersistenceManager] 数据加载耗时较长: ${duration.toFixed(2)}ms, key: ${key}`);
      }
      
      return data;
      
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`[PersistenceManager] 数据加载失败, 耗时: ${duration.toFixed(2)}ms, 错误:`, error);
      
      // 尝试从备份恢复
      if (STORAGE_CONFIG.BACKUP_ENABLED) {
        console.log('[PersistenceManager] 尝试从备份恢复数据...');
        const backupData = await this._loadFromBackup(key);
        if (backupData !== null) {
          console.log('[PersistenceManager] 从备份恢复数据成功');
          return backupData;
        }
      }
      
      return defaultValue;
    }
  }

  /**
   * 删除持久化存储中的数据
   * @param {string} key - 存储键
   * @returns {Promise<boolean>} 删除是否成功
   */
  static async remove(key) {
    try {
      console.log(`[PersistenceManager] 开始删除数据, key: ${key}`);
      
      // 验证输入
      if (!key || typeof key !== 'string') {
        throw new StorageError('无效的存储键', 'INVALID_KEY');
      }
      
      // 生成完整的存储键
      const fullKey = this._generateStorageKey(key);
      
      // 执行删除操作
      const success = await this._removeFromStorage(fullKey);
      
      if (success) {
        // 删除备份
        await this._removeBackup(fullKey);
        
        // 更新统计信息
        this._updateStorageStats();
        
        console.log(`[PersistenceManager] 数据删除成功, key: ${key}`);
      }
      
      return success;
      
    } catch (error) {
      console.error(`[PersistenceManager] 数据删除失败, key: ${key}, 错误:`, error);
      return false;
    }
  }

  /**
   * 清除所有持久化数据
   * @returns {Promise<boolean>} 清除是否成功
   */
  static async clear() {
    try {
      console.log('[PersistenceManager] 开始清除所有数据...');
      
      const storage = this._getStorage();
      
      if (this._currentStorageType === STORAGE_CONFIG.STORAGE_TYPES.MEMORY) {
        this._memoryStorage.clear();
      } else {
        // 只清除带有我们前缀的键
        const keysToRemove = [];
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(STORAGE_CONFIG.KEY_PREFIX)) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => storage.removeItem(key));
      }
      
      // 重置统计信息
      this._storageStats = {
        totalSize: 0,
        itemCount: 0,
        lastCleanup: new Date().toISOString()
      };
      
      console.log('[PersistenceManager] 所有数据清除成功');
      return true;
      
    } catch (error) {
      console.error('[PersistenceManager] 清除数据失败:', error);
      return false;
    }
  }

  /**
   * 获取存储统计信息
   * @returns {Object} 存储统计信息
   */
  static getStorageInfo() {
    this._updateStorageStats();
    
    return {
      storageType: this._currentStorageType,
      stats: { ...this._storageStats },
      config: {
        maxSize: STORAGE_CONFIG.MAX_STORAGE_SIZE,
        warningThreshold: STORAGE_CONFIG.WARNING_THRESHOLD,
        compressionEnabled: STORAGE_CONFIG.COMPRESSION_ENABLED,
        backupEnabled: STORAGE_CONFIG.BACKUP_ENABLED
      },
      usage: {
        percentage: (this._storageStats.totalSize / STORAGE_CONFIG.MAX_STORAGE_SIZE) * 100,
        isNearLimit: (this._storageStats.totalSize / STORAGE_CONFIG.MAX_STORAGE_SIZE) > STORAGE_CONFIG.WARNING_THRESHOLD
      }
    };
  }

  // ============================================================================
  // 私有辅助方法
  // ============================================================================

  /**
   * 生成存储键
   * @private
   */
  static _generateStorageKey(key) {
    return `${STORAGE_CONFIG.KEY_PREFIX}${key}`;
  }

  /**
   * 获取当前存储对象
   * @private
   */
  static _getStorage() {
    if (this._currentStorageType === STORAGE_CONFIG.STORAGE_TYPES.MEMORY) {
      return this._memoryStorage;
    }
    return window[this._currentStorageType];
  }

  /**
   * 准备存储数据
   * @private
   */
  static _prepareStorageData(data, options) {
    const storageData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: data,
      metadata: {
        compressed: false,
        checksum: null,
        originalSize: 0,
        compressionRatio: 1.0
      }
    };
    
    // 序列化数据
    let serializedData = JSON.stringify(storageData);
    storageData.metadata.originalSize = serializedData.length;
    
    // 数据压缩（如果启用且数据较大）
    if (STORAGE_CONFIG.COMPRESSION_ENABLED && serializedData.length > 1024) {
      try {
        const compressed = this._compressData(serializedData);
        if (compressed && compressed.length < serializedData.length * 0.8) {
          console.log(`[PersistenceManager] 数据压缩成功，原始大小: ${serializedData.length}, 压缩后: ${compressed.length}, 压缩率: ${((1 - compressed.length / serializedData.length) * 100).toFixed(1)}%`);
          
          // 更新存储数据结构以包含压缩信息
          storageData.metadata.compressed = true;
          storageData.metadata.compressionRatio = compressed.length / serializedData.length;
          storageData.data = compressed; // 存储压缩后的数据
          
          serializedData = JSON.stringify(storageData);
        }
      } catch (error) {
        console.warn('[PersistenceManager] 数据压缩失败，使用原始数据:', error.message);
      }
    }
    
    // 生成校验和
    storageData.metadata.checksum = this._generateChecksum(serializedData);
    
    return serializedData;
  }

  /**
   * 解析存储数据
   * @private
   */
  static _parseStorageData(rawData) {
    try {
      const storageData = JSON.parse(rawData);
      
      // 验证数据格式
      if (!storageData.version || !storageData.data) {
        throw new Error('无效的存储数据格式');
      }
      
      // 验证校验和
      if (storageData.metadata && storageData.metadata.checksum) {
        const expectedChecksum = this._generateChecksum(rawData);
        if (storageData.metadata.checksum !== expectedChecksum) {
          console.warn('[PersistenceManager] 数据校验和不匹配，可能已损坏');
        }
      }
      
      // 解压缩数据（如果需要）
      if (storageData.metadata && storageData.metadata.compressed) {
        try {
          const decompressed = this._decompressData(storageData.data);
          if (decompressed) {
            console.log(`[PersistenceManager] 数据解压缩成功，压缩率: ${((1 - storageData.metadata.compressionRatio) * 100).toFixed(1)}%`);
            
            // 解析解压缩后的数据
            const decompressedStorageData = JSON.parse(decompressed);
            return decompressedStorageData.data;
          }
        } catch (error) {
          console.error('[PersistenceManager] 数据解压缩失败:', error);
          throw new StorageError('数据解压缩失败', 'DECOMPRESSION_ERROR', error);
        }
      }
      
      return storageData.data;
      
    } catch (error) {
      throw new StorageError('数据解析失败', 'PARSE_ERROR', error);
    }
  }

  /**
   * 带重试的保存操作
   * @private
   */
  static async _saveWithRetry(key, data, maxRetries = STORAGE_CONFIG.MAX_RETRIES) {
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this._saveToStorage(key, data);
        return true;
      } catch (error) {
        lastError = error;
        console.warn(`[PersistenceManager] 保存失败，第${attempt}次重试:`, error.message);
        
        // 检查是否是存储不可用错误
        if (this._isStorageUnavailableError(error)) {
          console.warn('[PersistenceManager] 检测到存储不可用，尝试重新初始化存储类型');
          this._currentStorageType = this._detectBestStorageType();
          
          if (this._currentStorageType === STORAGE_CONFIG.STORAGE_TYPES.MEMORY) {
            throw new StorageError('所有存储类型都不可用，已降级到内存模式', 'STORAGE_UNAVAILABLE', error);
          }
        }
        
        // 检查是否是配额超出错误
        if (this._isQuotaExceededError(error)) {
          throw new StorageError('存储配额超出', 'QUOTA_EXCEEDED', error);
        }
        
        if (attempt < maxRetries) {
          await this._delay(STORAGE_CONFIG.RETRY_DELAY * attempt);
        }
      }
    }
    
    throw new StorageError('保存操作重试失败', 'SAVE_FAILED', lastError);
  }

  /**
   * 保存到存储
   * @private
   */
  static async _saveToStorage(key, data) {
    const storage = this._getStorage();
    
    try {
      if (this._currentStorageType === STORAGE_CONFIG.STORAGE_TYPES.MEMORY) {
        storage.set(key, data);
      } else {
        storage.setItem(key, data);
      }
    } catch (error) {
      // 检查是否是存储不可用错误
      if (this._isStorageUnavailableError(error)) {
        throw new StorageError('存储不可用', 'STORAGE_UNAVAILABLE', error);
      }
      
      // 检查是否是配额超出错误
      if (this._isQuotaExceededError(error)) {
        throw new StorageError('存储配额超出', 'QUOTA_EXCEEDED', error);
      }
      
      // 其他存储错误
      throw new StorageError('存储操作失败', 'STORAGE_ERROR', error);
    }
  }

  /**
   * 从存储加载
   * @private
   */
  static async _loadFromStorage(key) {
    const storage = this._getStorage();
    
    if (this._currentStorageType === STORAGE_CONFIG.STORAGE_TYPES.MEMORY) {
      return storage.get(key) || null;
    } else {
      return storage.getItem(key);
    }
  }

  /**
   * 从存储删除
   * @private
   */
  static async _removeFromStorage(key) {
    const storage = this._getStorage();
    
    if (this._currentStorageType === STORAGE_CONFIG.STORAGE_TYPES.MEMORY) {
      return storage.delete(key);
    } else {
      storage.removeItem(key);
      return true;
    }
  }

  /**
   * 检查存储空间
   * @private
   */
  static async _checkStorageSpace(data) {
    const dataSize = data.length;
    const currentSize = this._storageStats.totalSize;
    const availableSpace = STORAGE_CONFIG.MAX_STORAGE_SIZE - currentSize;
    
    if (dataSize > availableSpace) {
      console.warn(`[PersistenceManager] 存储空间不足，需要 ${dataSize} 字节，可用 ${availableSpace} 字节`);
      
      // 尝试自动清理过期数据
      const cleanedSpace = await this._performAutomaticCleanup();
      const newAvailableSpace = availableSpace + cleanedSpace;
      
      if (dataSize > newAvailableSpace) {
        throw new StorageError(
          `存储空间不足，需要 ${dataSize} 字节，清理后可用 ${newAvailableSpace} 字节`, 
          'STORAGE_FULL',
          { required: dataSize, available: newAvailableSpace, cleaned: cleanedSpace }
        );
      }
      
      console.log(`[PersistenceManager] 自动清理释放了 ${cleanedSpace} 字节空间`);
    }
    
    const usageAfterSave = (currentSize + dataSize) / STORAGE_CONFIG.MAX_STORAGE_SIZE;
    if (usageAfterSave > STORAGE_CONFIG.WARNING_THRESHOLD) {
      console.warn(`[PersistenceManager] 存储空间使用率将达到 ${(usageAfterSave * 100).toFixed(1)}%`);
    }
  }

  /**
   * 更新存储统计信息
   * @private
   */
  static _updateStorageStats() {
    try {
      let totalSize = 0;
      let itemCount = 0;
      
      const storage = this._getStorage();
      
      if (this._currentStorageType === STORAGE_CONFIG.STORAGE_TYPES.MEMORY) {
        for (const [key, value] of storage) {
          if (key.startsWith(STORAGE_CONFIG.KEY_PREFIX)) {
            totalSize += value.length;
            itemCount++;
          }
        }
      } else {
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(STORAGE_CONFIG.KEY_PREFIX)) {
            const value = storage.getItem(key);
            if (value) {
              totalSize += value.length;
              itemCount++;
            }
          }
        }
      }
      
      this._storageStats = {
        totalSize,
        itemCount,
        lastUpdate: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('[PersistenceManager] 更新存储统计失败:', error);
    }
  }

  /**
   * 生成简单校验和
   * @private
   */
  static _generateChecksum(data) {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash.toString(16);
  }

  /**
   * 延迟函数
   * @private
   */
  static _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 启动时清理
   * @private
   */
  static _performStartupCleanup() {
    // 这里可以实现启动时的数据清理逻辑
    console.log('[PersistenceManager] 执行启动清理...');
  }

  /**
   * 紧急清理
   * @private
   */
  static async _performEmergencyCleanup() {
    console.log('[PersistenceManager] 执行紧急清理...');
    // 这里可以实现紧急清理逻辑，如删除过期数据
  }

  /**
   * 创建备份
   * @private
   */
  static async _createBackup(key, data) {
    try {
      const backupKey = `${key}_backup`;
      await this._saveToStorage(backupKey, data);
    } catch (error) {
      console.warn('[PersistenceManager] 创建备份失败:', error);
    }
  }

  /**
   * 从备份加载
   * @private
   */
  static async _loadFromBackup(key) {
    try {
      const backupKey = `${this._generateStorageKey(key)}_backup`;
      const rawData = await this._loadFromStorage(backupKey);
      if (rawData) {
        return this._parseStorageData(rawData);
      }
    } catch (error) {
      console.warn('[PersistenceManager] 从备份加载失败:', error);
    }
    return null;
  }

  /**
   * 删除备份
   * @private
   */
  static async _removeBackup(key) {
    try {
      const backupKey = `${key}_backup`;
      await this._removeFromStorage(backupKey);
    } catch (error) {
      console.warn('[PersistenceManager] 删除备份失败:', error);
    }
  }

  /**
   * 检查是否是存储不可用错误
   * @private
   */
  static _isStorageUnavailableError(error) {
    const unavailableMessages = [
      'localStorage is not available',
      'sessionStorage is not available',
      'Storage is disabled',
      'Access is denied',
      'SecurityError'
    ];
    
    return unavailableMessages.some(msg => 
      error.message?.includes(msg) || error.name?.includes('SecurityError')
    );
  }

  /**
   * 检查是否是配额超出错误
   * @private
   */
  static _isQuotaExceededError(error) {
    const quotaMessages = [
      'QuotaExceededError',
      'NS_ERROR_DOM_QUOTA_REACHED',
      'Quota exceeded',
      'Storage quota exceeded'
    ];
    
    return quotaMessages.some(msg => 
      error.message?.includes(msg) || error.name?.includes(msg)
    );
  }

  /**
   * 降级到内存模式
   * @private
   */
  static async _fallbackToMemoryMode(key, data) {
    try {
      console.log('[PersistenceManager] 降级到内存模式保存数据');
      
      // 切换到内存存储
      const originalStorageType = this._currentStorageType;
      this._currentStorageType = STORAGE_CONFIG.STORAGE_TYPES.MEMORY;
      
      // 保存到内存存储
      const fullKey = this._generateStorageKey(key);
      const storageData = this._prepareStorageData(data);
      this._memoryStorage.set(fullKey, storageData);
      
      console.log(`[PersistenceManager] 数据已保存到内存模式 (原存储类型: ${originalStorageType})`);
      
      // 更新统计信息
      this._updateStorageStats();
      
      return true;
    } catch (error) {
      console.error('[PersistenceManager] 内存模式保存也失败:', error);
      return false;
    }
  }

  /**
   * 自动清理过期数据
   * @private
   */
  static async _performAutomaticCleanup() {
    console.log('[PersistenceManager] 开始自动清理过期数据...');
    
    let cleanedSpace = 0;
    const storage = this._getStorage();
    const keysToRemove = [];
    
    try {
      if (this._currentStorageType === STORAGE_CONFIG.STORAGE_TYPES.MEMORY) {
        // 内存存储清理
        for (const [key, value] of storage) {
          if (key.startsWith(STORAGE_CONFIG.KEY_PREFIX)) {
            try {
              const data = JSON.parse(value);
              if (this._isDataExpired(data)) {
                keysToRemove.push(key);
                cleanedSpace += value.length;
              }
            } catch (error) {
              // 无效数据，标记删除
              keysToRemove.push(key);
              cleanedSpace += value.length;
            }
          }
        }
      } else {
        // 浏览器存储清理
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(STORAGE_CONFIG.KEY_PREFIX)) {
            try {
              const value = storage.getItem(key);
              if (value) {
                const data = JSON.parse(value);
                if (this._isDataExpired(data)) {
                  keysToRemove.push(key);
                  cleanedSpace += value.length;
                }
              }
            } catch (error) {
              // 无效数据，标记删除
              keysToRemove.push(key);
              const value = storage.getItem(key);
              if (value) cleanedSpace += value.length;
            }
          }
        }
      }
      
      // 删除过期数据
      for (const key of keysToRemove) {
        await this._removeFromStorage(key);
      }
      
      console.log(`[PersistenceManager] 自动清理完成，删除了 ${keysToRemove.length} 个过期项，释放了 ${cleanedSpace} 字节`);
      
    } catch (error) {
      console.error('[PersistenceManager] 自动清理失败:', error);
    }
    
    return cleanedSpace;
  }

  /**
   * 检查数据是否过期
   * @private
   */
  static _isDataExpired(data) {
    if (!data.timestamp) return false;
    
    const dataAge = Date.now() - new Date(data.timestamp).getTime();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7天
    
    return dataAge > maxAge;
  }

  /**
   * 紧急清理
   * @private
   */
  static async _performEmergencyCleanup() {
    console.log('[PersistenceManager] 执行紧急清理...');
    
    try {
      // 1. 清理过期数据
      const cleanedSpace = await this._performAutomaticCleanup();
      
      // 2. 如果空间仍然不足，清理最旧的数据
      if (cleanedSpace < STORAGE_CONFIG.MAX_STORAGE_SIZE * 0.1) { // 如果清理的空间少于10%
        await this._cleanupOldestData();
      }
      
      // 3. 更新统计信息
      this._updateStorageStats();
      
      console.log('[PersistenceManager] 紧急清理完成');
      
    } catch (error) {
      console.error('[PersistenceManager] 紧急清理失败:', error);
    }
  }

  /**
   * 清理最旧的数据
   * @private
   */
  static async _cleanupOldestData() {
    console.log('[PersistenceManager] 清理最旧的数据...');
    
    const storage = this._getStorage();
    const dataItems = [];
    
    try {
      if (this._currentStorageType === STORAGE_CONFIG.STORAGE_TYPES.MEMORY) {
        for (const [key, value] of storage) {
          if (key.startsWith(STORAGE_CONFIG.KEY_PREFIX) && !key.includes('_backup')) {
            try {
              const data = JSON.parse(value);
              dataItems.push({
                key,
                timestamp: new Date(data.timestamp || 0).getTime(),
                size: value.length
              });
            } catch (error) {
              // 无效数据，添加到清理列表
              dataItems.push({
                key,
                timestamp: 0,
                size: value.length
              });
            }
          }
        }
      } else {
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(STORAGE_CONFIG.KEY_PREFIX) && !key.includes('_backup')) {
            try {
              const value = storage.getItem(key);
              if (value) {
                const data = JSON.parse(value);
                dataItems.push({
                  key,
                  timestamp: new Date(data.timestamp || 0).getTime(),
                  size: value.length
                });
              }
            } catch (error) {
              // 无效数据，添加到清理列表
              dataItems.push({
                key,
                timestamp: 0,
                size: value.length
              });
            }
          }
        }
      }
      
      // 按时间戳排序，最旧的在前
      dataItems.sort((a, b) => a.timestamp - b.timestamp);
      
      // 删除最旧的20%数据
      const itemsToDelete = Math.ceil(dataItems.length * 0.2);
      for (let i = 0; i < itemsToDelete && i < dataItems.length; i++) {
        await this._removeFromStorage(dataItems[i].key);
        console.log(`[PersistenceManager] 删除旧数据: ${dataItems[i].key}`);
      }
      
      console.log(`[PersistenceManager] 清理了 ${itemsToDelete} 个最旧的数据项`);
      
    } catch (error) {
      console.error('[PersistenceManager] 清理最旧数据失败:', error);
    }
  }

  // ============================================================================
  // 数据压缩和优化功能
  // ============================================================================

  /**
   * 压缩数据
   * 使用改进的多层压缩算法
   * @private
   */
  static _compressData(data) {
    try {
      // 多层压缩策略
      let bestCompressed = null;
      let bestRatio = 1.0;
      
      // 1. LZ77风格压缩（改进版）
      const lz77Result = this._compressLZ77(data);
      if (lz77Result && lz77Result.length < data.length * bestRatio) {
        bestCompressed = lz77Result;
        bestRatio = lz77Result.length / data.length;
      }
      
      // 2. 字典压缩（适用于JSON数据）
      if (data.includes('{') || data.includes('[')) {
        const dictResult = this._compressDictionary(data);
        if (dictResult && dictResult.length < data.length * bestRatio) {
          bestCompressed = dictResult;
          bestRatio = dictResult.length / data.length;
        }
      }
      
      // 3. 重复模式压缩
      const patternResult = this._compressPatterns(data);
      if (patternResult && patternResult.length < data.length * bestRatio) {
        bestCompressed = patternResult;
        bestRatio = patternResult.length / data.length;
      }
      
      // 只有在压缩率超过20%时才使用压缩
      if (bestRatio < 0.8) {
        return bestCompressed;
      }
      
      return null;
      
    } catch (error) {
      console.error('[PersistenceManager] 数据压缩失败:', error);
      return null;
    }
  }

  /**
   * LZ77风格压缩（改进版）
   * @private
   */
  static _compressLZ77(data) {
    try {
      const windowSize = 4096;
      const lookAheadSize = 256;
      const minMatchLength = 3;
      
      let compressed = '';
      let position = 0;
      
      while (position < data.length) {
        let bestMatch = { length: 0, distance: 0 };
        
        // 搜索窗口
        const searchStart = Math.max(0, position - windowSize);
        const searchEnd = position;
        
        // 前瞻缓冲区
        const lookAheadEnd = Math.min(data.length, position + lookAheadSize);
        
        // 查找最长匹配
        for (let i = searchStart; i < searchEnd; i++) {
          let matchLength = 0;
          
          while (
            position + matchLength < lookAheadEnd &&
            data[i + matchLength] === data[position + matchLength] &&
            matchLength < lookAheadSize
          ) {
            matchLength++;
          }
          
          if (matchLength >= minMatchLength && matchLength > bestMatch.length) {
            bestMatch = {
              length: matchLength,
              distance: position - i
            };
          }
        }
        
        if (bestMatch.length >= minMatchLength) {
          // 编码匹配
          compressed += `<${bestMatch.distance},${bestMatch.length}>`;
          position += bestMatch.length;
        } else {
          // 编码字面字符
          compressed += data[position];
          position++;
        }
      }
      
      return JSON.stringify({
        type: 'lz77',
        data: compressed,
        originalLength: data.length
      });
      
    } catch (error) {
      console.error('[PersistenceManager] LZ77压缩失败:', error);
      return null;
    }
  }

  /**
   * 字典压缩（适用于JSON数据）
   * @private
   */
  static _compressDictionary(data) {
    try {
      // 构建字典，查找常见的JSON模式
      const patterns = new Map();
      const commonPatterns = [
        '"id":', '"name":', '"department":', '"position":', '"phone":', '"email":',
        '"timestamp":', '"version":', '"metadata":', '"employees":',
        '{"', '"}', ',"', ':[', '],"', 'null', 'true', 'false'
      ];
      
      // 添加常见模式到字典
      commonPatterns.forEach((pattern, index) => {
        if (data.includes(pattern)) {
          patterns.set(pattern, String.fromCharCode(0x2000 + index));
        }
      });
      
      // 查找重复的长字符串
      const words = data.match(/\b\w{4,}\b/g) || [];
      const wordCounts = new Map();
      
      words.forEach(word => {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      });
      
      // 将高频词添加到字典
      let dictIndex = commonPatterns.length;
      for (const [word, count] of wordCounts) {
        if (count >= 3 && word.length >= 4 && dictIndex < 200) {
          patterns.set(word, String.fromCharCode(0x2000 + dictIndex));
          dictIndex++;
        }
      }
      
      // 应用字典压缩
      let compressed = data;
      for (const [pattern, replacement] of patterns) {
        compressed = compressed.split(pattern).join(replacement);
      }
      
      return JSON.stringify({
        type: 'dictionary',
        data: compressed,
        dictionary: Array.from(patterns.entries()),
        originalLength: data.length
      });
      
    } catch (error) {
      console.error('[PersistenceManager] 字典压缩失败:', error);
      return null;
    }
  }

  /**
   * 重复模式压缩
   * @private
   */
  static _compressPatterns(data) {
    try {
      // 查找重复的模式
      const patterns = new Map();
      const minPatternLength = 10;
      const maxPatternLength = 100;
      
      for (let len = minPatternLength; len <= maxPatternLength; len++) {
        for (let i = 0; i <= data.length - len * 2; i++) {
          const pattern = data.substring(i, i + len);
          const nextOccurrence = data.indexOf(pattern, i + len);
          
          if (nextOccurrence !== -1) {
            const key = `pattern_${len}_${i}`;
            if (!patterns.has(pattern)) {
              patterns.set(pattern, key);
            }
          }
        }
      }
      
      // 应用模式替换
      let compressed = data;
      let patternIndex = 0;
      
      for (const [pattern, key] of patterns) {
        const occurrences = (compressed.match(new RegExp(this._escapeRegExp(pattern), 'g')) || []).length;
        
        if (occurrences >= 2) {
          const replacement = `§P${patternIndex}§`;
          compressed = compressed.split(pattern).join(replacement);
          patternIndex++;
        }
      }
      
      return JSON.stringify({
        type: 'patterns',
        data: compressed,
        patterns: Array.from(patterns.entries()).slice(0, patternIndex),
        originalLength: data.length
      });
      
    } catch (error) {
      console.error('[PersistenceManager] 模式压缩失败:', error);
      return null;
    }
  }

  /**
   * 转义正则表达式特殊字符
   * @private
   */
  static _escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 解压缩数据（支持多种压缩格式）
   * @private
   */
  static _decompressData(compressedData) {
    try {
      const compressionInfo = JSON.parse(compressedData);
      
      switch (compressionInfo.type) {
        case 'lz77':
          return this._decompressLZ77(compressionInfo);
          
        case 'dictionary':
          return this._decompressDictionary(compressionInfo);
          
        case 'patterns':
          return this._decompressPatterns(compressionInfo);
          
        default:
          // 兼容旧格式
          return this._decompressLegacy(compressionInfo);
      }
      
    } catch (error) {
      console.error('[PersistenceManager] 数据解压缩失败:', error);
      return null;
    }
  }

  /**
   * LZ77解压缩
   * @private
   */
  static _decompressLZ77(compressionInfo) {
    try {
      const { data } = compressionInfo;
      let decompressed = '';
      let i = 0;
      
      while (i < data.length) {
        if (data[i] === '<') {
          // 查找匹配结束标记
          const endIndex = data.indexOf('>', i);
          if (endIndex !== -1) {
            const matchInfo = data.substring(i + 1, endIndex);
            const [distance, length] = matchInfo.split(',').map(Number);
            
            // 复制匹配的数据
            const startPos = decompressed.length - distance;
            for (let j = 0; j < length; j++) {
              decompressed += decompressed[startPos + j];
            }
            
            i = endIndex + 1;
          } else {
            decompressed += data[i];
            i++;
          }
        } else {
          decompressed += data[i];
          i++;
        }
      }
      
      return decompressed;
      
    } catch (error) {
      console.error('[PersistenceManager] LZ77解压缩失败:', error);
      return null;
    }
  }

  /**
   * 字典解压缩
   * @private
   */
  static _decompressDictionary(compressionInfo) {
    try {
      const { data, dictionary } = compressionInfo;
      let decompressed = data;
      
      // 重建字典映射
      const dictMap = new Map();
      for (const [pattern, replacement] of dictionary) {
        dictMap.set(replacement, pattern);
      }
      
      // 应用字典解压缩
      for (const [replacement, pattern] of dictMap) {
        decompressed = decompressed.split(replacement).join(pattern);
      }
      
      return decompressed;
      
    } catch (error) {
      console.error('[PersistenceManager] 字典解压缩失败:', error);
      return null;
    }
  }

  /**
   * 模式解压缩
   * @private
   */
  static _decompressPatterns(compressionInfo) {
    try {
      const { data, patterns } = compressionInfo;
      let decompressed = data;
      
      // 应用模式替换
      patterns.forEach(([pattern, key], index) => {
        const replacement = `§P${index}§`;
        decompressed = decompressed.split(replacement).join(pattern);
      });
      
      return decompressed;
      
    } catch (error) {
      console.error('[PersistenceManager] 模式解压缩失败:', error);
      return null;
    }
  }

  /**
   * 兼容旧格式解压缩
   * @private
   */
  static _decompressLegacy(compressionInfo) {
    try {
      const { compressed, dictionary } = compressionInfo;
      
      // 重建字典
      const dictMap = new Map();
      for (const [key, value] of dictionary) {
        dictMap.set(value, key);
      }
      
      // 解压缩数据
      let decompressed = '';
      let i = 0;
      
      while (i < compressed.length) {
        if (compressed[i] === '§') {
          // 查找结束标记
          const endIndex = compressed.indexOf('§', i + 1);
          if (endIndex !== -1) {
            const dictIndex = parseInt(compressed.substring(i + 1, endIndex));
            if (dictMap.has(dictIndex)) {
              decompressed += dictMap.get(dictIndex);
            }
            i = endIndex + 1;
          } else {
            decompressed += compressed[i];
            i++;
          }
        } else {
          decompressed += compressed[i];
          i++;
        }
      }
      
      return decompressed;
      
    } catch (error) {
      console.error('[PersistenceManager] 兼容格式解压缩失败:', error);
      return null;
    }
  }

  /**
   * 批量保存数据（优化版）
   * @param {Array} items - 要保存的数据项数组 [{key, data, options}]
   * @param {Object} batchOptions - 批量操作选项
   * @returns {Promise<Object>} 批量保存结果
   */
  static async batchSave(items, batchOptions = {}) {
    const startTime = performance.now();
    
    try {
      const {
        chunkSize = 50,
        parallelChunks = 3,
        progressCallback = null,
        validateData = true,
        optimizeCompression = true
      } = batchOptions;
      
      console.log(`[PersistenceManager] 开始优化批量保存 ${items.length} 个数据项`);
      
      const results = {
        success: 0,
        failed: 0,
        errors: [],
        compressionStats: {
          totalOriginalSize: 0,
          totalCompressedSize: 0,
          compressionRatio: 1.0
        }
      };
      
      // 数据验证
      if (validateData) {
        items = items.filter(item => {
          if (!item.key || item.data === undefined) {
            results.failed++;
            results.errors.push({
              key: item.key || 'unknown',
              error: '无效的数据项格式'
            });
            return false;
          }
          return true;
        });
      }
      
      // 分块处理
      const chunks = this._chunkArray(items, chunkSize);
      const totalChunks = chunks.length;
      
      // 并行处理块
      for (let i = 0; i < totalChunks; i += parallelChunks) {
        const currentChunks = chunks.slice(i, i + parallelChunks);
        
        const chunkPromises = currentChunks.map(async (chunk, chunkIndex) => {
          return await this._processBatchChunk(chunk, optimizeCompression, results);
        });
        
        await Promise.all(chunkPromises);
        
        // 进度回调
        if (progressCallback) {
          const progress = Math.min(100, ((i + parallelChunks) / totalChunks) * 100);
          progressCallback(progress, results);
        }
      }
      
      // 计算压缩统计
      if (results.compressionStats.totalOriginalSize > 0) {
        results.compressionStats.compressionRatio = 
          results.compressionStats.totalCompressedSize / results.compressionStats.totalOriginalSize;
      }
      
      // 更新统计信息
      this._updateStorageStats();
      
      const duration = performance.now() - startTime;
      console.log(`[PersistenceManager] 优化批量保存完成，成功: ${results.success}, 失败: ${results.failed}, 耗时: ${duration.toFixed(2)}ms`);
      console.log(`[PersistenceManager] 压缩率: ${((1 - results.compressionStats.compressionRatio) * 100).toFixed(1)}%`);
      
      return {
        success: results.failed === 0,
        results: results,
        duration: duration
      };
      
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`[PersistenceManager] 优化批量保存失败, 耗时: ${duration.toFixed(2)}ms, 错误:`, error);
      
      return {
        success: false,
        error: error.message,
        duration: duration
      };
    }
  }

  /**
   * 处理批量保存块
   * @private
   */
  static async _processBatchChunk(chunk, optimizeCompression, results) {
    for (const item of chunk) {
      try {
        const fullKey = this._generateStorageKey(item.key);
        const originalData = JSON.stringify(item.data);
        const storageData = this._prepareStorageData(item.data, {
          ...item.options,
          forceCompression: optimizeCompression && originalData.length > 1024
        });
        
        // 记录压缩统计
        results.compressionStats.totalOriginalSize += originalData.length;
        results.compressionStats.totalCompressedSize += storageData.length;
        
        await this._saveToStorage(fullKey, storageData);
        results.success++;
        
        // 创建备份（如果启用）
        if (STORAGE_CONFIG.BACKUP_ENABLED) {
          await this._createBackup(fullKey, storageData);
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          key: item.key,
          error: error.message
        });
      }
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
   * 批量加载数据
   * @param {Array} keys - 要加载的键数组
   * @returns {Promise<Object>} 批量加载结果
   */
  static async batchLoad(keys) {
    const startTime = performance.now();
    
    try {
      console.log(`[PersistenceManager] 开始批量加载 ${keys.length} 个数据项`);
      
      const results = {};
      const errors = [];
      
      for (const key of keys) {
        try {
          const data = await this.load(key);
          results[key] = data;
        } catch (error) {
          errors.push({
            key: key,
            error: error.message
          });
          results[key] = null;
        }
      }
      
      const duration = performance.now() - startTime;
      console.log(`[PersistenceManager] 批量加载完成，成功: ${Object.keys(results).length - errors.length}, 失败: ${errors.length}, 耗时: ${duration.toFixed(2)}ms`);
      
      return {
        success: errors.length === 0,
        data: results,
        errors: errors,
        duration: duration
      };
      
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`[PersistenceManager] 批量加载失败, 耗时: ${duration.toFixed(2)}ms, 错误:`, error);
      
      return {
        success: false,
        error: error.message,
        duration: duration
      };
    }
  }

  /**
   * 数据维护和清理（增强版）
   * @param {Object} options - 清理选项
   * @returns {Promise<Object>} 清理结果
   */
  static async performMaintenance(options = {}) {
    const startTime = performance.now();
    
    try {
      console.log('[PersistenceManager] 开始增强数据维护和清理...');
      
      const {
        cleanExpired = true,
        cleanCorrupted = true,
        optimizeStorage = true,
        compactData = true,
        defragmentStorage = true,
        maxAge = 7 * 24 * 60 * 60 * 1000, // 7天
        aggressiveCleanup = false,
        progressCallback = null
      } = options;
      
      const results = {
        expiredCleaned: 0,
        corruptedCleaned: 0,
        spaceSaved: 0,
        compactedItems: 0,
        defragmentedItems: 0,
        optimizedItems: 0,
        errors: [],
        phases: []
      };
      
      const storage = this._getStorage();
      const itemsToProcess = [];
      
      // 阶段1: 收集数据项
      console.log('[PersistenceManager] 阶段1: 收集数据项...');
      if (this._currentStorageType === STORAGE_CONFIG.STORAGE_TYPES.MEMORY) {
        for (const [key, value] of storage) {
          if (key.startsWith(STORAGE_CONFIG.KEY_PREFIX)) {
            itemsToProcess.push({ key, value });
          }
        }
      } else {
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(STORAGE_CONFIG.KEY_PREFIX)) {
            const value = storage.getItem(key);
            if (value) {
              itemsToProcess.push({ key, value });
            }
          }
        }
      }
      
      results.phases.push({
        phase: 'collection',
        itemsFound: itemsToProcess.length,
        duration: performance.now() - startTime
      });
      
      if (progressCallback) progressCallback(10, results);
      
      // 阶段2: 分析和分类数据
      console.log('[PersistenceManager] 阶段2: 分析数据...');
      const analysisResult = await this._analyzeStorageData(itemsToProcess);
      results.phases.push({
        phase: 'analysis',
        ...analysisResult,
        duration: performance.now() - startTime
      });
      
      if (progressCallback) progressCallback(25, results);
      
      // 阶段3: 清理过期和损坏数据
      if (cleanExpired || cleanCorrupted) {
        console.log('[PersistenceManager] 阶段3: 清理无效数据...');
        const cleanupResult = await this._performAdvancedCleanup(
          itemsToProcess, 
          { cleanExpired, cleanCorrupted, maxAge, aggressiveCleanup }
        );
        
        results.expiredCleaned = cleanupResult.expiredCleaned;
        results.corruptedCleaned = cleanupResult.corruptedCleaned;
        results.spaceSaved += cleanupResult.spaceSaved;
        results.errors.push(...cleanupResult.errors);
        
        results.phases.push({
          phase: 'cleanup',
          ...cleanupResult,
          duration: performance.now() - startTime
        });
      }
      
      if (progressCallback) progressCallback(50, results);
      
      // 阶段4: 数据压缩优化
      if (compactData) {
        console.log('[PersistenceManager] 阶段4: 数据压缩优化...');
        const compactionResult = await this._performDataCompaction(itemsToProcess);
        
        results.compactedItems = compactionResult.compactedItems;
        results.spaceSaved += compactionResult.spaceSaved;
        results.errors.push(...compactionResult.errors);
        
        results.phases.push({
          phase: 'compaction',
          ...compactionResult,
          duration: performance.now() - startTime
        });
      }
      
      if (progressCallback) progressCallback(75, results);
      
      // 阶段5: 存储碎片整理
      if (defragmentStorage) {
        console.log('[PersistenceManager] 阶段5: 存储碎片整理...');
        const defragResult = await this._performStorageDefragmentation();
        
        results.defragmentedItems = defragResult.defragmentedItems;
        results.spaceSaved += defragResult.spaceSaved;
        results.errors.push(...defragResult.errors);
        
        results.phases.push({
          phase: 'defragmentation',
          ...defragResult,
          duration: performance.now() - startTime
        });
      }
      
      if (progressCallback) progressCallback(90, results);
      
      // 阶段6: 存储优化
      if (optimizeStorage) {
        console.log('[PersistenceManager] 阶段6: 存储优化...');
        const optimizationResult = await this._performStorageOptimization();
        
        results.optimizedItems = optimizationResult.optimizedItems;
        results.spaceSaved += optimizationResult.spaceSaved;
        
        results.phases.push({
          phase: 'optimization',
          ...optimizationResult,
          duration: performance.now() - startTime
        });
      }
      
      // 更新统计信息
      this._updateStorageStats();
      
      const duration = performance.now() - startTime;
      console.log(`[PersistenceManager] 增强数据维护完成，耗时: ${duration.toFixed(2)}ms`);
      console.log(`  - 清理过期数据: ${results.expiredCleaned} 项`);
      console.log(`  - 清理损坏数据: ${results.corruptedCleaned} 项`);
      console.log(`  - 重新压缩数据: ${results.compactedItems} 项`);
      console.log(`  - 碎片整理: ${results.defragmentedItems} 项`);
      console.log(`  - 存储优化: ${results.optimizedItems} 项`);
      console.log(`  - 总节省空间: ${results.spaceSaved} 字节`);
      console.log(`  - 错误数量: ${results.errors.length} 个`);
      
      if (progressCallback) progressCallback(100, results);
      
      return {
        success: true,
        results: results,
        duration: duration
      };
      
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`[PersistenceManager] 增强数据维护失败, 耗时: ${duration.toFixed(2)}ms, 错误:`, error);
      
      return {
        success: false,
        error: error.message,
        duration: duration
      };
    }
  }

  /**
   * 分析存储数据
   * @private
   */
  static async _analyzeStorageData(items) {
    const analysis = {
      totalItems: items.length,
      totalSize: 0,
      compressedItems: 0,
      uncompressedItems: 0,
      corruptedItems: 0,
      expiredItems: 0,
      duplicateItems: 0,
      sizeDistribution: {
        small: 0,    // < 1KB
        medium: 0,   // 1KB - 10KB
        large: 0,    // 10KB - 100KB
        huge: 0      // > 100KB
      }
    };
    
    const checksums = new Map();
    
    for (const item of items) {
      analysis.totalSize += item.value.length;
      
      // 大小分布
      if (item.value.length < 1024) {
        analysis.sizeDistribution.small++;
      } else if (item.value.length < 10240) {
        analysis.sizeDistribution.medium++;
      } else if (item.value.length < 102400) {
        analysis.sizeDistribution.large++;
      } else {
        analysis.sizeDistribution.huge++;
      }
      
      try {
        const data = JSON.parse(item.value);
        
        // 检查是否压缩
        if (data.metadata && data.metadata.compressed) {
          analysis.compressedItems++;
        } else {
          analysis.uncompressedItems++;
        }
        
        // 检查是否过期
        if (this._isDataExpired(data)) {
          analysis.expiredItems++;
        }
        
        // 检查重复数据
        const checksum = this._generateChecksum(item.value);
        if (checksums.has(checksum)) {
          analysis.duplicateItems++;
        } else {
          checksums.set(checksum, item.key);
        }
        
      } catch (error) {
        analysis.corruptedItems++;
      }
    }
    
    return analysis;
  }

  /**
   * 执行高级清理
   * @private
   */
  static async _performAdvancedCleanup(items, options) {
    const result = {
      expiredCleaned: 0,
      corruptedCleaned: 0,
      duplicatesCleaned: 0,
      spaceSaved: 0,
      errors: []
    };
    
    const { cleanExpired, cleanCorrupted, maxAge, aggressiveCleanup } = options;
    const seenChecksums = new Map();
    
    for (const item of items) {
      try {
        let shouldRemove = false;
        let removalReason = '';
        
        // 检查重复数据
        const checksum = this._generateChecksum(item.value);
        if (seenChecksums.has(checksum)) {
          shouldRemove = true;
          removalReason = 'duplicate';
          result.duplicatesCleaned++;
        } else {
          seenChecksums.set(checksum, item.key);
        }
        
        if (!shouldRemove) {
          try {
            const data = JSON.parse(item.value);
            
            // 检查过期数据
            if (cleanExpired && data.timestamp) {
              const age = Date.now() - new Date(data.timestamp).getTime();
              if (age > maxAge) {
                shouldRemove = true;
                removalReason = 'expired';
                result.expiredCleaned++;
              }
            }
            
            // 激进清理模式
            if (aggressiveCleanup && !shouldRemove) {
              // 清理空数据
              if (!data.data || (Array.isArray(data.data) && data.data.length === 0)) {
                shouldRemove = true;
                removalReason = 'empty';
              }
              
              // 清理过大的数据
              if (item.value.length > 1024 * 1024) { // 1MB
                shouldRemove = true;
                removalReason = 'too_large';
              }
            }
            
          } catch (parseError) {
            // 检查损坏数据
            if (cleanCorrupted) {
              shouldRemove = true;
              removalReason = 'corrupted';
              result.corruptedCleaned++;
            }
          }
        }
        
        if (shouldRemove) {
          await this._removeFromStorage(item.key);
          result.spaceSaved += item.value.length;
          console.log(`[PersistenceManager] 清理数据: ${item.key} (原因: ${removalReason})`);
        }
        
      } catch (error) {
        result.errors.push({
          key: item.key,
          operation: 'cleanup',
          error: error.message
        });
      }
    }
    
    return result;
  }

  /**
   * 执行数据压缩
   * @private
   */
  static async _performDataCompaction(items) {
    const result = {
      compactedItems: 0,
      spaceSaved: 0,
      errors: []
    };
    
    for (const item of items) {
      try {
        const data = JSON.parse(item.value);
        
        // 检查是否需要重新压缩
        let needsRecompression = false;
        
        if (!data.metadata || !data.metadata.compressed) {
          // 未压缩的大数据
          if (item.value.length > 2048) {
            needsRecompression = true;
          }
        } else {
          // 已压缩但压缩率不佳的数据
          if (data.metadata.compressionRatio > 0.8) {
            needsRecompression = true;
          }
        }
        
        if (needsRecompression) {
          try {
            // 重新压缩数据
            const originalData = this._parseStorageData(item.value);
            const recompressed = this._prepareStorageData(originalData, { forceCompression: true });
            
            if (recompressed.length < item.value.length) {
              await this._saveToStorage(item.key, recompressed);
              result.spaceSaved += (item.value.length - recompressed.length);
              result.compactedItems++;
              
              console.log(`[PersistenceManager] 重新压缩: ${item.key}, 节省: ${item.value.length - recompressed.length} 字节`);
            }
          } catch (compressionError) {
            result.errors.push({
              key: item.key,
              operation: 'recompress',
              error: compressionError.message
            });
          }
        }
        
      } catch (error) {
        result.errors.push({
          key: item.key,
          operation: 'parse',
          error: error.message
        });
      }
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
      spaceSaved: 0,
      errors: []
    };
    
    try {
      // 对于localStorage/sessionStorage，重新组织存储顺序
      if (this._currentStorageType !== STORAGE_CONFIG.STORAGE_TYPES.MEMORY) {
        const storage = this._getStorage();
        const allItems = [];
        
        // 收集所有数据
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(STORAGE_CONFIG.KEY_PREFIX)) {
            const value = storage.getItem(key);
            if (value) {
              allItems.push({ key, value });
            }
          }
        }
        
        // 按大小排序（小的在前）
        allItems.sort((a, b) => a.value.length - b.value.length);
        
        // 重新写入
        for (const item of allItems) {
          storage.removeItem(item.key);
          storage.setItem(item.key, item.value);
          result.defragmentedItems++;
        }
        
        console.log(`[PersistenceManager] 碎片整理完成，重新组织了 ${result.defragmentedItems} 个数据项`);
      }
      
    } catch (error) {
      result.errors.push({
        operation: 'defragmentation',
        error: error.message
      });
    }
    
    return result;
  }

  /**
   * 执行存储优化
   * @private
   */
  static async _performStorageOptimization() {
    const result = {
      optimizedItems: 0,
      spaceSaved: 0,
      errors: []
    };
    
    try {
      // 优化存储配置
      const storageInfo = this.getStorageInfo();
      
      // 如果使用率过高，调整压缩策略
      if (storageInfo.usage.percentage > 70) {
        console.log('[PersistenceManager] 存储使用率过高，启用激进压缩模式');
        
        // 临时启用更激进的压缩
        const originalCompressionEnabled = STORAGE_CONFIG.COMPRESSION_ENABLED;
        STORAGE_CONFIG.COMPRESSION_ENABLED = true;
        
        // 重新压缩大文件
        const storage = this._getStorage();
        const largeItems = [];
        
        if (this._currentStorageType === STORAGE_CONFIG.STORAGE_TYPES.MEMORY) {
          for (const [key, value] of storage) {
            if (key.startsWith(STORAGE_CONFIG.KEY_PREFIX) && value.length > 5120) { // 5KB
              largeItems.push({ key, value });
            }
          }
        } else {
          for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (key && key.startsWith(STORAGE_CONFIG.KEY_PREFIX)) {
              const value = storage.getItem(key);
              if (value && value.length > 5120) { // 5KB
                largeItems.push({ key, value });
              }
            }
          }
        }
        
        for (const item of largeItems) {
          try {
            const originalData = this._parseStorageData(item.value);
            const optimized = this._prepareStorageData(originalData, { forceCompression: true });
            
            if (optimized.length < item.value.length) {
              await this._saveToStorage(item.key, optimized);
              result.spaceSaved += (item.value.length - optimized.length);
              result.optimizedItems++;
            }
          } catch (error) {
            result.errors.push({
              key: item.key,
              operation: 'optimize',
              error: error.message
            });
          }
        }
        
        // 恢复原始设置
        STORAGE_CONFIG.COMPRESSION_ENABLED = originalCompressionEnabled;
      }
      
    } catch (error) {
      result.errors.push({
        operation: 'optimization',
        error: error.message
      });
    }
    
    return result;
  }

  /**
   * 获取存储性能统计
   * @returns {Object} 性能统计信息
   */
  static getPerformanceStats() {
    return {
      storageType: this._currentStorageType,
      cacheSize: this._cache?.size || 0,
      memoryStorageSize: this._memoryStorage?.size || 0,
      compressionEnabled: STORAGE_CONFIG.COMPRESSION_ENABLED,
      backupEnabled: STORAGE_CONFIG.BACKUP_ENABLED,
      stats: { ...this._storageStats },
      config: {
        maxStorageSize: STORAGE_CONFIG.MAX_STORAGE_SIZE,
        warningThreshold: STORAGE_CONFIG.WARNING_THRESHOLD,
        maxRetries: STORAGE_CONFIG.MAX_RETRIES,
        retryDelay: STORAGE_CONFIG.RETRY_DELAY
      }
    };
  }
}

// 自动初始化
if (typeof window !== 'undefined') {
  // 在浏览器环境中自动初始化
  document.addEventListener('DOMContentLoaded', () => {
    PersistenceManager.initialize();
  });
  
  // 如果DOM已经加载完成，立即初始化
  if (document.readyState === 'loading') {
    // DOM还在加载中，等待DOMContentLoaded事件
  } else {
    // DOM已经加载完成，立即初始化
    PersistenceManager.initialize();
  }
}

export default PersistenceManager;
export { StorageError, STORAGE_CONFIG };