/**
 * 缓存服务 - Redis 实现（P2-1 缓存优化）
 * 支持内存缓存（开发环境）和 Redis 缓存（生产环境）
 */

const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.client = null;
    this.memoryCache = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
    
    // 默认 TTL（秒）
    this.defaultTTL = {
      short: 60,        // 1 分钟 - 频繁变化数据
      medium: 300,      // 5 分钟 - 一般业务数据
      long: 3600,       // 1 小时 - 配置类数据
      veryLong: 86400   // 24 小时 - 静态数据
    };
    
    this.init();
  }

  async init() {
    try {
      // 有 REDIS_URL 就尝试连接
      if (process.env.REDIS_URL) {
        await this.connectRedis();
      } else {
        logger.info('未配置 REDIS_URL，使用内存缓存模式');
      }
    } catch (error) {
      logger.warn('Redis 连接失败，降级到内存缓存', { error: error.message });
    }
  }

  async connectRedis() {
    try {
      const { createClient } = require('redis');
      
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });

      this.client.on('error', (err) => {
        logger.error('Redis 错误', { error: err.message });
      });

      this.client.on('connect', () => {
        logger.info('Redis 连接成功');
      });

      await this.client.connect();
      logger.info('Redis 缓存服务已启动');
    } catch (error) {
      logger.error('Redis 连接失败，使用内存缓存', { error: error.message });
      this.client = null;
    }
  }

  // 生成缓存键
  generateKey(prefix, identifier) {
    return `mes:${prefix}:${identifier}`;
  }

  // 设置缓存
  async set(key, value, ttl = this.defaultTTL.medium) {
    try {
      const fullKey = this.generateKey('data', key);
      const serialized = JSON.stringify(value);

      if (this.client) {
        await this.client.setEx(fullKey, ttl, serialized);
      } else {
        // 内存缓存
        this.memoryCache.set(fullKey, {
          value: serialized,
          expiry: Date.now() + (ttl * 1000)
        });
      }

      this.cacheStats.sets++;
      logger.debug('缓存设置', { key: fullKey, ttl });
      return true;
    } catch (error) {
      logger.error('缓存设置失败', { key, error: error.message });
      return false;
    }
  }

  // 获取缓存
  async get(key) {
    try {
      const fullKey = this.generateKey('data', key);
      let data;

      if (this.client) {
        data = await this.client.get(fullKey);
      } else {
        // 内存缓存
        const cached = this.memoryCache.get(fullKey);
        if (cached && cached.expiry > Date.now()) {
          data = cached.value;
        } else if (cached) {
          // 过期数据清理
          this.memoryCache.delete(fullKey);
        }
      }

      if (data) {
        this.cacheStats.hits++;
        logger.debug('缓存命中', { key: fullKey });
        return JSON.parse(data);
      } else {
        this.cacheStats.misses++;
        logger.debug('缓存未命中', { key: fullKey });
        return null;
      }
    } catch (error) {
      logger.error('缓存获取失败', { key, error: error.message });
      this.cacheStats.misses++;
      return null;
    }
  }

  // 删除缓存
  async delete(key) {
    try {
      const fullKey = this.generateKey('data', key);

      if (this.client) {
        await this.client.del(fullKey);
      } else {
        this.memoryCache.delete(fullKey);
      }

      this.cacheStats.deletes++;
      logger.debug('缓存删除', { key: fullKey });
      return true;
    } catch (error) {
      logger.error('缓存删除失败', { key, error: error.message });
      return false;
    }
  }

  // 批量删除（支持通配符）
  async deletePattern(pattern) {
    try {
      const fullPattern = this.generateKey('data', pattern);

      if (this.client) {
        const keys = await this.client.keys(fullPattern);
        if (keys.length > 0) {
          await this.client.del(keys);
          logger.info('批量删除缓存', { count: keys.length, pattern });
        }
      } else {
        // 内存缓存 - 简单实现
        const keysToDelete = [];
        for (const key of this.memoryCache.keys()) {
          if (key.includes(pattern)) {
            keysToDelete.push(key);
          }
        }
        keysToDelete.forEach(key => this.memoryCache.delete(key));
        logger.info('批量删除内存缓存', { count: keysToDelete.length, pattern });
      }

      return true;
    } catch (error) {
      logger.error('批量删除缓存失败', { pattern, error: error.message });
      return false;
    }
  }

  // 获取缓存统计
  getStats() {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    const hitRate = total > 0 ? ((this.cacheStats.hits / total) * 100).toFixed(2) : 0;
    
    return {
      ...this.cacheStats,
      hitRate: `${hitRate}%`,
      memoryCacheSize: this.memoryCache.size,
      redisConnected: !!this.client
    };
  }

  // 重置统计
  resetStats() {
    this.cacheStats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }

  // 清理过期缓存（内存模式）
  cleanup() {
    if (!this.client) {
      const now = Date.now();
      let cleaned = 0;
      
      for (const [key, value] of this.memoryCache.entries()) {
        if (value.expiry <= now) {
          this.memoryCache.delete(key);
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        logger.debug('清理过期缓存', { count: cleaned });
      }
    }
  }
}

// 缓存装饰器 - 用于自动缓存 API 响应
function cached(ttl = 300, keyPrefix = 'api') {
  return function(target, name, descriptor) {
    const originalMethod = descriptor.value;
    const cacheService = new CacheService();

    descriptor.value = async function(...args) {
      // 生成缓存键（基于方法名和参数）
      const cacheKey = `${keyPrefix}:${name}:${JSON.stringify(args)}`;
      
      // 尝试从缓存获取
      const cached = await cacheService.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // 执行原方法
      const result = await originalMethod.apply(this, args);
      
      // 存入缓存
      await cacheService.set(cacheKey, result, ttl);
      
      return result;
    };

    return descriptor;
  };
}

const cacheService = new CacheService();

// 每分钟清理一次过期缓存
setInterval(() => cacheService.cleanup(), 60000);

module.exports = {
  CacheService,
  cacheService,
  cached
};
