#!/bin/bash
#############################################
# MaxMES 缓存监控优化脚本
#############################################

set -e

echo "======================================"
echo "📊 缓存监控优化"
echo "======================================"
echo ""

cd /opt/mes-system/server

# 1. 增强缓存监控 API
echo "1️⃣  增强缓存监控 API..."
cat > routes/cache-monitor.js << 'EOF'
/**
 * 缓存监控 API
 * 功能：监控缓存命中率、性能指标、告警
 */

const express = require('express');
const router = express.Router();
const { cacheService } = require('../services/cacheService');
const redis = require('redis');

// Redis 客户端
let redisClient = null;

function getRedisClient() {
  if (!redisClient) {
    redisClient = redis.createClient({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || 'redis'
    });
  }
  return redisClient;
}

/**
 * GET /api/cache-monitor/stats
 * 缓存统计详情
 */
router.get('/stats', async (req, res) => {
  try {
    const client = getRedisClient();
    await client.connect();
    
    // Redis 信息
    const info = await client.info('stats');
    const stats = {};
    info.split('\r\n').forEach(line => {
      const [key, value] = line.split(':');
      if (key && value) {
        stats[key] = value;
      }
    });
    
    // 计算命中率
    const hits = parseInt(stats.keyspace_hits) || 0;
    const misses = parseInt(stats.keyspace_misses) || 0;
    const total = hits + misses;
    const hitRate = total > 0 ? ((hits / total) * 100).toFixed(2) : 0;
    
    // 缓存键统计
    const keys = await client.keys('mes:*');
    const keyTypes = {};
    for (const key of keys) {
      const type = key.split(':')[1] || 'unknown';
      keyTypes[type] = (keyTypes[type] || 0) + 1;
    }
    
    await client.quit();
    
    res.json({
      success: true,
      stats: {
        hits,
        misses,
        hitRate: hitRate + '%',
        totalKeys: keys.length,
        keyTypes,
        memoryUsage: stats.used_memory_human || 'unknown'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/cache-monitor/keys
 * 查看所有缓存键
 */
router.get('/keys', async (req, res) => {
  try {
    const client = getRedisClient();
    await client.connect();
    
    const keys = await client.keys('mes:*');
    const details = [];
    
    for (const key of keys.slice(0, 50)) { // 限制 50 个
      const ttl = await client.ttl(key);
      const type = await client.type(key);
      details.push({
        key,
        ttl: ttl > 0 ? ttl : 'permanent',
        type
      });
    }
    
    await client.quit();
    
    res.json({
      success: true,
      total: keys.length,
      showing: details.length,
      keys: details
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/cache-monitor/health
 * 缓存健康检查
 */
router.get('/health', async (req, res) => {
  try {
    const client = getRedisClient();
    await client.connect();
    
    // 检查连接
    await client.ping();
    
    // 检查内存
    const info = await client.info('memory');
    const usedMemory = parseInt(info.match(/used_memory:(\d+)/)[1]);
    const maxMemory = parseInt(info.match(/maxmemory:(\d+)/)[1]) || 0;
    const memoryPercent = maxMemory > 0 ? ((usedMemory / maxMemory) * 100).toFixed(2) : 0;
    
    // 检查命中率
    const stats = await client.info('stats');
    const hits = parseInt(stats.match(/keyspace_hits:(\d+)/)[1]) || 0;
    const misses = parseInt(stats.match(/keyspace_misses:(\d+)/)[1]) || 0;
    const hitRate = (hits + misses) > 0 ? ((hits / (hits + misses)) * 100).toFixed(2) : 0;
    
    await client.quit();
    
    // 健康评估
    const health = {
      status: 'healthy',
      issues: []
    };
    
    if (parseFloat(memoryPercent) > 80) {
      health.status = 'warning';
      health.issues.push(`内存使用过高：${memoryPercent}%`);
    }
    
    if (parseFloat(hitRate) < 50) {
      health.status = 'warning';
      health.issues.push(`命中率过低：${hitRate}%`);
    }
    
    res.json({
      success: true,
      health,
      metrics: {
        memoryPercent: memoryPercent + '%',
        hitRate: hitRate + '%',
        connections: parseInt(stats.match(/connected_clients:(\d+)/)[1]) || 0
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      health: {
        status: 'unhealthy',
        issues: [error.message]
      }
    });
  }
});

/**
 * POST /api/cache-monitor/clear
 * 清除缓存
 */
router.post('/clear', async (req, res) => {
  try {
    const client = getRedisClient();
    await client.connect();
    
    const keys = await client.keys('mes:*');
    if (keys.length > 0) {
      await client.del(keys);
    }
    
    await client.quit();
    
    res.json({
      success: true,
      message: `已清除 ${keys.length} 个缓存键`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
EOF

echo "   ✅ 缓存监控 API 已创建"
echo ""

# 2. 在 app.js 中注册新路由
echo "2️⃣  注册缓存监控路由..."
if ! grep -q "cache-monitor" app.js; then
  sed -i "/const monitorRoutes/a const cacheMonitorRoutes = require('./routes/cache-monitor');" app.js
  sed -i "/app.use.*monitor/a app.use('/api/cache-monitor', cacheMonitorRoutes);" app.js
  echo "   ✅ 路由已注册"
else
  echo "   ℹ️  路由已存在"
fi
echo ""

# 3. 重启服务
echo "3️⃣  重启服务..."
echo 'xiaomai@2015' | sudo -S pm2 restart mes-api
sleep 5
echo 'xiaomai@2015' | sudo -S pm2 status
echo ""

# 4. 测试监控 API
echo "4️⃣  测试监控 API..."
sleep 3
echo ""
echo "缓存统计:"
curl -s http://192.168.100.6:5001/api/cache-monitor/stats | python3 -m json.tool | head -20
echo ""

echo "缓存健康:"
curl -s http://192.168.100.6:5001/api/cache-monitor/health | python3 -m json.tool
echo ""

echo "======================================"
echo "✅ 缓存监控已启用！"
echo "======================================"
echo ""
echo "📊 监控 API:"
echo "  - 缓存统计：GET /api/cache-monitor/stats"
echo "  - 缓存键列表：GET /api/cache-monitor/keys"
echo "  - 健康检查：GET /api/cache-monitor/health"
echo "  - 清除缓存：POST /api/cache-monitor/clear"
echo ""
echo "🔍 监控命令:"
echo "  curl http://192.168.100.6:5001/api/cache-monitor/stats"
echo "  curl http://192.168.100.6:5001/api/cache-monitor/health"
echo ""
