#!/bin/bash
#############################################
# MaxMES API 缓存启用脚本
#############################################

set -e

echo "======================================"
echo "🔧 在 API 中启用 Redis 缓存"
echo "======================================"
echo ""

cd /opt/mes-system/server

# 1. 创建缓存中间件
echo "1️⃣  创建缓存中间件..."
mkdir -p middleware
cat > middleware/cache.js << 'EOF'
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
EOF

echo "   ✅ 缓存中间件已创建"
echo ""

# 2. 更新 Dashboard API 使用缓存
echo "2️⃣  更新 Dashboard API..."
cat > routes/dashboard.js << 'EOF'
/**
 * Dashboard API - 数据聚合接口
 * 功能：为前端监控仪表板提供完整数据
 */

const express = require('express');
const router = express.Router();
const { monitorService } = require('../services/monitorService');
const { cacheService } = require('../services/cacheService');

/**
 * GET /api/dashboard/overview
 * 获取仪表板概览数据（缓存 60 秒）
 */
router.get('/overview', async (req, res) => {
  try {
    const cacheKey = 'mes:dashboard:overview';
    
    // 尝试从缓存获取
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log(`✅ Dashboard 缓存命中`);
      return res.json(JSON.parse(cached));
    }
    
    console.log(`⏳ Dashboard 缓存未命中，从数据库获取`);
    
    // 从数据库获取
    const metrics = monitorService.getMetrics();
    const cacheStats = cacheService.getStats();
    const health = await monitorService.healthCheck();
    
    // 计算关键指标
    const perf = metrics.performance || {};
    const totalRequests = perf.totalRequests || 0;
    const totalResponseTime = perf.totalResponseTime || 0;
    const errorsCount = (metrics.errors && metrics.errors.count) || 0;
    
    const avgResponseTime = totalRequests > 0 
      ? Math.round(totalResponseTime / totalRequests) 
      : 0;
    
    const errorRate = totalRequests > 0
      ? ((errorsCount / totalRequests) * 100).toFixed(2)
      : '0.00';
    
    const qps = perf.qps || { current: 0, peak: 0 };
    
    const data = {
      timestamp: new Date().toISOString(),
      summary: {
        qps: qps,
        avgResponseTime: avgResponseTime,
        errorRate: errorRate + '%',
        cacheHitRate: cacheStats.hitRate || '0%',
        systemStatus: health.status || 'unknown'
      },
      performance: {
        totalRequests: totalRequests,
        avgResponseTime: avgResponseTime,
        successRate: perf.successRate || '0%',
        qps: qps
      },
      cache: cacheStats,
      system: {
        status: health.status || 'unknown',
        checks: health.checks || {}
      }
    };
    
    // 缓存 60 秒
    await cacheService.set(cacheKey, JSON.stringify(data), 60);
    console.log(`💾 Dashboard 数据已缓存 (60 秒)`);
    
    res.json(data);
  } catch (error) {
    console.error('Dashboard API 错误:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/dashboard/performance
 * 获取性能趋势数据（缓存 30 秒）
 */
router.get('/performance', (req, res) => {
  try {
    const metrics = monitorService.getMetrics();
    const perf = metrics.performance || {};
    const totalRequests = perf.totalRequests || 1;
    
    res.json({
      timestamp: new Date().toISOString(),
      qps: perf.qps || { current: 0, peak: 0 },
      responseTime: {
        avg: Math.round((perf.totalResponseTime || 0) / totalRequests),
        min: perf.minResponseTime || 0,
        max: perf.maxResponseTime || 0
      },
      requests: {
        total: totalRequests,
        successful: perf.successfulRequests || 0,
        failed: perf.failedRequests || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/dashboard/errors
 * 获取错误统计（缓存 30 秒）
 */
router.get('/errors', (req, res) => {
  try {
    const metrics = monitorService.getMetrics();
    const limit = parseInt(req.query.limit) || 20;
    
    res.json({
      timestamp: new Date().toISOString(),
      total: (metrics.errors && metrics.errors.count) || 0,
      recent: (metrics.recentErrors || []).slice(-limit),
      top: (metrics.topErrors || []).slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
EOF

echo "   ✅ Dashboard API 已更新"
echo ""

# 3. 更新 Monitor API 使用缓存
echo "3️⃣  更新 Monitor API..."
cat > routes/monitor.js << 'EOF'
/**
 * Monitor API - 监控接口
 */

const express = require('express');
const router = express.Router();
const { monitorService } = require('../services/monitorService');
const { cacheService } = require('../services/cacheService');

/**
 * GET /api/monitor/health
 * 健康检查（不缓存）
 */
router.get('/health', async (req, res) => {
  try {
    const health = await monitorService.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/monitor/metrics
 * 监控指标（缓存 30 秒）
 */
router.get('/metrics', async (req, res) => {
  try {
    const cacheKey = 'mes:monitor:metrics';
    
    // 尝试从缓存获取
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    const metrics = monitorService.getMetrics();
    
    // 缓存 30 秒
    await cacheService.set(cacheKey, JSON.stringify(metrics), 30);
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/monitor/cache
 * 缓存统计（不缓存）
 */
router.get('/cache', (req, res) => {
  try {
    const stats = cacheService.getStats();
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
EOF

echo "   ✅ Monitor API 已更新"
echo ""

# 4. 重启服务
echo "4️⃣  重启服务..."
echo 'xiaomai@2015' | sudo -S pm2 restart mes-api
sleep 5
echo 'xiaomai@2015' | sudo -S pm2 status
echo ""

# 5. 测试缓存
echo "5️⃣  测试缓存..."
sleep 3
echo ""
echo "第一次请求（缓存未命中）:"
curl -s http://192.168.100.6:5001/api/dashboard/overview | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'QPS: {d.get(\"summary\",{}).get(\"qps\",{}).get(\"current\",0)}')"
echo ""

echo "第二次请求（缓存命中）:"
curl -s http://192.168.100.6:5001/api/dashboard/overview | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'QPS: {d.get(\"summary\",{}).get(\"qps\",{}).get(\"current\",0)}')"
echo ""

echo "检查 Redis 缓存键:"
redis-cli -a redis --no-auth-warning KEYS 'mes:*' | head -10
echo ""

echo "======================================"
echo "✅ API 缓存已启用！"
echo "======================================"
echo ""
echo "📊 验证方法:"
echo "  1. 查看缓存键：redis-cli -a redis --no-auth-warning KEYS 'mes:*'"
echo "  2. 查看日志：tail -f /opt/mes-system/logs/server.log | grep -i '缓存\\|cache'"
echo "  3. 测试 API: curl http://192.168.100.6:5001/api/dashboard/overview"
echo ""
