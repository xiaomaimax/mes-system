/**
 * 超简化版通用 CRUD 路由生成器（最终修复版）
 * 为所有模块提供标准的增删改查功能，完全避免字段不存在的错误
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
    allowedFields: ['material_code', 'material_name', 'material_type', 'specifications', 'unit', 'status', 'category_id', 'supplier_id']
  },
  material_categories: {
    table: 'material_categories',
    name: '物料分类',
    allowedFields: ['category_code', 'category_name', 'parent_id', 'level', 'description', 'sort_order', 'status']
  },
  suppliers: {
    table: 'suppliers',
    name: '供应商',
    allowedFields: ['supplier_code', 'supplier_name', 'supplier_type', 'contact_person', 'contact_phone', 'contact_email', 'address', 'credit_level']
  },
  warehouses: {
    table: 'warehouses',
    name: '仓库',
    allowedFields: ['warehouse_code', 'warehouse_name', 'warehouse_type', 'location', 'manager', 'contact_phone']
  },
  equipment: {
    table: 'equipment',
    name: '设备',
    allowedFields: ['equipment_code', 'equipment_name', 'equipment_type', 'production_line_id', 'status', 'location']
  },
  production_lines: {
    table: 'production_lines',
    name: '生产线',
    allowedFields: ['line_code', 'line_name', 'status', 'description']
  },
  molds: {
    table: 'molds',
    name: '模具',
    allowedFields: ['mold_code', 'mold_name', 'mold_type', 'material_id', 'cavity_count', 'life_cycle', 'status']
  },
  quality_inspections: {
    table: 'quality_inspections',
    name: '质量检验',
    allowedFields: ['inspection_no', 'material_id', 'inspection_type', 'quantity', 'qualified_quantity', 'status']
  }
};

// 安全的字段过滤函数
function filterAllowedFields(data, allowedFields) {
  const filteredData = {};
  for (const [key, value] of Object.entries(data)) {
    if (allowedFields.includes(key)) {
      filteredData[key] = value;
    }
  }
  return filteredData;
}

// 为每个模块生成 CRUD 路由
Object.keys(modules).forEach(moduleKey => {
  const module = modules[moduleKey];
  const tableName = module.table;
  const moduleName = module.name;
  const allowedFields = module.allowedFields;

  console.log(`正在生成 ${moduleName} 的超简化版 CRUD 路由...`);

  /**
   * POST /api/crud/:module
   * 创建新记录（最终修复版，安全的字段验证）
   */
  router.post(`/${moduleKey}`, authenticateToken, async (req, res) => {
    try {
      const data = req.body;

      // 严格过滤字段，只保留允许的字段
      const filteredData = filterAllowedFields(data, allowedFields);

      // 检查表结构以确认字段存在
      let columnNames = [];
      try {
        const [results] = await sequelize.query(
          `SHOW COLUMNS FROM ${tableName}`,
          { type: sequelize.QueryTypes.RAW } // 使用 RAW 类型获取原始结果
        );
        
        // 确保 results 是数组，然后提取字段名
        if (Array.isArray(results) && results.length > 0) {
          // 如果 results[0] 是包含列信息的数组
          if (Array.isArray(results[0])) {
            columnNames = results[0].map(col => col.Field).filter(field => field);
          } else {
            // 如果 results[0] 是对象数组
            columnNames = results.map(row => row.Field).filter(field => field);
          }
        }
      } catch (error) {
        console.error(`获取表 ${tableName} 结构失败:`, error);
        return res.status(500).json({
          success: false,
          message: `获取${moduleName}表结构失败`
        });
      }

      // 进一步过滤，只保留表中实际存在的字段
      const safeFieldNames = [];
      const safeValues = [];
      
      for (const [key, value] of Object.entries(filteredData)) {
        if (columnNames.includes(key)) {
          safeFieldNames.push(key);
          safeValues.push(value);
        }
      }

      // 添加时间戳字段（如果表中有这些字段）
      if (columnNames.includes('created_at')) {
        safeFieldNames.push('created_at');
        safeValues.push(new Date());
      }
      if (columnNames.includes('updated_at')) {
        safeFieldNames.push('updated_at');
        safeValues.push(new Date());
      }

      if (safeFieldNames.length === 0) {
        return res.status(400).json({
          success: false,
          message: `${moduleName}没有可插入的有效字段`
        });
      }

      const placeholders = safeFieldNames.map(() => '?').join(', ');
      const sql = `INSERT INTO ${tableName} (${safeFieldNames.join(', ')}) VALUES (${placeholders})`;

      const [result] = await sequelize.query(sql, {
        replacements: safeValues,
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
   * GET /api/crud/:module
   * 查询列表（支持分页和简单过滤）
   */
  router.get(`/${moduleKey}`, authenticateToken, async (req, res) => {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;
      const offset = (Math.max(1, parseInt(page)) - 1) * Math.min(100, parseInt(limit));
      
      // 构建 WHERE 条件，只使用表中存在的字段
      let columnNames = [];
      try {
        const [results] = await sequelize.query(
          `SHOW COLUMNS FROM ${tableName}`,
          { type: sequelize.QueryTypes.RAW }
        );
        
        if (Array.isArray(results) && results.length > 0) {
          if (Array.isArray(results[0])) {
            columnNames = results[0].map(col => col.Field).filter(field => field);
          } else {
            columnNames = results.map(row => row.Field).filter(field => field);
          }
        }
      } catch (error) {
        console.error(`获取表 ${tableName} 结构失败:`, error);
        return res.status(500).json({
          success: false,
          message: `获取${moduleName}表结构失败`
        });
      }
      
      const validFilters = {};
      for (const [key, value] of Object.entries(filters)) {
        if (columnNames.includes(key)) {
          validFilters[key] = value;
        }
      }
      
      const whereParts = [];
      const values = [];
      for (const [key, value] of Object.entries(validFilters)) {
        whereParts.push(`${key} = ?`);
        values.push(value);
      }
      
      const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';
      
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
   * PUT /api/crud/:module/:id
   * 更新记录（最终修复版，安全的字段验证）
   */
  router.put(`/${moduleKey}/:id`, authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;

      // 严格过滤字段
      const filteredData = filterAllowedFields(data, allowedFields);

      // 检查表结构
      let columnNames = [];
      try {
        const [results] = await sequelize.query(
          `SHOW COLUMNS FROM ${tableName}`,
          { type: sequelize.QueryTypes.RAW }
        );
        
        if (Array.isArray(results) && results.length > 0) {
          if (Array.isArray(results[0])) {
            columnNames = results[0].map(col => col.Field).filter(field => field);
          } else {
            columnNames = results.map(row => row.Field).filter(field => field);
          }
        }
      } catch (error) {
        console.error(`获取表 ${tableName} 结构失败:`, error);
        return res.status(500).json({
          success: false,
          message: `获取${moduleName}表结构失败`
        });
      }

      // 进一步过滤，只保留表中实际存在的字段
      const updateFields = [];
      const updateValues = [];
      
      for (const [key, value] of Object.entries(filteredData)) {
        if (columnNames.includes(key)) {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      }

      // 添加更新时间（如果表中有此字段）
      if (columnNames.includes('updated_at')) {
        updateFields.push('updated_at = ?');
        updateValues.push(new Date());
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: `${moduleName}没有可更新的有效字段`
        });
      }

      updateValues.push(id);

      const sql = `UPDATE ${tableName} SET ${updateFields.join(', ')} WHERE id = ?`;

      const [result] = await sequelize.query(sql, {
        replacements: updateValues,
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