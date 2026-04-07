const express = require('express');
const { authenticateToken } = require('./auth');
const logger = require('../utils/logger');
const { asyncHandler, ValidationError, NotFoundError, DatabaseError } = require('../middleware/errorHandler');
const { createValidationMiddleware, validationRules } = require('../middleware/validation');
const { withTransaction } = require('../utils/transaction');
const pool = require('../config/mysql');

const router = express.Router();

// ==================== IQC Inspection (Incoming Quality Control) ====================

// Get IQC inspection list
router.get('/iqc-inspections', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM iqc_inspections';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY inspection_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await pool.query(query, params);
    
    let countQuery = 'SELECT COUNT(*) as total FROM iqc_inspections';
    if (status) {
      countQuery += ' WHERE status = ?';
    }
    const [countResult] = await pool.query(countQuery, status ? [status] : []);
    const total = countResult[0].total;

    logger.info('Get IQC inspection list', {
      userId: req.user.userId,
      page,
      limit,
      total
    });

    res.json({
      code: 200,
      message: 'Success',
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  })
);

// Create IQC inspection record
router.post('/iqc-inspections',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const {
      inspection_id,
      purchase_order,
      supplier,
      material_info,
      arrival_date,
      inspection_date,
      inspector,
      inspection_qty,
      qualified_qty,
      defect_type,
      comprehensive_score,
      inspection_result,
      status,
      notes
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO iqc_inspections 
       (inspection_id, purchase_order, supplier, material_info, arrival_date, inspection_date, 
        inspector, inspection_qty, qualified_qty, defect_type, comprehensive_score, 
        inspection_result, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [inspection_id, purchase_order, supplier, material_info, arrival_date, inspection_date,
       inspector, inspection_qty, qualified_qty, defect_type, comprehensive_score,
       inspection_result || 'pending', status || 'pending', notes]
    );

    logger.info('IQC inspection record created', {
      inspectionId: inspection_id,
      userId: req.user.userId
    });

    res.status(201).json({
      code: 201,
      message: 'Created successfully',
      data: { id: result.insertId, inspection_id }
    });
  })
);

// ==================== PQC Inspection (Process Quality Control) ====================

// Get PQC inspection list
router.get('/pqc-inspections', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM pqc_inspections';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY inspection_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await pool.query(query, params);
    
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM pqc_inspections' + (status ? ' WHERE status = ?' : ''),
      status ? [status] : []
    );
    const total = countResult[0].total;

    logger.info('Get PQC inspection list', {
      userId: req.user.userId,
      page,
      limit,
      total
    });

    res.json({
      code: 200,
      message: 'Success',
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  })
);

// Create PQC inspection record
router.post('/pqc-inspections',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const {
      inspection_id,
      production_order,
      product_name,
      inspection_date,
      inspector,
      inspection_qty,
      qualified_qty,
      pass_rate,
      inspection_result,
      status,
      notes
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO pqc_inspections 
       (inspection_id, production_order, product_name, inspection_date, inspector, 
        inspection_qty, qualified_qty, pass_rate, inspection_result, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [inspection_id, production_order, product_name, inspection_date, inspector,
       inspection_qty, qualified_qty, pass_rate, inspection_result || 'pending', status || 'pending', notes]
    );

    logger.info('PQC inspection record created', {
      inspectionId: inspection_id,
      userId: req.user.userId
    });

    res.status(201).json({
      code: 201,
      message: 'Created successfully',
      data: { id: result.insertId, inspection_id }
    });
  })
);

// ==================== FQC Inspection (Final Quality Control) ====================

// Get FQC inspection list
router.get('/fqc-inspections', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM fqc_inspections';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY inspection_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await pool.query(query, params);
    
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM fqc_inspections' + (status ? ' WHERE status = ?' : ''),
      status ? [status] : []
    );
    const total = countResult[0].total;

    logger.info('Get FQC inspection list', {
      userId: req.user.userId,
      page,
      limit,
      total
    });

    res.json({
      code: 200,
      message: 'Success',
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  })
);

// Create FQC inspection record
router.post('/fqc-inspections',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const {
      inspection_id,
      batch_number,
      product_name,
      inspection_date,
      inspector,
      inspection_qty,
      qualified_qty,
      pass_rate,
      inspection_result,
      status,
      notes
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO fqc_inspections 
       (inspection_id, batch_number, product_name, inspection_date, inspector, 
        inspection_qty, qualified_qty, pass_rate, inspection_result, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [inspection_id, batch_number, product_name, inspection_date, inspector,
       inspection_qty, qualified_qty, pass_rate, inspection_result || 'pending', status || 'pending', notes]
    );

    logger.info('FQC inspection record created', {
      inspectionId: inspection_id,
      userId: req.user.userId
    });

    res.status(201).json({
      code: 201,
      message: 'Created successfully',
      data: { id: result.insertId, inspection_id }
    });
  })
);

// ==================== OQC Inspection (Outgoing Quality Control) ====================

// Get OQC inspection list
router.get('/oqc-inspections', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM oqc_inspections';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY inspection_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await pool.query(query, params);
    
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM oqc_inspections' + (status ? ' WHERE status = ?' : ''),
      status ? [status] : []
    );
    const total = countResult[0].total;

    logger.info('Get OQC inspection list', {
      userId: req.user.userId,
      page,
      limit,
      total
    });

    res.json({
      code: 200,
      message: 'Success',
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  })
);

