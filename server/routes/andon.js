/**
 * Andon API 路由
 */
const express = require('express');
const router = express.Router();
const andonService = require('../services/andonService');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('./auth');

// POST /api/andon/calls - 创建呼叫
router.post('/calls', authenticateToken, asyncHandler(async (req, res) => {
  const { call_type, priority, production_line_id, station, description } = req.body;
  
  if (!call_type || !production_line_id) {
    return res.status(400).json({ success: false, message: '缺少必填参数' });
  }
  
  const call = await andonService.createCall({
    call_type,
    priority: priority || 'normal',
    production_line_id,
    station,
    description,
    caller_id: req.user?.id
  });
  
  // 广播到 Socket.IO
  const io = req.app.get('io');
  if (io) {
    io.to('andon').emit('andon:new', call);
  }
  
  res.json({ success: true, data: call });
}));

// GET /api/andon/calls - 获取呼叫列表
router.get('/calls', authenticateToken, asyncHandler(async (req, res) => {
  const result = await andonService.getCalls(req.query);
  res.json({ success: true, ...result });
}));

// GET /api/andon/active - 获取活跃呼叫
router.get('/active', authenticateToken, asyncHandler(async (req, res) => {
  const { production_line_id } = req.query;
  const calls = await andonService.getActiveCalls(production_line_id);
  res.json({ success: true, data: calls });
}));

// GET /api/andon/statistics - 获取统计
router.get('/statistics', authenticateToken, asyncHandler(async (req, res) => {
  const { production_line_id, days = 7 } = req.query;
  const stats = await andonService.getStatistics(production_line_id, parseInt(days));
  res.json({ success: true, data: stats });
}));

// GET /api/andon/lines - 获取生产线列表
router.get('/lines', authenticateToken, asyncHandler(async (req, res) => {
  const lines = await andonService.getProductionLines();
  res.json({ success: true, data: lines });
}));

// PUT /api/andon/calls/:id/acknowledge - 确认呼叫
router.put('/calls/:id/acknowledge', authenticateToken, asyncHandler(async (req, res) => {
  const call = await andonService.acknowledgeCall(parseInt(req.params.id), req.user?.id);
  
  const io = req.app.get('io');
  if (io) {
    io.to('andon').emit('andon:update', call);
  }
  
  res.json({ success: true, data: call });
}));

// PUT /api/andon/calls/:id/start - 开始处理
router.put('/calls/:id/start', authenticateToken, asyncHandler(async (req, res) => {
  const call = await andonService.startProcessing(parseInt(req.params.id), req.user?.id);
  
  const io = req.app.get('io');
  if (io) {
    io.to('andon').emit('andon:update', call);
  }
  
  res.json({ success: true, data: call });
}));

// PUT /api/andon/calls/:id/resolve - 解决呼叫
router.put('/calls/:id/resolve', authenticateToken, asyncHandler(async (req, res) => {
  const { notes } = req.body;
  const call = await andonService.resolveCall(parseInt(req.params.id), req.user?.id, notes);
  
  const io = req.app.get('io');
  if (io) {
    io.to('andon').emit('andon:resolved', call);
  }
  
  res.json({ success: true, data: call });
}));

module.exports = router;
