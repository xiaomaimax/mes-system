/**
 * API 限流中间件 - 防止滥用和 DDoS 攻击
 * 基于 IP 和用户的请求频率限制
 */

const rateLimitStore = new Map();

// 限流配置
const RATE_LIMIT_CONFIG = {
  // 通用 API 限流：100 次/分钟
  general: {
    windowMs: 60 * 1000, // 1 分钟
    maxRequests: 100
  },
  // 登录 API 限流：5 次/分钟（防止暴力破解）
  login: {
    windowMs: 60 * 1000, // 1 分钟
    maxRequests: 5
  },
  // 敏感操作限流：20 次/分钟
  sensitive: {
    windowMs: 60 * 1000, // 1 分钟
    maxRequests: 20
  }
};

/**
 * 清理过期的限流记录
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.windowStart > data.windowMs) {
      rateLimitStore.delete(key);
    }
  }
}

// 每 5 分钟清理一次过期记录
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * 获取限流配置
 * @param {string} type - 限流类型：general, login, sensitive
 * @returns {object} 限流配置
 */
function getRateLimitConfig(type = 'general') {
  return RATE_LIMIT_CONFIG[type] || RATE_LIMIT_CONFIG.general;
}

/**
 * 生成限流键
 * @param {object} req - Express 请求对象
 * @param {string} type - 限流类型
 * @returns {string} 限流键
 */
function getRateLimitKey(req, type) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userId = req.user?.userId || 'anonymous';
  return `${type}:${ip}:${userId}`;
}

/**
 * 检查请求是否超过限流
 * @param {string} key - 限流键
 * @param {object} config - 限流配置
 * @returns {object} { allowed: boolean, remaining: number, resetTime: number }
 */
function checkRateLimit(key, config) {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record) {
    // 新记录
    rateLimitStore.set(key, {
      windowStart: now,
      count: 1
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs
    };
  }

  // 检查是否在时间窗口内
  if (now - record.windowStart > config.windowMs) {
    // 窗口已过期，重置计数
    rateLimitStore.set(key, {
      windowStart: now,
      count: 1
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs
    };
  }

  // 在窗口内，检查是否超过限制
  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.windowStart + config.windowMs
    };
  }

  // 增加计数
  record.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.windowStart + config.windowMs
  };
}

/**
 * 创建限流中间件
 * @param {string} type - 限流类型：general, login, sensitive
 * @returns {function} Express 中间件
 */
function createRateLimiter(type = 'general') {
  const config = getRateLimitConfig(type);

  return (req, res, next) => {
    const key = getRateLimitKey(req, type);
    const result = checkRateLimit(key, config);

    // 设置限流响应头
    res.set('X-RateLimit-Limit', config.maxRequests.toString());
    res.set('X-RateLimit-Remaining', result.remaining.toString());
    res.set('X-RateLimit-Reset', result.resetTime.toString());

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      res.set('Retry-After', retryAfter.toString());

      return res.status(429).json({
        success: false,
        error: '请求过于频繁',
        message: `请求频率超过限制，请在 ${retryAfter} 秒后重试`,
        retryAfter: retryAfter
      });
    }

    next();
  };
}

/**
 * 限流中间件工厂 - 根据路由自动选择限流类型
 */
function rateLimiter() {
  return (req, res, next) => {
    // 登录接口使用严格的限流
    if (req.path.includes('/login') || req.path.includes('/auth')) {
      return createRateLimiter('login')(req, res, next);
    }

    // 敏感操作接口
    if (req.path.includes('/admin') || 
        req.path.includes('/delete') || 
        req.path.includes('/update')) {
      return createRateLimiter('sensitive')(req, res, next);
    }

    // 通用接口
    return createRateLimiter('general')(req, res, next);
  };
}

module.exports = {
  rateLimiter,
  createRateLimiter,
  getRateLimitConfig,
  RATE_LIMIT_CONFIG
};
