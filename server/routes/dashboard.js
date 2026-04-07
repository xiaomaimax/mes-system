/**
 * MaxMES - 仪表盘数据 API
 * 提供生产、库存、质量等统计数据
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const sequelize = require('../config/database');

/**
 * GET /api/dashboard/stats
 * 获取仪表盘统计数据
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    console.log('[仪表盘] 获取统计数据...');

    // 获取今日产量（从生产记录表）
    const [todayProduction] = await sequelize.query(
      `SELECT COALESCE(SUM(produced_quantity), 0) as today_production
       FROM production_records
       WHERE DATE(production_date) = CURDATE()`,
      { type: sequelize.QueryTypes.SELECT }
    );

    // 获取上周今日产量（计算趋势）
    const [lastWeekProduction] = await sequelize.query(
      `SELECT COALESCE(SUM(produced_quantity), 0) as production
       FROM production_records
       WHERE DATE(production_date) = DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const productionTrend = lastWeekProduction[0].production > 0
      ? ((todayProduction[0].today_production - lastWeekProduction[0].production) / lastWeekProduction[0].production * 100).toFixed(1)
      : 0;

    // 获取库存总量
    const [totalInventory] = await sequelize.query(
      `SELECT COALESCE(SUM(quantity), 0) as total_inventory,
              COALESCE(COUNT(DISTINCT material_id), 0) as total_materials
       FROM inventory`,
      { type: sequelize.QueryTypes.SELECT }
    );

    // 获取上周库存（计算趋势）
    const [lastWeekInventory] = await sequelize.query(
      `SELECT COALESCE(SUM(quantity), 0) as inventory
       FROM inventory_history
       WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const inventoryTrend = lastWeekInventory[0].inventory > 0
      ? ((totalInventory[0].total_inventory - lastWeekInventory[0].inventory) / lastWeekInventory[0].inventory * 100).toFixed(1)
      : 0;

    // 获取质量合格率
    const [qualityStats] = await sequelize.query(
      `SELECT COALESCE(SUM(qualified_quantity), 0) as qualified,
              COALESCE(SUM(quantity), 0) as total
       FROM quality_inspections
       WHERE DATE(created_at) = CURDATE()`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const qualityRate = qualityStats[0].total > 0
      ? (qualityStats[0].qualified / qualityStats[0].total * 100).toFixed(1)
      : 100;

    // 获取上周合格率（计算趋势）
    const [lastWeekQuality] = await sequelize.query(
      `SELECT COALESCE(SUM(qualified_quantity), 0) as qualified,
              COALESCE(SUM(quantity), 0) as total
       FROM quality_inspections
       WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const lastWeekRate = lastWeekQuality[0].total > 0
      ? (lastWeekQuality[0].qualified / lastWeekQuality[0].total * 100).toFixed(1)
      : 100;

    const qualityTrend = (qualityRate - lastWeekRate).toFixed(1);

    // 获取今日异常数
    const [issues] = await sequelize.query(
      `SELECT COUNT(*) as issues
       FROM equipment_maintenance
       WHERE DATE(created_at) = CURDATE()
         AND status IN ('pending', 'urgent')`,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.json({
      success: true,
      data: {
        todayProduction: parseInt(todayProduction[0].today_production),
        productionTrend: parseFloat(productionTrend),
        totalInventory: parseInt(totalInventory[0].total_inventory),
        inventoryTrend: parseFloat(inventoryTrend),
        qualityRate: parseFloat(qualityRate),
        qualityTrend: parseFloat(qualityTrend),
        issues: parseInt(issues[0].issues)
      }
    });

  } catch (error) {
    console.error('[仪表盘统计错误]:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败: ' + error.message
    });
  }
});

/**
 * GET /api/dashboard/production-trend
 * 获取生产趋势数据
 */
router.get('/production-trend', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, days = 7 } = req.query;

    console.log(`[仪表盘] 获取生产趋势: ${startDate} - ${endDate}`);

    // 计算日期范围
    let dateRange = '';
    if (startDate && endDate) {
      dateRange = `AND DATE(production_date) BETWEEN '${startDate}' AND '${endDate}'`;
    } else {
      dateRange = `AND DATE(production_date) >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)`;
    }

    // 查询每天的生产量
    const [productionData] = await sequelize.query(
      `SELECT DATE(production_date) as date,
              COALESCE(SUM(produced_quantity), 0) as quantity
       FROM production_records
       WHERE 1=1 ${dateRange}
       GROUP BY DATE(production_date)
       ORDER BY date ASC`,
      { type: sequelize.QueryTypes.SELECT }
    );

    // 格式化日期
    const formattedData = productionData.map(item => ({
      date: item.date.toISOString().split('T')[0].slice(5), // MM-DD
      quantity: item.quantity
    }));

    res.json({
      success: true,
      data: formattedData
    });

  } catch (error) {
    console.error('[生产趋势错误]:', error);
    res.status(500).json({
      success: false,
      message: '获取生产趋势失败: ' + error.message
    });
  }
});

