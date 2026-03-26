/**
 * 报表 API 路由（P2-4 报表优化）
 */
const express = require('express');
const router = express.Router();
const reportService = require('../services/reportService');
const { asyncHandler } = require('../middleware/errorHandler');

router.get('/production', asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ success: false, message: '请提供日期' });
  }
  const report = await reportService.generateProductionReport(startDate, endDate);
  res.json({ success: true, ...report });
}));

router.get('/quality', asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ success: false, message: '请提供日期' });
  }
  const report = await reportService.generateQualityReport(startDate, endDate);
  res.json({ success: true, ...report });
}));

module.exports = router;
