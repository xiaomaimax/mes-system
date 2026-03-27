const express = require('express');
const router = express.Router();
const AuditService = require('../services/auditService');
const { authenticateToken } = require('../routes/auth');
const { authorize } = require('../middleware/authorize');
const logger = require('../utils/logger');

/**
 * 审计日志 API
 */

// 查询审计日志
router.get('/logs',
  authenticateToken,
  authorize(['system.audit.read']),
  async (req, res) => {
    try {
      const {
        userId,
        action,
        resourceType,
        startDate,
        endDate,
        page = 1,
        pageSize = 20
      } = req.query;
      
      const result = await AuditService.queryLogs({
        userId: userId ? parseInt(userId) : null,
        action,
        resourceType,
        startDate,
        endDate,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      });
      
      res.json({
        success: true,
        data: result.rows,
        pagination: {
          total: result.count,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          totalPages: Math.ceil(result.count / parseInt(pageSize))
        }
      });
    } catch (error) {
      logger.error('查询审计日志失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// 获取审计日志详情
router.get('/logs/:id',
  authenticateToken,
  authorize(['system.audit.read']),
  async (req, res) => {
    try {
      const log = await AuditService.getLogDetail(req.params.id);
      if (!log) {
        return res.status(404).json({
          success: false,
          message: '日志不存在'
        });
      }
      
      res.json({
        success: true,
        data: log
      });
    } catch (error) {
      logger.error('获取日志详情失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// 导出审计日志
router.post('/logs/export',
  authenticateToken,
  authorize(['system.audit.read']),
  async (req, res) => {
    try {
      const { startDate, endDate, action } = req.body;
      
      const csv = await AuditService.exportLogs({
        startDate,
        endDate,
        action
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit_logs_${Date.now()}.csv"`);
      res.send(csv);
    } catch (error) {
      logger.error('导出审计日志失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// 获取审计统计
router.get('/statistics',
  authenticateToken,
  authorize(['system.audit.read']),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const stats = await AuditService.getStatistics(startDate, endDate);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('获取审计统计失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// 清理过期日志
router.post('/cleanup',
  authenticateToken,
  authorize(['system.config.update']),
  async (req, res) => {
    try {
      const { daysToKeep = 90 } = req.body;
      
      const count = await AuditService.cleanupLogs(daysToKeep);
      
      res.json({
        success: true,
        message: `已清理${count}条过期日志`,
        data: { count }
      });
    } catch (error) {
      logger.error('清理日志失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

module.exports = router;

// 导出审计日志
router.get('/export',
  authenticateToken,
  authorize(['system.audit.read']),
  async (req, res) => {
    try {
      const { startDate, endDate, action, format = 'csv' } = req.query;
      
      const logs = await AuditService.exportLogs({
        startDate,
        endDate,
        action
      });
      
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');
        res.send(logs);
      } else {
        res.json({ success: true, data: logs });
      }
    } catch (error) {
      logger.error('导出审计日志失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);