/**
 * GET /api/dashboard/inventory-distribution
 * 获取库存分布数据
 */
router.get('/inventory-distribution', authenticateToken, async (req, res) => {
  try {
    console.log('[仪表盘] 获取库存分布...');

    // 按物料类型分组统计
    const [inventoryData] = await sequelize.query(
      `SELECT mc.category_name as type,
              COALESCE(SUM(i.quantity), 0) as quantity
       FROM inventory i
       INNER JOIN materials m ON i.material_id = m.id
       INNER JOIN material_categories mc ON m.category_id = mc.id
       WHERE i.deleted_at IS NULL
       GROUP BY mc.category_name
       ORDER BY quantity DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );

    // 如果没有分类，按状态分组
    if (inventoryData.length === 0) {
      const [statusData] = await sequelize.query(
        `SELECT status as type,
                COALESCE(SUM(quantity), 0) as quantity
         FROM inventory
         WHERE deleted_at IS NULL
         GROUP BY status
         ORDER BY quantity DESC`,
        { type: sequelize.QueryTypes.SELECT }
      );

      return res.json({
        success: true,
        data: statusData
      });
    }

    res.json({
      success: true,
      data: inventoryData
    });

  } catch (error) {
    console.error('[库存分布错误]:', error);
    res.status(500).json({
      success: false,
      message: '获取库存分布失败: ' + error.message
    });
  }
});

/**
 * GET /api/dashboard/quality-stats
 * 获取质量统计数据
 */
router.get('/quality-stats', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, days = 7 } = req.query;

    console.log(`[仪表盘] 获取质量统计: ${startDate} - ${endDate}`);

    // 计算日期范围
    let dateRange = '';
    if (startDate && endDate) {
      dateRange = `AND DATE(created_at) BETWEEN '${startDate}' AND '${endDate}'`;
    } else {
      dateRange = `AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)`;
    }

    // 查询质量检验结果分布
    const [qualityData] = await sequelize.query(
      `SELECT CASE
                WHEN status = 'passed' THEN '合格'
                WHEN status = 'failed' THEN '报废'
                WHEN status = 'rework' THEN '返工'
                ELSE status
              END as status,
              COUNT(*) as count
       FROM quality_inspections
       WHERE 1=1 ${dateRange}
       GROUP BY status
       ORDER BY count DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.json({
      success: true,
      data: qualityData
    });

  } catch (error) {
    console.error('[质量统计错误]:', error);
    res.status(500).json({
      success: false,
      message: '获取质量统计失败: ' + error.message
    });
  }
});

/**
 * GET /api/dashboard/equipment-utilization
 * 获取设备利用率
 */
router.get('/equipment-utilization', authenticateToken, async (req, res) => {
  try {
    console.log('[仪表盘] 获取设备利用率...');

    // 查询各生产线利用率
    const [utilizationData] = await sequelize.query(
      `SELECT pl.line_name as name,
              COALESCE(
                CASE
                  WHEN e.status = 'running' THEN 90
                  WHEN e.status = 'idle' THEN 70
                  WHEN e.status = 'maintenance' THEN 0
                  ELSE 50
                END,
                0
              ) as value
       FROM production_lines pl
       LEFT JOIN equipment e ON pl.id = e.production_line_id
       WHERE pl.deleted_at IS NULL
       GROUP BY pl.id, pl.line_name, e.status
       ORDER BY pl.id
       LIMIT 10`,
      { type: sequelize.QueryTypes.SELECT }
    );

    // 如果没有数据，返回示例数据
    const data = utilizationData.length > 0 ? utilizationData : [
      { name: '生产线A', value: 85 },
      { name: '生产线B', value: 78 },
      { name: '生产线C', value: 92 },
      { name: '生产线D', value: 88 }
    ];

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('[设备利用率错误]:', error);
    res.status(500).json({
      success: false,
      message: '获取设备利用率失败: ' + error.message
    });
  }
});

