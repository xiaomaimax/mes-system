/**
 * 日志分析 API
 * 功能：
 * 1. 错误统计
 * 2. 日志趋势分析
 * 3. 关键词搜索
 * 4. 日志导出
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const logDir = path.join(__dirname, '../../logs');

/**
 * GET /api/log-analysis/stats
 * 获取日志统计信息
 */
router.get('/stats', (req, res) => {
  try {
    const { level, date } = req.query;
    const today = new Date().toISOString().split('T')[0];
    const targetDate = date || today;
    
    const logFile = path.join(logDir, `app-${targetDate}.log`);
    
    if (!fs.existsSync(logFile)) {
      return res.json({
        success: true,
        stats: {
          total: 0,
          byLevel: {},
          errors: [],
          warnings: []
        }
      });
    }
    
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    const stats = {
      total: 0,
      byLevel: {
        error: 0,
        warn: 0,
        info: 0,
        debug: 0
      },
      errors: [],
      warnings: []
    };
    
    lines.forEach(line => {
      try {
        const log = JSON.parse(line);
        stats.total++;
        
        if (log.level && stats.byLevel[log.level] !== undefined) {
          stats.byLevel[log.level]++;
        }
        
        // 收集错误和警告
        if (log.level === 'error') {
          stats.errors.push({
            timestamp: log.timestamp,
            message: log.message,
            ...log
          });
        } else if (log.level === 'warn') {
          stats.warnings.push({
            timestamp: log.timestamp,
            message: log.message,
            ...log
          });
        }
      } catch (e) {
        // 跳过无法解析的行
      }
    });
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/log-analysis/trend
 * 获取日志趋势（按小时）
 */
router.get('/trend', (req, res) => {
  try {
    const { date } = req.query;
    const today = new Date().toISOString().split('T')[0];
    const targetDate = date || today;
    
    const logFile = path.join(logDir, `app-${targetDate}.log`);
    
    if (!fs.existsSync(logFile)) {
      return res.json({ success: true, trend: [] });
    }
    
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    // 按小时统计
    const hourlyStats = {};
    for (let i = 0; i < 24; i++) {
      hourlyStats[i.toString().padStart(2, '0')] = {
        total: 0,
        error: 0,
        warn: 0,
        info: 0
      };
    }
    
    lines.forEach(line => {
      try {
        const log = JSON.parse(line);
        if (log.timestamp) {
          const hour = log.timestamp.split('T')[1].split(':')[0];
          if (hourlyStats[hour]) {
            hourlyStats[hour].total++;
            if (log.level && hourlyStats[hour][log.level] !== undefined) {
              hourlyStats[hour][log.level]++;
            }
          }
        }
      } catch (e) {
        // 跳过
      }
    });
    
    const trend = Object.entries(hourlyStats).map(([hour, stats]) => ({
      hour,
      ...stats
    }));
    
    res.json({ success: true, trend });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/log-analysis/search
 * 搜索日志
 */
router.get('/search', (req, res) => {
  try {
    const { keyword, level, date, limit = 100 } = req.query;
    const today = new Date().toISOString().split('T')[0];
    const targetDate = date || today;
    
    const logFile = path.join(logDir, `app-${targetDate}.log`);
    
    if (!fs.existsSync(logFile)) {
      return res.json({ success: true, results: [], total: 0 });
    }
    
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    const results = [];
    
    lines.forEach(line => {
      try {
        const log = JSON.parse(line);
        
        // 过滤
        if (level && log.level !== level) return;
        if (keyword && !log.message.includes(keyword)) return;
        
        results.push(log);
        
        if (results.length >= limit) return;
      } catch (e) {
        // 跳过
      }
    });
    
    res.json({ success: true, results, total: results.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/log-analysis/errors
 * 获取错误日志（最近 N 条）
 */
router.get('/errors', (req, res) => {
  try {
    const { limit = 50, date } = req.query;
    const today = new Date().toISOString().split('T')[0];
    const targetDate = date || today;
    
    const logFile = path.join(logDir, `app-${targetDate}.log`);
    
    if (!fs.existsSync(logFile)) {
      return res.json({ success: true, errors: [], total: 0 });
    }
    
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    const errors = [];
    
    lines.forEach(line => {
      try {
        const log = JSON.parse(line);
        if (log.level === 'error') {
          errors.push(log);
        }
      } catch (e) {
        // 跳过
      }
    });
    
    res.json({ 
      success: true, 
      errors: errors.slice(0, limit),
      total: errors.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/log-analysis/export
 * 导出日志
 */
router.get('/export', (req, res) => {
  try {
    const { date, format = 'json' } = req.query;
    const today = new Date().toISOString().split('T')[0];
    const targetDate = date || today;
    
    const logFile = path.join(logDir, `app-${targetDate}.log`);
    
    if (!fs.existsSync(logFile)) {
      return res.status(404).json({ error: '日志文件不存在' });
    }
    
    const content = fs.readFileSync(logFile, 'utf8');
    
    if (format === 'json') {
      const lines = content.split('\n').filter(line => line.trim());
      const logs = [];
      
      lines.forEach(line => {
        try {
          logs.push(JSON.parse(line));
        } catch (e) {
          // 跳过
        }
      });
      
      res.json({ success: true, logs });
    } else {
      // 文本格式
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="app-${targetDate}.log"`);
      res.send(content);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/log-analysis/alerts
 * 获取告警日志
 */
router.get('/alerts', (req, res) => {
  try {
    const alertFile = path.join(logDir, 'alerts.log');
    
    if (!fs.existsSync(alertFile)) {
      return res.json({ success: true, alerts: [], total: 0 });
    }
    
    const content = fs.readFileSync(alertFile, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    const alerts = [];
    lines.forEach(line => {
      try {
        alerts.push(JSON.parse(line));
      } catch (e) {
        // 跳过
      }
    });
    
    res.json({ success: true, alerts, total: alerts.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
