const express = require('express');
const router = express.Router();
const { monitorService } = require('../services/monitorService');
const { cacheService } = require('../services/cacheService');
const logger = require('../utils/logger');

router.get('/health', async (req, res) => {
  try {
    const health = await monitorService.healthCheck();
    try {
      const sequelize = require('../config/database');
      await sequelize.authenticate();
      health.checks.database = 'ok';
    } catch (error) {
      health.checks.database = 'error';
      health.status = 'warning';
    }
    health.checks.cache = cacheService.getStats();
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'warning' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('健康检查失败', { error: error.message });
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.get('/metrics', (req, res) => {
  try {
    const metrics = monitorService.getMetrics();
    res.json({ timestamp: new Date().toISOString(), ...metrics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/report', (req, res) => {
  try {
    const report = monitorService.generateReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/cache/stats', (req, res) => {
  try {
    const stats = cacheService.getStats();
    res.json({ timestamp: new Date().toISOString(), ...stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/cache/clear', async (req, res) => {
  try {
    const pattern = req.query.pattern || '*';
    await cacheService.deletePattern(pattern);
    res.json({ success: true, message: '缓存已清除：' + pattern, stats: cacheService.getStats() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/system', (req, res) => {
  try {
    const os = require('os');
    res.json({
      timestamp: new Date().toISOString(),
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      memory: {
        total: Math.round(os.totalmem() / 1024 / 1024),
        free: Math.round(os.freemem() / 1024 / 1024),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2) + '%'
      },
      uptime: { system: os.uptime(), process: process.uptime() },
      loadavg: os.loadavg()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/errors', (req, res) => {
  try {
    const metrics = monitorService.getMetrics();
    const limit = parseInt(req.query.limit) || 10;
    res.json({ timestamp: new Date().toISOString(), count: metrics.recentErrors.length, errors: metrics.recentErrors.slice(-limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/errors/clear', (req, res) => {
  try {
    monitorService.metrics.errors = [];
    res.json({ success: true, message: '错误历史已清除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
