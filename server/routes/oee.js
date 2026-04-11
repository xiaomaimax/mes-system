/**
 * OEE API 路由
 */
const express = require('express');
const router = express.Router();
const oeeService = require('../services/oeeService');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('./auth');

// GET /api/oee/overview - 获取所有设备 OEE 概览
router.get('/overview', authenticateToken, asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ 
      success: false, 
      message: '请提供 startDate 和 endDate 参数' 
    });
  }

  const result = await oeeService.getAllEquipmentOEE(startDate, endDate);
  res.json({ success: true, ...result });
}));

// GET /api/oee/equipment/:id - 获取单个设备 OEE
router.get('/equipment/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ 
      success: false, 
      message: '请提供 startDate 和 endDate 参数' 
    });
  }

  const result = await oeeService.calculateEquipmentOEE(parseInt(id), startDate, endDate);
  res.json({ success: true, data: result });
}));

// GET /api/oee/trend - 获取 OEE 趋势
router.get('/trend', authenticateToken, asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ 
      success: false, 
      message: '请提供 startDate 和 endDate 参数' 
    });
  }

  const result = await oeeService.getOEELineTrend(startDate, endDate, groupBy);
  res.json({ success: true, data: result });
}));

module.exports = router;
