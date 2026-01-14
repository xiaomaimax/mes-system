/**
 * 综合模块API路由
 * 包含工艺、生产、库存、质量、设备、班次等模块的API
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');

const {
  ProcessRouting,
  ProcessParameters,
  ProductionLine,
  Inventory,
  InventoryTransaction,
  QualityInspection,
  DefectRecord,
  EquipmentMaintenance,
  ShiftSchedule,
  DailyProductionReport,
  Material,
  Device,
  Mold,
  User
} = require('../models');

// ============================================================================
// 工艺路由 (Process Routing)
// ============================================================================

router.get('/process-routing', authenticateToken, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, material_id } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (material_id) where.material_id = material_id;

  const { count, rows } = await ProcessRouting.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['material_id', 'ASC'], ['process_sequence', 'ASC']]
  });

  res.json({
    success: true,
    data: {
      routings: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    }
  });
}));

router.get('/process-routing/:id', authenticateToken, asyncHandler(async (req, res) => {
  const routing = await ProcessRouting.findByPk(req.params.id);

  if (!routing) {
    return res.status(404).json({ success: false, message: '工艺路由不存在' });
  }

  res.json({ success: true, data: routing });
}));

// ============================================================================
// 工艺参数 (Process Parameters)
// ============================================================================

router.get('/process-parameters', authenticateToken, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, routing_id } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (routing_id) where.routing_id = routing_id;

  const { count, rows } = await ProcessParameters.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['routing_id', 'ASC']]
  });

  res.json({
    success: true,
    data: {
      parameters: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    }
  });
}));

// ============================================================================
// 生产线 (Production Lines)
// ============================================================================

router.get('/production-lines', authenticateToken, asyncHandler(async (req, res) => {
  const lines = await ProductionLine.findAll({
    order: [['line_code', 'ASC']]
  });

  res.json({ success: true, data: lines });
}));

// ============================================================================
// 库存 (Inventory)
// ============================================================================

router.get('/inventory', authenticateToken, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, material_id } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (material_id) where.material_id = material_id;

  const { count, rows } = await Inventory.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['warehouse_location', 'ASC']]
  });

  res.json({
    success: true,
    data: {
      inventory: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    }
  });
}));

router.get('/inventory/:id', authenticateToken, asyncHandler(async (req, res) => {
  const inventory = await Inventory.findByPk(req.params.id);

  if (!inventory) {
    return res.status(404).json({ success: false, message: '库存记录不存在' });
  }

  res.json({ success: true, data: inventory });
}));

// ============================================================================
// 库存交易 (Inventory Transactions)
// ============================================================================

router.get('/inventory-transactions', authenticateToken, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, material_id, transaction_type } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (material_id) where.material_id = material_id;
  if (transaction_type) where.transaction_type = transaction_type;

  const { count, rows } = await InventoryTransaction.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['transaction_date', 'DESC']]
  });

  res.json({
    success: true,
    data: {
      transactions: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    }
  });
}));

// ============================================================================
// 质量检验 (Quality Inspections)
// ============================================================================

router.get('/quality-inspections', authenticateToken, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, inspection_type } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (inspection_type) where.inspection_type = inspection_type;

  const { count, rows } = await QualityInspection.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['inspection_date', 'DESC']]
  });

  res.json({
    success: true,
    data: {
      inspections: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    }
  });
}));

// ============================================================================
// 缺陷记录 (Defect Records)
// ============================================================================

router.get('/defect-records', authenticateToken, asyncHandler(async (req, res) => {
  const defects = await DefectRecord.findAll({
    order: [['severity', 'DESC'], ['defect_code', 'ASC']]
  });

  res.json({ success: true, data: defects });
}));

// ============================================================================
// 设备维护 (Equipment Maintenance)
// ============================================================================

router.get('/equipment-maintenance', authenticateToken, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, device_id } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (status) where.status = status;
  if (device_id) where.device_id = device_id;

  const { count, rows } = await EquipmentMaintenance.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['maintenance_date', 'DESC']]
  });

  res.json({
    success: true,
    data: {
      maintenance: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    }
  });
}));

// ============================================================================
// 班次计划 (Shift Schedule)
// ============================================================================

router.get('/shift-schedule', authenticateToken, asyncHandler(async (req, res) => {
  const shifts = await ShiftSchedule.findAll({
    order: [['shift_code', 'ASC']]
  });

  res.json({ success: true, data: shifts });
}));

// ============================================================================
// 生产日报 (Daily Production Report)
// ============================================================================

router.get('/daily-production-report', authenticateToken, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, report_date, production_line_id } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (report_date) where.report_date = report_date;
  if (production_line_id) where.production_line_id = production_line_id;

  const { count, rows } = await DailyProductionReport.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['report_date', 'DESC']]
  });

  res.json({
    success: true,
    data: {
      reports: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    }
  });
}));

// ============================================================================
// 统计数据 (Statistics)
// ============================================================================

router.get('/statistics/overview', authenticateToken, asyncHandler(async (req, res) => {
  const [
    totalInventory,
    totalQualityInspections,
    totalMaintenance,
    pendingMaintenance
  ] = await Promise.all([
    Inventory.count(),
    QualityInspection.count(),
    EquipmentMaintenance.count(),
    EquipmentMaintenance.count({ where: { status: 'pending' } })
  ]);

  res.json({
    success: true,
    data: {
      totalInventory,
      totalQualityInspections,
      totalMaintenance,
      pendingMaintenance
    }
  });
}));

module.exports = router;
