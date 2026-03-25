/**
 * 缓存中间件（P2-1 缓存优化）
 * 自动缓存 GET 请求响应
 */

const { cacheService } = require('../services/cacheService');
const logger = require('../utils/logger');

/**
 * 缓存中间件配置
 * @param {Object} options - 配置选项
 * @param {number} options.ttl - 缓存时间（秒）
 * @param {string} options.prefix - 缓存键前缀
 * @param {Function} options.keyGenerator - 自定义键生成函数
 * @param {Function} options.shouldCache - 是否应该缓存的判断函数
 */
function cacheMiddleware(options = {}) {
  const {
    ttl = 300,
    prefix = 'api',
    keyGenerator = null,
    shouldCache = null
  } = options;

  return async (req, res, next) => {
    // 只缓存 GET 请求
    if (req.method !== 'GET') {
      return next();
    }

    // 检查是否应该缓存
    if (shouldCache && !shouldCache(req)) {
      return next();
    }

    // 生成缓存键
    let cacheKey;
    if (keyGenerator) {
      cacheKey = keyGenerator(req);
    } else {
      // 默认：使用方法 + 路径 + 查询参数
      const queryString = JSON.stringify(req.query);
      cacheKey = `${prefix}:${req.method}:${req.path}:${queryString}`;
    }

    try {
      // 尝试从缓存获取
      const cachedResponse = await cacheService.get(cacheKey);
      
      if (cachedResponse) {
        logger.debug('缓存命中', { key: cacheKey });
        return res.json(cachedResponse);
      }

      // 缓存未命中，继续处理
      // 重写 res.json 以捕获响应
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        // 只缓存成功的响应
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.set(cacheKey, data, ttl).catch(err => {
            logger.error('缓存保存失败', { key: cacheKey, error: err.message });
          });
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('缓存中间件错误', { error: error.message });
      next();
    }
  };
}

/**
 * 缓存失效中间件 - 用于 DELETE/PUT/POST 请求后清除相关缓存
 * @param {string|string[]} patterns - 缓存键模式
 */
function invalidateCache(patterns) {
  const patternList = Array.isArray(patterns) ? patterns : [patterns];

  return async (req, res, next) => {
    // 重写 res.json 以在响应后清除缓存
    const originalJson = res.json.bind(res);
    
    res.json = (data) => {
      // 先发送响应
      const result = originalJson(data);
      
      // 然后清除缓存（不阻塞响应）
      patternList.forEach(async (pattern) => {
        try {
          let cachePattern;
          
          // 支持动态模式（如 :id）
          if (pattern.includes(':')) {
            cachePattern = pattern.replace(/:(\w+)/g, (match, key) => {
              return req.params[key] || '*';
            });
          } else {
            cachePattern = pattern;
          }

          await cacheService.deletePattern(cachePattern);
          logger.debug('缓存已清除', { pattern: cachePattern });
        } catch (error) {
          logger.error('清除缓存失败', { pattern, error: error.message });
        }
      });
      
      return result;
    };

    next();
  };
}

/**
 * 页面缓存中间件 - 缓存整个 HTML 页面（仅生产环境）
 * @param {number} ttl - 缓存时间（秒）
 */
function pageCache(ttl = 60) {
  return async (req, res, next) => {
    if (req.method !== 'GET' || process.env.NODE_ENV !== 'production') {
      return next();
    }

    const cacheKey = `page:${req.path}`;
    
    try {
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return res.send(cached);
      }

      const originalSend = res.send.bind(res);
      res.send = (body) => {
        if (typeof body === 'string' && res.statusCode === 200) {
          cacheService.set(cacheKey, body, ttl).catch(err => {
            logger.error('页面缓存失败', { error: err.message });
          });
        }
        return originalSend(body);
      };

      next();
    } catch (error) {
      logger.error('页面缓存中间件错误', { error: error.message });
      next();
    }
  };
}

module.exports = {
  cacheMiddleware,
  invalidateCache,
  pageCache
};
