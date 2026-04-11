const express = require('express');
const router = express.Router();
const traceabilityService = require('../services/traceabilityService');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('./auth');

router.get('/batches', authenticateToken, asyncHandler(async (req, res) => {
  const result = await traceabilityService.getBatches(req.query);
  res.json({ success: true, ...result });
}));

router.get('/statistics', authenticateToken, asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const stats = await traceabilityService.getStatistics(parseInt(days));
  res.json({ success: true, data: stats });
}));

router.get('/batch/:batchNumber', authenticateToken, asyncHandler(async (req, res) => {
  const { batchNumber } = req.params;
  const result = await traceabilityService.getBatchByNumber(batchNumber);
  res.json({ success: true, data: result });
}));

router.get('/forward/:batchNumber', authenticateToken, asyncHandler(async (req, res) => {
  const { batchNumber } = req.params;
  const result = await traceabilityService.forwardTrace(batchNumber);
  res.json({ success: true, data: result });
}));

router.get('/backward/:batchNumber', authenticateToken, asyncHandler(async (req, res) => {
  const { batchNumber } = req.params;
  const result = await traceabilityService.backwardTrace(batchNumber);
  res.json({ success: true, data: result });
}));

router.get('/process/:batchNumber', authenticateToken, asyncHandler(async (req, res) => {
  const { batchNumber } = req.params;
  const result = await traceabilityService.getProcessChain(batchNumber);
  res.json({ success: true, data: result });
}));

router.post('/quality-trace', authenticateToken, asyncHandler(async (req, res) => {
  const { batchNumber, issueDescription } = req.body;
  if (!batchNumber) return res.status(400).json({ success: false, message: '请提供批次号' });
  const result = await traceabilityService.qualityIssueTrace(batchNumber, issueDescription || '');
  res.json({ success: true, data: result });
}));

module.exports = router;
