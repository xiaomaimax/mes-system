/**
 * 搜索 API 路由（P2-3 搜索优化）
 */
const express = require('express');
const router = express.Router();
const searchService = require('../services/searchService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/search
 * 全局搜索
 */
router.get('/', asyncHandler(async (req, res) => {
  const { q, limit = 20, type = 'all' } = req.query;
  
  if (!q || q.trim().length === 0) {
    return res.json({
      success: false,
      message: '请输入搜索关键词'
    });
  }
  
  const types = type === 'all' ? ['all'] : type.split(',');
  const results = await searchService.globalSearch(q.trim(), { limit, types });
  
  res.json({
    success: true,
    ...results
  });
}));

/**
 * GET /api/search/suggestions
 * 搜索建议
 */
router.get('/suggestions', asyncHandler(async (req, res) => {
  const { q, type = 'all' } = req.query;
  
  if (!q || q.trim().length < 1) {
    return res.json({ success: true, suggestions: [] });
  }
  
  const suggestions = await searchService.getSuggestions(q.trim(), type);
  
  res.json({
    success: true,
    suggestions
  });
}));

/**
 * POST /api/search/advanced
 * 高级搜索
 */
router.post('/advanced/:table', asyncHandler(async (req, res) => {
  const { table } = req.params;
  const conditions = req.body;
  
  // 白名单验证表名
  const allowedTables = [
    'production_orders',
    'equipment',
    'inventory',
    'defect_records',
    'production_lines'
  ];
  
  if (!allowedTables.includes(table)) {
    return res.status(400).json({
      success: false,
      message: '不支持的表'
    });
  }
  
  const results = await searchService.advancedSearch(conditions, table);
  
  res.json({
    success: true,
    ...results
  });
}));

module.exports = router;
