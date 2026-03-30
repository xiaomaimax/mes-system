#!/bin/bash
#############################################
# MaxMES 缓存策略优化脚本
#############################################

set -e

echo "======================================"
echo "🔧 缓存策略优化"
echo "======================================"
echo ""

cd /opt/mes-system/server

# 1. 优化 Dashboard API 缓存时间
echo "1️⃣  优化 Dashboard API 缓存策略..."
cat > routes/dashboard.js << 'EOF'
/**
 * Dashboard API - 数据聚合接口
 * 优化：动态缓存时间，根据数据更新频率
 */

const express = require('express');
const router = express.Router();
const { monitorService } = require('../services/monitorService');
const { cacheService } = require('../services/cacheService');

/**
 * 动态计算缓存时间
 * 根据时间段调整缓存时间
 */
function getCacheTTL() {
  const hour = new Date().getHours();
  
  // 工作时间（9-18 点）：缓存时间短，数据更新快
  if (hour >= 9 && hour <= 18) {
    return 30; // 30 秒
  }
  
  // 非工作时间：缓存时间长
  return 120; // 2 分钟
}

/**
 * GET /api/dashboard/overview
 * 获取仪表板概览数据（动态缓存）
 */
router.get('/overview', async (req, res) => {
  try {
    const cacheKey = 'mes:dashboard:overview';
    const ttl = getCacheTTL();
    
    // 尝试从缓存获取
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log(`✅ Dashboard 缓存命中 (TTL 剩余：${ttl}s)`);
      return res.json(JSON.parse(cached));
    }
    
    console.log(`⏳ Dashboard 缓存未命中，从数据库获取 (TTL: ${ttl}s)`);
    
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
    
    // 动态缓存
    await cacheService.set(cacheKey, JSON.stringify(data), ttl);
    console.log(`💾 Dashboard 数据已缓存 (TTL: ${ttl}s)`);
    
    res.json(data);
  } catch (error) {
    console.error('Dashboard API 错误:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/dashboard/performance
 * 获取性能趋势数据（缓存 60 秒）
 */
router.get('/performance', async (req, res) => {
  try {
    const cacheKey = 'mes:dashboard:performance';
    const ttl = 60;
    
    // 尝试从缓存获取
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    const metrics = monitorService.getMetrics();
    const perf = metrics.performance || {};
    const totalRequests = perf.totalRequests || 1;
    
    const data = {
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
    };
    
    await cacheService.set(cacheKey, JSON.stringify(data), ttl);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/dashboard/errors
 * 获取错误统计（缓存 60 秒）
 */
router.get('/errors', async (req, res) => {
  try {
    const cacheKey = 'mes:dashboard:errors';
    const ttl = 60;
    
    // 尝试从缓存获取
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    const metrics = monitorService.getMetrics();
    const limit = parseInt(req.query.limit) || 20;
    
    const data = {
      timestamp: new Date().toISOString(),
      total: (metrics.errors && metrics.errors.count) || 0,
      recent: (metrics.recentErrors || []).slice(-limit),
      top: (metrics.topErrors || []).slice(0, 10)
    };
    
    await cacheService.set(cacheKey, JSON.stringify(data), ttl);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
EOF

echo "   ✅ Dashboard API 缓存策略已优化"
echo ""

# 2. 添加缓存预热脚本
echo "2️⃣  创建缓存预热脚本..."
cat > /opt/mes-system/scripts/cache-warmup.sh << 'EOF'
#!/bin/bash
# 缓存预热脚本

echo "🔥 开始缓存预热..."

BASE_URL="http://192.168.100.6:5001"

# 预热 Dashboard 数据
echo "  - Dashboard 概览..."
curl -s "$BASE_URL/api/dashboard/overview" > /dev/null

# 预热监控数据
echo "  - 监控指标..."
curl -s "$BASE_URL/api/monitor/metrics" > /dev/null

# 预热物料数据
echo "  - 物料列表..."
curl -s "$BASE_URL/api/materials" > /dev/null

# 预热生产订单数据
echo "  - 生产订单..."
curl -s "$BASE_URL/api/production-orders" > /dev/null

echo "✅ 缓存预热完成！"
echo ""
echo "检查缓存键:"
redis-cli -a redis --no-auth-warning KEYS 'mes:*' | head -10
EOF

chmod +x /opt/mes-system/scripts/cache-warmup.sh
echo "   ✅ 缓存预热脚本已创建"
echo ""

# 3. 重启服务
echo "3️⃣  重启服务..."
echo 'xiaomai@2015' | sudo -S pm2 restart mes-api
sleep 5
echo 'xiaomai@2015' | sudo -S pm2 status
echo ""

# 4. 运行缓存预热
echo "4️⃣  运行缓存预热..."
sleep 3
bash /opt/mes-system/scripts/cache-warmup.sh
echo ""

# 5. 验证缓存
echo "5️⃣  验证缓存..."
echo ""
echo "缓存统计:"
curl -s http://192.168.100.6:5001/api/cache-monitor/stats | python3 -m json.tool | head -20
echo ""

echo "======================================"
echo "✅ 缓存策略已优化！"
echo "======================================"
echo ""
echo "📊 优化内容:"
echo "  - 动态缓存时间（工作时间 30 秒，非工作时间 2 分钟）"
echo "  - 缓存预热脚本"
echo "  - 多个 API 缓存优化"
echo ""
echo "🔥 预热缓存:"
echo "  bash /opt/mes-system/scripts/cache-warmup.sh"
echo ""
echo "📊 监控缓存:"
echo "  curl http://192.168.100.6:5001/api/cache-monitor/stats"
echo ""
