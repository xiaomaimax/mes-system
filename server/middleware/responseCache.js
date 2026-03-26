const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

function responseCache(ttl = 300) {
  return (req, res, next) => {
    if (req.method !== 'GET') return next();
    const key = req.originalUrl || req.url;
    const cached = cache.get(key);
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.json(cached);
    }
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode === 200) cache.set(key, data, ttl);
      res.set('X-Cache', 'MISS');
      return originalJson(data);
    };
    next();
  };
}

module.exports = { cache, responseCache };
