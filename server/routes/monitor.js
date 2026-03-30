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
