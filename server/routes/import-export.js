/**
 * MaxMES - 数据导入/导出通用 API
 * 支持 Excel 和 CSV 格式
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('./auth');
const sequelize = require('../config/database');

// Multer 配置 - 文件上传
const upload = multer({
  dest: '/tmp/mes-uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/csv'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('仅支持 Excel (.xlsx, .xls) 和 CSV 文件'));
    }
  }
});

// 确保上传目录存在
const uploadDir = '/tmp/mes-uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * POST /api/import-export/:module/import
 * 批量导入数据（Excel/CSV）
 */
router.post('/:module/import', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { module } = req.params;
    const filePath = req.file.path;

    console.log(`[导入] 开始导入 ${module} 模块...`);
    console.log(`[导入] 文件路径: ${filePath}`);

    // 读取文件（支持 Excel 和 CSV）
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // 解析数据为 JSON
    const jsonData = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    console.log(`[导入] 解析到 ${jsonData.length} 条记录`);

    if (jsonData.length === 0) {
      return res.status(400).json({
        success: false,
        message: '文件中没有数据'
      });
    }

    // 获取表的所有列名
    const tableInfo = await sequelize.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = :tableName`,
      {
        replacements: { tableName: module },
        type: sequelize.QueryTypes.SELECT
      }
    );

    const allowedColumns = tableInfo.map(row => row.COLUMN_NAME);
    console.log(`[导入] 允许的列: ${allowedColumns.join(', ')}`);

    // 过滤数据，只保留存在的列
    const validData = jsonData.map(row => {
      const filteredRow = {};
      Object.keys(row).forEach(key => {
        const cleanKey = key.toLowerCase().replace(/\s+/g, '_');
        if (allowedColumns.includes(cleanKey)) {
          filteredRow[cleanKey] = row[key];
        }
      });
      return filteredRow;
    }).filter(row => Object.keys(row).length > 0);

    console.log(`[导入] 有效数据: ${validData.length} 条`);

    // 批量插入数据库
    const result = await sequelize.query(
      `INSERT INTO ${module} (${Object.keys(validData[0]).join(', ')}) VALUES :values ON DUPLICATE KEY UPDATE updated_at = NOW()`,
      {
        replacements: {
          values: validData.map(row => Object.values(row))
        },
        type: sequelize.QueryTypes.INSERT
      }
    );

    // 清理临时文件
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: `成功导入 ${validData.length} 条记录`,
      importedCount: validData.length,
      failedCount: jsonData.length - validData.length
    });

  } catch (error) {
    console.error('[导入错误]:', error);
    res.status(500).json({
      success: false,
      message: '导入失败: ' + error.message
    });
  }
});

/**
 * GET /api/import-export/:module/export
 * 导出数据（Excel）
 */
router.get('/:module/export', authenticateToken, async (req, res) => {
  try {
    const { module } = req.params;
    const { format = 'xlsx', fields } = req.query;

    console.log(`[导出] 开始导出 ${module} 模块...`);

    // 查询数据
    const [rows] = await sequelize.query(
      `SELECT * FROM ${module} WHERE deleted_at IS NULL ORDER BY id DESC LIMIT 10000`,
      {
        type: sequelize.QueryTypes.SELECT
      }
    );

    console.log(`[导出] 查询到 ${rows.length} 条记录`);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '没有数据可导出'
      });
    }

    // 转换为 Excel
    const worksheet = xlsx.utils.json_to_sheet(rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Data');

    // 生成文件
    const fileName = `${module}_export_${Date.now()}.xlsx`;
    const filePath = `/tmp/mes-uploads/${fileName}`;
    xlsx.writeFile(workbook, filePath);

    console.log(`[导出] 文件已生成: ${filePath}`);

    // 发送文件
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('[导出错误]:', err);
      }
      // 延迟删除临时文件
      setTimeout(() => {
        fs.unlinkSync(filePath);
      }, 5000);
    });

  } catch (error) {
    console.error('[导出错误]:', error);
    res.status(500).json({
      success: false,
      message: '导出失败: ' + error.message
    });
  }
});

/**
 * GET /api/import-export/:module/export/template
 * 下载导入模板
 */
router.get('/:module/export/template', authenticateToken, async (req, res) => {
  try {
    const { module } = req.params;

    // 获取表结构
    const tableInfo = await sequelize.query(
      `SELECT COLUMN_NAME, DATA_TYPE, COLUMN_COMMENT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = :tableName AND COLUMN_KEY != 'PRI'`,
      {
        replacements: { tableName: module },
        type: sequelize.QueryTypes.SELECT
      }
    );

    // 生成空模板
    const template = tableInfo.map(col => ({
      [col.COLUMN_NAME]: col.COLUMN_COMMENT || col.COLUMN_NAME
    }));

    const worksheet = xlsx.utils.json_to_sheet([template]);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Template');

    const fileName = `${module}_template.xlsx`;
    const filePath = `/tmp/mes-uploads/${fileName}`;
    xlsx.writeFile(workbook, filePath);

    res.download(filePath, fileName, (err) => {
      setTimeout(() => {
        fs.unlinkSync(filePath);
      }, 5000);
    });

  } catch (error) {
    console.error('[模板下载错误]:', error);
    res.status(500).json({
      success: false,
      message: '模板下载失败: ' + error.message
    });
  }
});

module.exports = router;
