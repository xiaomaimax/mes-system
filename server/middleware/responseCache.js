const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// 缓存统计（与 cacheService 共享数据结构）
const cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0
};

function responseCache(ttl = 300) {
  return (req, res, next) => {
    if (req.method !== 'GET') return next();
    const key = req.originalUrl || req.url;
    
    // 尝试从 NodeCache 获取
    const cached = cache.get(key);
    if (cached) {
      res.set('X-Cache', 'HIT');
      cacheStats.hits++;
      return res.json(cached);
    }
    
    // 缓存未命中
    cacheStats.misses++;
    
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode === 200) {
        cache.set(key, data, ttl);
        cacheStats.sets++;
      }
      res.set('X-Cache', 'MISS');
      return originalJson(data);
    };
    next();
  };
}

module.exports = { cache, responseCache, cacheStats };
