/**
 * 简化版通用 CRUD 路由生成器（最简修复版）
 * 为所有模块提供标准的增删改查功能，避免字段不存在的错误
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../routes/auth');
const sequelize = require('../config/database');

// 模块配置
const modules = {
  materials: {
    table: 'materials',
    name: '物料',
    fields: ['material_code', 'material_name', 'material_type', 'specifications', 'unit', 'status', 'category_id', 'supplier_id']
  },
  material_categories: {
    table: 'material_categories',
    name: '物料分类',
    fields: ['category_code', 'category_name', 'parent_id', 'level', 'description', 'sort_order', 'status']
  },
  suppliers: {
    table: 'suppliers',
    name: '供应商',
    fields: ['supplier_code', 'supplier_name', 'supplier_type', 'contact_person', 'contact_phone', 'contact_email', 'address', 'credit_level']
  },
  warehouses: {
    table: 'warehouses',
    name: '仓库',
    fields: ['warehouse_code', 'warehouse_name', 'warehouse_type', 'location', 'manager', 'contact_phone', 'capacity']
  },
  equipment: {
    table: 'equipment',
    name: '设备',
    fields: ['equipment_code', 'equipment_name', 'equipment_type', 'production_line_id', 'status', 'location']
  },
  production_lines: {
    table: 'production_lines',
    name: '生产线',
    fields: ['line_code', 'line_name', 'status', 'description']
  },
  molds: {
    table: 'molds',
    name: '模具',
    fields: ['mold_code', 'mold_name', 'mold_type', 'material_id', 'cavity_count', 'life_cycle', 'status']
  },
  quality_inspections: {
    table: 'quality_inspections',
    name: '质量检验',
    fields: ['inspection_no', 'material_id', 'inspection_type', 'quantity', 'qualified_quantity', 'status']
  }
};

// 为每个模块生成 CRUD 路由
Object.keys(modules).forEach(moduleKey => {
  const module = modules[moduleKey];
  const tableName = module.table;
  const moduleName = module.name;

  console.log(`正在生成 ${moduleName} 的简化版 CRUD 路由...`);

  /**
   * GET /api/crud/:module
   * 查询列表（支持分页和简单过滤）
   */
  router.get(`/${moduleKey}`, authenticateToken, async (req, res) => {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;
      const offset = (Math.max(1, parseInt(page)) - 1) * Math.min(100, parseInt(limit));
      
      // 构建 WHERE 条件
      const whereClause = Object.keys(filters).length > 0
        ? 'WHERE ' + Object.keys(filters).map(f => `${f} = ?`).join(' AND ')
        : '';
      const values = Object.values(filters);

      // 查询总数
      const [countResult] = await sequelize.query(
        `SELECT COUNT(*) as total FROM ${tableName} ${whereClause}`,
        { replacements: values, type: sequelize.QueryTypes.SELECT }
      );
      const total = countResult.total;

      // 查询数据
      const [rows] = await sequelize.query(
        `SELECT * FROM ${tableName} ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`,
        { replacements: [...values, parseInt(limit), offset], type: sequelize.QueryTypes.SELECT }
      );

      res.json({
        success: true,
        data: rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error(`查询${moduleName}错误:`, error);
      res.status(500).json({
        success: false,
        message: `查询${moduleName}失败：${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * GET /api/crud/:module/:id
   * 查询单条记录
   */
  router.get(`/${moduleKey}/:id`, authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const [row] = await sequelize.query(
        `SELECT * FROM ${tableName} WHERE id = ?`,
        { replacements: [id], type: sequelize.QueryTypes.SELECT }
      );

      if (!row) {
        return res.status(404).json({
          success: false,
          message: `${moduleName}不存在`
        });
      }

      res.json({
        success: true,
        data: row
      });
    } catch (error) {
      console.error(`查询${moduleName}详情错误:`, error);
      res.status(500).json({
        success: false,
        message: `查询${moduleName}详情失败：${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * POST /api/crud/:module
   * 创建新记录（简化版，仅插入已知字段）
   */
  router.post(`/${moduleKey}`, authenticateToken, async (req, res) => {
    try {
      const data = req.body;
      const userId = req.user.userId;

      // 根据模块类型决定哪些字段可以插入
      const allowedFields = module.fields || [];
      
      // 过滤数据，只保留允许的字段
      const filteredData = {};
      for (const [key, value] of Object.entries(data)) {
        if (allowedFields.includes(key)) {
          filteredData[key] = value;
        }
      }

      // 构建字段列表和值列表
      const fieldNames = Object.keys(filteredData);
      const values = Object.values(filteredData);
      
      // 添加时间戳字段（大多数表都有）
      fieldNames.push('created_at', 'updated_at');
      values.push(new Date(), new Date());

      const placeholders = fieldNames.map(() => '?').join(', ');
      const sql = `INSERT INTO ${tableName} (${fieldNames.join(', ')}) VALUES (${placeholders})`;

      const [result] = await sequelize.query(sql, {
        replacements: values,
        type: sequelize.QueryTypes.INSERT
      });

      res.status(201).json({
        success: true,
        message: `创建${moduleName}成功`,
        data: {
          id: result,
          ...data
        }
      });
    } catch (error) {
      console.error(`创建${moduleName}错误:`, error);
      res.status(500).json({
        success: false,
        message: `创建${moduleName}失败：${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * PUT /api/crud/:module/:id
   * 更新记录（简化版，仅更新已知字段）
   */
  router.put(`/${moduleKey}/:id`, authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const userId = req.user.userId;

      // 根据模块类型决定哪些字段可以更新
      const allowedFields = module.fields || [];
      
      // 过滤数据，只保留允许的字段
      const filteredData = {};
      for (const [key, value] of Object.entries(data)) {
        if (allowedFields.includes(key)) {
          filteredData[key] = value;
        }
      }

      // 构建 SET 子句
      const setFields = Object.keys(filteredData);
      const values = Object.values(filteredData);
      
      // 添加更新时间
      setFields.push('updated_at');
      values.push(new Date());

      const setClause = setFields.map(field => `${field} = ?`).join(', ');
      const sql = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
      values.push(id);

      const [result] = await sequelize.query(sql, {
        replacements: values,
        type: sequelize.QueryTypes.UPDATE
      });

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: `${moduleName}不存在`
        });
      }

      res.json({
        success: true,
        message: `更新${moduleName}成功`,
        data: {
          id: parseInt(id),
          ...data
        }
      });
    } catch (error) {
      console.error(`更新${moduleName}错误:`, error);
      res.status(500).json({
        success: false,
        message: `更新${moduleName}失败：${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * DELETE /api/crud/:module/:id
   * 删除记录
   */
  router.delete(`/${moduleKey}/:id`, authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;

      const [result] = await sequelize.query(
        `DELETE FROM ${tableName} WHERE id = ?`,
        {
          replacements: [id],
          type: sequelize.QueryTypes.DELETE
        }
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: `${moduleName}不存在`
        });
      }

      res.json({
        success: true,
        message: `删除${moduleName}成功`,
        data: {
          id: parseInt(id)
        }
      });
    } catch (error) {
      console.error(`删除${moduleName}错误:`, error);
      res.status(500).json({
        success: false,
        message: `删除${moduleName}失败：${error.message}`,
        error: error.message
      });
    }
  });
});

module.exports = router;