// Create OQC inspection record
router.post('/oqc-inspections',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const {
      inspection_id,
      batch_number,
      product_name,
      inspection_date,
      inspector,
      inspection_qty,
      qualified_qty,
      pass_rate,
      inspection_result,
      status,
      notes
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO oqc_inspections 
       (inspection_id, batch_number, product_name, inspection_date, inspector, 
        inspection_qty, qualified_qty, pass_rate, inspection_result, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [inspection_id, batch_number, product_name, inspection_date, inspector,
       inspection_qty, qualified_qty, pass_rate, inspection_result || 'pending', status || 'pending', notes]
    );

    logger.info('OQC inspection record created', {
      inspectionId: inspection_id,
      userId: req.user.userId
    });

    res.status(201).json({
      code: 201,
      message: 'Created successfully',
      data: { id: result.insertId, inspection_id }
    });
  })
);

// ==================== Defect Reasons ====================

// Get defect reasons list
router.get('/defect-reasons', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM defect_reasons ORDER BY created_at DESC');

    logger.info('Get defect reasons list', {
      userId: req.user.userId,
      total: rows.length
    });

    res.json({
      code: 200,
      message: 'Success',
      data: rows
    });
  })
);

// Create defect reason
router.post('/defect-reasons',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const {
      reason_id,
      reason_code,
      reason_name,
      category,
      description,
      status
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO defect_reasons 
       (reason_id, reason_code, reason_name, category, description, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [reason_id, reason_code, reason_name, category, description, status || 'enabled']
    );

    logger.info('Defect reason created', {
      reasonId: reason_id,
      userId: req.user.userId
    });

    res.status(201).json({
      code: 201,
      message: 'Created successfully',
      data: { id: result.insertId, reason_id }
    });
  })
);

// ==================== Inspection Standards ====================

// Get inspection standards list
router.get('/inspection-standards', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM inspection_standards ORDER BY created_at DESC');

    logger.info('Get inspection standards list', {
      userId: req.user.userId,
      total: rows.length
    });

    res.json({
      code: 200,
      message: 'Success',
      data: rows
    });
  })
);

// Create inspection standard
router.post('/inspection-standards',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const {
      standard_id,
      product_name,
      standard_code,
      standard_name,
      version,
      status
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO inspection_standards 
       (standard_id, product_name, standard_code, standard_name, version, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [standard_id, product_name, standard_code, standard_name, version, status || 'enabled']
    );

    logger.info('Inspection standard created', {
      standardId: standard_id,
      userId: req.user.userId
    });

    res.status(201).json({
      code: 201,
      message: 'Created successfully',
      data: { id: result.insertId, standard_id }
    });
  })
);

// ==================== Defect Records ====================

// Get defect records list
router.get('/defect-records', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM defect_records';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await pool.query(query, params);
    
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM defect_records' + (status ? ' WHERE status = ?' : ''),
      status ? [status] : []
    );
    const total = countResult[0].total;

    logger.info('Get defect records list', {
      userId: req.user.userId,
      page,
      limit,
      total
    });

    res.json({
      code: 200,
      message: 'Success',
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  })
);

// Create defect record
router.post('/defect-records',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const {
      defect_code,
      defect_name,
      defect_category,
      severity,
      description
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO defect_records 
       (defect_code, defect_name, defect_category, severity, description) 
       VALUES (?, ?, ?, ?, ?)`,
      [defect_code, defect_name, defect_category, severity || 'minor', description]
    );

    logger.info('Defect record created', {
      defectCode: defect_code,
      userId: req.user.userId
    });

    res.status(201).json({
      code: 201,
      message: 'Created successfully',
      data: { id: result.insertId, record_id }
    });
  })
);

// ==================== Batch Tracing ====================

// Get batch tracing list
router.get('/batch-tracing', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      'SELECT * FROM batch_tracing ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [parseInt(limit), offset]
    );
    
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM batch_tracing');
    const total = countResult[0].total;

    logger.info('Get batch tracing list', {
      userId: req.user.userId,
      page,
      limit,
      total
    });

    res.json({
      code: 200,
      message: 'Success',
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  })
);

// Get single batch tracing details
router.get('/batch-tracing/:batchNumber', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { batchNumber } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM batch_tracing WHERE batch_number = ?',
      [batchNumber]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: 'Batch not found'
      });
    }

    logger.info('Get batch tracing details', {
      userId: req.user.userId,
      batchNumber
    });

    res.json({
      code: 200,
      message: 'Success',
      data: rows[0]
    });
  })
);

// Create batch tracing
router.post('/batch-tracing',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const {
      batch_number,
      product_name,
      production_date,
      iqc_status,
      pqc_status,
      fqc_status,
      oqc_status,
      overall_status,
      notes
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO batch_tracing 
       (batch_number, product_name, production_date, iqc_status, pqc_status, 
        fqc_status, oqc_status, overall_status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [batch_number, product_name, production_date, iqc_status, pqc_status,
       fqc_status, oqc_status, overall_status || 'pending', notes]
    );

    logger.info('Batch tracing created', {
      batchNumber: batch_number,
      userId: req.user.userId
    });

    res.status(201).json({
      code: 201,
      message: 'Created successfully',
      data: { id: result.insertId, batch_number }
    });
  })
);

module.exports = router;
