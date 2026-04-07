/**
 * 设备档案管理API路由
 * 提供设备档案的CRUD操作
 */
const express = require('express');
const { authenticateToken } = require('./auth');
const mysql = require('mysql2/promise');

const router = express.Router();

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mes_system',
  charset: 'utf8mb4'
};

/**
 * GET /api/equipment-archives
 * 获取设备档案列表
 */
router.get('/', authenticateToken, async (req, res) => {
  let connection;
  
  try {
    const {
      page = 1,
      limit = 10,
      equipmentCode,
      category,
      status,
      manufacturer
    } = req.query;

    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit)));

    connection = await mysql.createConnection(dbConfig);

    // 构建查询条件
    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    if (equipmentCode) {
      whereClause += ' AND (equipment_code LIKE ? OR equipment_name LIKE ?)';
      queryParams.push(`%${equipmentCode}%`, `%${equipmentCode}%`);
    }

    if (category) {
      whereClause += ' AND category = ?';
      queryParams.push(category);
    }

    if (status) {
      whereClause += ' AND status = ?';
      queryParams.push(status);
    }

    if (manufacturer) {
      whereClause += ' AND manufacturer LIKE ?';
      queryParams.push(`%${manufacturer}%`);
    }

    // 查询总数
    const countSQL = `SELECT COUNT(*) as total FROM equipment_archives ${whereClause}`;
    const [countResult] = await connection.execute(countSQL, queryParams);
    const total = countResult[0].total;

    // 查询数据
    const dataSQL = `
      SELECT 
        id,
        equipment_code,
        equipment_name,
        category,
        model,
        manufacturer,
        purchase_date,
        warranty_end_date,
        original_value,
        current_value,
        location,
        status,
        technical_specs,
        documents,
        maintenance_records,
        repair_records,
        remarks,
        created_at,
        updated_at
      FROM equipment_archives 
      ${whereClause}
      ORDER BY equipment_code
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    const [rows] = await connection.execute(dataSQL, queryParams);

    // 格式化数据
    const formattedData = rows.map(row => ({
      ...row,
      technical_specs: row.technical_specs ? (typeof row.technical_specs === 'string' ? JSON.parse(row.technical_specs) : row.technical_specs) : {},
      documents: row.documents ? (typeof row.documents === 'string' ? JSON.parse(row.documents) : row.documents) : [],
      purchase_date: row.purchase_date ? row.purchase_date.toISOString().split('T')[0] : null,
      warranty_end_date: row.warranty_end_date ? row.warranty_end_date.toISOString().split('T')[0] : null
    }));

    res.json({
      success: true,
      data: formattedData,
      pagination: {
        total,
        page: parseInt(page),
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });

  } catch (error) {
    console.error('获取设备档案列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

/**
 * GET /api/equipment-archives/:id
 * 获取单个设备档案详情
 */
router.get('/:id', authenticateToken, async (req, res) => {
  let connection;
  
  try {
    const { id } = req.params;
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      `SELECT * FROM equipment_archives WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '设备档案不存在'
      });
    }

    const archive = rows[0];
    const formattedArchive = {
      ...archive,
      technical_specs: archive.technical_specs ? JSON.parse(archive.technical_specs) : {},
      documents: archive.documents ? JSON.parse(archive.documents) : [],
      purchase_date: archive.purchase_date ? archive.purchase_date.toISOString().split('T')[0] : null,
      warranty_end_date: archive.warranty_end_date ? archive.warranty_end_date.toISOString().split('T')[0] : null
    };

    res.json({
      success: true,
      data: formattedArchive
    });

  } catch (error) {
    console.error('获取设备档案详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

/**
 * POST /api/equipment-archives
 * 创建新的设备档案
 */
router.post('/', authenticateToken, async (req, res) => {
  let connection;
  
  try {
    const {
      equipment_code,
      equipment_name,
      category,
      model,
      manufacturer,
      purchase_date,
      warranty_end_date,
      original_value,
      current_value,
      location,
      status,
      technical_specs,
      documents,
      maintenance_records,
      repair_records,
      remarks
    } = req.body;

    // 验证必填字段
    if (!equipment_code || !equipment_name || !category) {
      return res.status(400).json({
        success: false,
        message: '设备编号、设备名称和设备类别为必填项'
      });
    }

    connection = await mysql.createConnection(dbConfig);

    // 检查设备编号是否已存在
    const [existing] = await connection.execute(
      'SELECT id FROM equipment_archives WHERE equipment_code = ?',
      [equipment_code]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: '设备编号已存在'
      });
    }

    // 插入新档案
    const insertSQL = `
      INSERT INTO equipment_archives (
        equipment_code, equipment_name, category, model, manufacturer,
        purchase_date, warranty_end_date, original_value, current_value,
        location, status, technical_specs, documents, maintenance_records,
        repair_records, remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.execute(insertSQL, [
      equipment_code,
      equipment_name,
      category,
      model,
      manufacturer,
      purchase_date,
      warranty_end_date,
      original_value,
      current_value,
      location,
      status || 'running',
      technical_specs ? JSON.stringify(technical_specs) : null,
      documents ? JSON.stringify(documents) : null,
      maintenance_records || 0,
      repair_records || 0,
      remarks
    ]);

    res.json({
      success: true,
      message: '设备档案创建成功',
      data: {
        id: result.insertId,
        equipment_code
      }
    });

  } catch (error) {
    console.error('创建设备档案错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

/**
 * PUT /api/equipment-archives/:id
 * 更新设备档案
 */
router.put('/:id', authenticateToken, async (req, res) => {
  let connection;
  
  try {
    const { id } = req.params;
    const updateData = req.body;

    connection = await mysql.createConnection(dbConfig);

    // 检查档案是否存在
    const [existing] = await connection.execute(
      'SELECT id FROM equipment_archives WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '设备档案不存在'
      });
    }

    // 构建更新SQL
    const updateFields = [];
    const updateValues = [];

    const allowedFields = [
      'equipment_name', 'category', 'model', 'manufacturer',
      'purchase_date', 'warranty_end_date', 'original_value', 'current_value',
      'location', 'status', 'technical_specs', 'documents',
      'maintenance_records', 'repair_records', 'remarks'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        if (field === 'technical_specs' || field === 'documents') {
          updateValues.push(JSON.stringify(updateData[field]));
        } else {
          updateValues.push(updateData[field]);
        }
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有提供要更新的字段'
      });
    }

    const updateSQL = `
      UPDATE equipment_archives 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await connection.execute(updateSQL, [...updateValues, id]);

    res.json({
      success: true,
      message: '设备档案更新成功'
    });

  } catch (error) {
    console.error('更新设备档案错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

/**
 * DELETE /api/equipment-archives/:id
 * 删除设备档案
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  let connection;
  
  try {
    const { id } = req.params;
    connection = await mysql.createConnection(dbConfig);

    // 检查档案是否存在
    const [existing] = await connection.execute(
      'SELECT equipment_code FROM equipment_archives WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '设备档案不存在'
      });
    }

    // 删除档案
    await connection.execute('DELETE FROM equipment_archives WHERE id = ?', [id]);

    res.json({
      success: true,
      message: '设备档案删除成功'
    });

  } catch (error) {
    console.error('删除设备档案错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

/**
 * GET /api/equipment-archives/stats/summary
 * 获取设备档案统计信息
 */
router.get('/stats/summary', authenticateToken, async (req, res) => {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);

    // 统计各种数据
    const [totalCount] = await connection.execute(
      'SELECT COUNT(*) as total FROM equipment_archives'
    );

    const [statusStats] = await connection.execute(`
      SELECT status, COUNT(*) as count 
      FROM equipment_archives 
      GROUP BY status
    `);

    const [categoryStats] = await connection.execute(`
      SELECT category, COUNT(*) as count 
      FROM equipment_archives 
      GROUP BY category
    `);

    const [valueStats] = await connection.execute(`
      SELECT 
        SUM(original_value) as total_original_value,
        SUM(current_value) as total_current_value,
        AVG(original_value) as avg_original_value,
        AVG(current_value) as avg_current_value
      FROM equipment_archives
    `);

    res.json({
      success: true,
      data: {
        total: totalCount[0].total,
        status_distribution: statusStats,
        category_distribution: categoryStats,
        value_statistics: valueStats[0]
      }
    });

  } catch (error) {
    console.error('获取设备档案统计错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

module.exports = router;