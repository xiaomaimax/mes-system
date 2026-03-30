/**
 * Redis 缓存中间件
 * 用法：app.use('/api/dashboard', cache(60), dashboardRoutes);
 */

const cacheService = require('../services/cacheService');

function cache(ttl = 60) {
  return async (req, res, next) => {
    // 只对 GET 请求缓存
    if (req.method !== 'GET') {
      return next();
    }
    
    // 生成缓存键
    const key = `mes:cache:${req.originalUrl}`;
    
    try {
      // 尝试从缓存获取
      const cached = await cacheService.get(key);
      if (cached) {
        console.log(`✅ 缓存命中：${key}`);
        return res.json(JSON.parse(cached));
      }
      
      console.log(`⏳ 缓存未命中：${key}`);
      
      // 重写 res.json 以缓存响应
      const originalJson = res.json;
      res.json = (data) => {
        // 只缓存成功响应
        if (res.statusCode === 200) {
          cacheService.set(key, JSON.stringify(data), ttl);
          console.log(`💾 已缓存：${key} (TTL: ${ttl}s)`);
        }
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('❌ 缓存错误:', error);
      next();
    }
  };
}

module.exports = { cache };
