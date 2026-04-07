/**
 * Dashboard API - 数据聚合接口
 * 为前端监控仪表板提供完整数据
 */

const express = require('express');
const router = express.Router();
const { monitorService } = require('../services/monitorService');
const { cacheService } = require('../services/cacheService');
const { cacheStats } = require('../middleware/responseCache');

/**
 * GET /api/dashboard/overview
 * 获取仪表板概览数据
 */
router.get('/overview', async (req, res) => {
  try {
    const metrics = monitorService.getMetrics();
    // 使用 responseCache 中间件的实际统计数据
    const total = (cacheStats.hits || 0) + (cacheStats.misses || 0);
    const hitRate = total > 0 ? ((cacheStats.hits / total) * 100).toFixed(2) : '0';
    const cacheStatsData = {
      hits: cacheStats.hits || 0,
      misses: cacheStats.misses || 0,
      sets: cacheStats.sets || 0,
      deletes: cacheStats.deletes || 0,
      hitRate: hitRate + '%',
      memoryCacheSize: cacheStats.sets || 0,  // 使用 sets 作为缓存键数量
      redisConnected: false  // 当前使用 NodeCache，非 Redis
    };
    const health = await monitorService.healthCheck();
    
    // 计算关键指标（安全访问）
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
    
    // QPS 格式化为对象
    const qpsCurrent = parseFloat(perf.qps) || 0;
    const qps = { 
      current: qpsCurrent,
      peak: qpsCurrent  // 简化：当前即峰值
    };
    
    res.json({
      timestamp: new Date().toISOString(),
      summary: {
        qps: qps,
        avgResponseTime: avgResponseTime,
        errorRate: errorRate + '%',
        cacheHitRate: hitRate + '%',
        systemStatus: health.status || 'unknown'
      },
      performance: {
        totalRequests: totalRequests,
        successfulRequests: perf.successfulRequests || 0,
        failedRequests: perf.failedRequests || 0,
        avgResponseTime: avgResponseTime,
        successRate: perf.successRate || '0%',
        qps: qps,
        responseTime: {
          min: perf.minResponseTime || 0,
          max: perf.maxResponseTime || 0,
          avg: perf.avgResponseTime || 0
        }
      },
      cache: cacheStatsData,
      system: {
        status: health.status || 'unknown',
        checks: health.checks || {}
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

/**
 * GET /api/dashboard/performance
 * 获取性能趋势数据
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
 * 获取错误统计
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