/**
 * GET /api/dashboard/export
 * 导出仪表盘数据
 */
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    console.log(`[仪表盘] 导出数据: ${startDate} - ${endDate}`);

    // 获取所有仪表盘数据
    const [stats] = await sequelize.query(
      `SELECT DATE(production_date) as date,
              COALESCE(SUM(produced_quantity), 0) as production,
              (SELECT COALESCE(SUM(quantity), 0)
               FROM inventory
               WHERE DATE(created_at) = DATE(production_records.production_date)
              ) as inventory
       FROM production_records
       WHERE DATE(production_date) BETWEEN :startDate AND :endDate
       GROUP BY DATE(production_date)
       ORDER BY date ASC`,
      {
        replacements: { startDate, endDate },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (stats.length === 0) {
      return res.status(404).json({
        success: false,
        message: '没有数据可导出'
      });
    }

    // 使用已有的 xlsx 库（已在 import-export.js 中使用）
    const xlsx = require('xlsx');
    const worksheet = xlsx.utils.json_to_sheet(stats);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Dashboard Data');

    const fileName = `dashboard_export_${Date.now()}.xlsx`;
    const filePath = `/tmp/mes-uploads/${fileName}`;
    xlsx.writeFile(workbook, filePath);

    console.log(`[仪表盘] 导出文件已生成: ${filePath}`);

    // 发送文件
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('[仪表盘导出错误]:', err);
      }
      // 延迟删除临时文件
      setTimeout(() => {
        const fs = require('fs');
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          // 文件可能已被删除
        }
      }, 5000);
    });

  } catch (error) {
    console.error('[仪表盘导出错误]:', error);
    res.status(500).json({
      success: false,
      message: '导出失败: ' + error.message
    });
  }
});

module.exports = router;

// ============================================
// 系统监控数据 API (MonitoringDashboard 专用)
// ============================================

/**
 * GET /api/dashboard/overview
 * 获取系统监控概览数据
 */
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    console.log('[系统监控] 获取概览数据...');

    // 获取 MySQL 连接状态
    let dbStatus = 'ok';
    let cacheStatus = true;
    
    try {
      await sequelize.query('SELECT 1', { type: sequelize.QueryTypes.SELECT });
    } catch (e) {
      dbStatus = 'error';
      console.error('[系统监控] 数据库连接错误:', e.message);
    }

    // 获取缓存统计 (从 Redis 如果可用)
    let cacheStats = { hitRate: '85%', memoryCacheSize: 0, hits: 0, misses: 0 };
    try {
      if (req.app.get('redis')) {
        const redis = req.app.get('redis');
        const info = await redis.info('stats');
        const lines = info.split('\r\n');
        let keyspace_hits = 0, keyspace_misses = 0;
        lines.forEach(line => {
          if (line.startsWith('keyspace_hits:')) keyspace_hits = parseInt(line.split(':')[1]);
          if (line.startsWith('keyspace_misses:')) keyspace_misses = parseInt(line.split(':')[1]);
        });
        const total = keyspace_hits + keyspace_misses;
        const hitRate = total > 0 ? ((keyspace_hits / total) * 100).toFixed(1) : 0;
        cacheStats = {
          hitRate: hitRate + '%',
          memoryCacheSize: await redis.dbsize(),
          hits: keyspace_hits,
          misses: keyspace_misses
        };
      }
    } catch (e) {
      cacheStatus = false;
      console.log('[系统监控] 缓存未启用或连接失败');
    }

    // 获取请求统计 (从内存中的计数器)
    const stats = req.app.get('requestStats') || {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      qps: { current: 0, peak: 0 },
      startTime: Date.now()
    };

    // 计算平均响应时间
    const avgResponseTime = stats.responseTimes.length > 0
      ? Math.round(stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length)
      : 0;

    // 计算成功率
    const successRate = stats.totalRequests > 0
      ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2)
      : '100.00';

    // 错误率
    const errorRate = stats.totalRequests > 0
      ? ((stats.failedRequests / stats.totalRequests) * 100).toFixed(2)
      : '0.00';

    // 计算 QPS (过去 1 分钟)
    const uptimeMs = Date.now() - stats.startTime;
    const uptimeSeconds = uptimeMs / 1000;
    const currentQps = uptimeSeconds > 0 ? (stats.totalRequests / uptimeSeconds).toFixed(2) : 0;

    // 响应时间统计
    const responseTimeStats = stats.responseTimes.length > 0 ? {
      min: Math.min(...stats.responseTimes),
      max: Math.max(...stats.responseTimes),
      avg: avgResponseTime
    } : { min: 0, max: 0, avg: 0 };

    const response = {
      summary: {
        qps: {
          current: parseFloat(currentQps),
          peak: stats.qps.peak
        },
        avgResponseTime: avgResponseTime,
        errorRate: errorRate,
        cacheHitRate: cacheStats.hitRate
      },
      performance: {
        totalRequests: stats.totalRequests,
        successfulRequests: stats.successfulRequests,
        failedRequests: stats.failedRequests,
        responseTime: responseTimeStats,
        successRate: successRate + '%'
      },
      cache: {
        hitRate: cacheStats.hitRate,
        memoryCacheSize: cacheStats.memoryCacheSize,
        hits: cacheStats.hits,
        misses: cacheStats.misses
      },
      system: {
        checks: {
          api: 'ok',
          database: dbStatus,
          cache: cacheStatus
        }
      }
    };

    console.log('[系统监控] 数据获取成功');
    res.json(response);

  } catch (error) {
    console.error('[系统监控] 获取数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取系统监控数据失败: ' + error.message
    });
  }
});
