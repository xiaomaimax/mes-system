/**
 * 报表服务 - 异步报表生成（P2-4 报表优化）
 */
const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');
const logger = require('../utils/logger');

class ReportService {
  async generateProductionReport(startDate, endDate, options = {}) {
    const { groupBy = 'day' } = options;
    
    const orderStats = await sequelize.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders
      FROM production_orders
      WHERE created_at BETWEEN :startDate AND :endDate
      GROUP BY DATE(created_at)
      ORDER BY date
    `, {
      replacements: { startDate, endDate },
      type: QueryTypes.SELECT
    });
    
    return {
      startDate,
      endDate,
      orderStats,
      summary: {
        totalOrders: orderStats.reduce((sum, r) => sum + r.total_orders, 0)
      }
    };
  }
  
  async generateQualityReport(startDate, endDate) {
    const inspectionStats = await sequelize.query(`
      SELECT inspection_type, COUNT(*) as total
      FROM (
        SELECT 'IQC' as inspection_type FROM iqc_inspections WHERE inspection_date BETWEEN :startDate AND :endDate
        UNION ALL
        SELECT 'PQC' FROM pqc_inspections WHERE inspection_date BETWEEN :startDate AND :endDate
      ) as all_inspections
      GROUP BY inspection_type
    `, {
      replacements: { startDate, endDate },
      type: QueryTypes.SELECT
    });
    
    return { startDate, endDate, inspectionStats };
  }
}

module.exports = new ReportService();
