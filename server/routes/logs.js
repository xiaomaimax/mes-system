/**
 * 日志管理 API (P3-3 优化)
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { logger } = require('../services/logger');

const logDir = path.join(__dirname, '../logs');

/**
 * GET /api/logs/list
 * 获取日志文件列表
 */
router.get('/list', (req, res) => {
  try {
    const files = fs.readdirSync(logDir)
      .filter(f => f.endsWith('.log'))
      .map(file => {
        const filePath = path.join(logDir, file);
        const stat = fs.statSync(filePath);
        return {
          name: file,
          size: stat.size,
          sizeMB: (stat.size / 1024 / 1024).toFixed(2),
          modified: stat.mtime,
          created: stat.birthtime
        };
      })
      .sort((a, b) => b.modified - a.modified);
    
    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/logs/stats
 * 获取日志统计
 */
router.get('/stats', (req, res) => {
  try {
    const stats = logger.getStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/logs/recent
 * 获取最近日志（支持分页和过滤）
 */
router.get('/recent', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const level = req.query.level;
    const keyword = req.query.keyword;
    
    // 读取最新的日志文件
    const files = fs.readdirSync(logDir)
      .filter(f => f.endsWith('.log'))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      return res.json({ success: true, logs: [], total: 0 });
    }
    
    const logs = [];
    const latestFile = path.join(logDir, files[0]);
    const content = fs.readFileSync(latestFile, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    // 从后往前读取（最新的在前）
    for (let i = lines.length - 1; i >= 0 && logs.length < limit; i--) {
      try {
        const log = JSON.parse(lines[i]);
        
        // 过滤
        if (level && log.level !== level) continue;
        if (keyword && !log.message.includes(keyword)) continue;
        
        logs.push(log);
      } catch (e) {
        // 跳过无法解析的行
      }
    }
    
    res.json({ success: true, logs, total: logs.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/logs/errors
 * 获取错误日志
 */
router.get('/errors', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    // 读取所有日志文件中的错误
    const files = fs.readdirSync(logDir)
      .filter(f => f.endsWith('.log'))
      .sort()
      .reverse()
      .slice(0, 5); // 只读取最近 5 个文件
    
    const errors = [];
    
    files.forEach(file => {
      try {
        const filePath = path.join(logDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
          try {
            const log = JSON.parse(line);
            if (log.level === 'error') {
              errors.push({ ...log, file });
            }
          } catch (e) {
            // 跳过
          }
        });
      } catch (e) {
        // 跳过无法读取的文件
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
 * POST /api/logs/cleanup
 * 清理旧日志
 */
router.post('/cleanup', (req, res) => {
  try {
    const daysToKeep = parseInt(req.query.days) || 30;
    const result = logger.cleanup(daysToKeep);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
