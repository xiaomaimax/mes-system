const sequelize = require('../config/database');
const { QueryTypes, Op } = require('sequelize');
const logger = require('../utils/logger');

class TraceabilityService {
  async getBatchByNumber(batchNumber) {
    const batch = await sequelize.query(
      'SELECT * FROM batch_tracing WHERE batch_number = :batchNumber',
      { replacements: { batchNumber }, type: QueryTypes.SELECT }
    );
    if (!batch || batch.length === 0) throw new Error('批次不存在');

    const productionRecord = await sequelize.query(
      'SELECT pbr.*, pl.line_code, pl.line_name FROM production_batch_records pbr LEFT JOIN production_lines pl ON pbr.production_line_id = pl.id WHERE pbr.batch_number = :batchNumber',
      { replacements: { batchNumber }, type: QueryTypes.SELECT }
    );

    const materialUsage = await sequelize.query(
      'SELECT * FROM batch_material_usage WHERE production_batch_id = :batchId',
      { replacements: { batchId: productionRecord[0]?.id || 0 }, type: QueryTypes.SELECT }
    );

    const processRecords = await sequelize.query(
      'SELECT * FROM batch_process_records WHERE production_batch_id = :batchId ORDER BY process_sequence ASC',
      { replacements: { batchId: productionRecord[0]?.id || 0 }, type: QueryTypes.SELECT }
    );

    return { batch: batch[0], productionRecord: productionRecord[0], materialUsage, processRecords };
  }

  async forwardTrace(batchNumber) {
    const materialUsage = await sequelize.query(
      'SELECT bmu.*, pbr.batch_number as used_in_batch, pbr.product_name, pbr.production_date FROM batch_material_usage bmu JOIN production_batch_records pbr ON bmu.production_batch_id = pbr.id WHERE bmu.material_batch_number = :batchNumber',
      { replacements: { batchNumber }, type: QueryTypes.SELECT }
    );
    return { type: 'forward', sourceBatch: batchNumber, totalUsageCount: materialUsage.length, usageList: materialUsage };
  }

  async backwardTrace(batchNumber) {
    const productionRecord = await sequelize.query(
      'SELECT * FROM production_batch_records WHERE batch_number = :batchNumber',
      { replacements: { batchNumber }, type: QueryTypes.SELECT }
    );
    if (!productionRecord || productionRecord.length === 0) throw new Error('生产批次不存在');

    const materialUsage = await sequelize.query(
      'SELECT * FROM batch_material_usage WHERE production_batch_id = :batchId',
      { replacements: { batchId: productionRecord[0].id }, type: QueryTypes.SELECT }
    );
    return { type: 'backward', targetBatch: batchNumber, productName: productionRecord[0].product_name, productionDate: productionRecord[0].production_date, quantity: productionRecord[0].quantity, totalMaterials: materialUsage.length, materials: materialUsage };
  }

  async getProcessChain(batchNumber) {
    const productionRecord = await sequelize.query(
      'SELECT pbr.*, pl.line_code, pl.line_name FROM production_batch_records pbr LEFT JOIN production_lines pl ON pbr.production_line_id = pl.id WHERE pbr.batch_number = :batchNumber',
      { replacements: { batchNumber }, type: QueryTypes.SELECT }
    );
    if (!productionRecord || productionRecord.length === 0) throw new Error('生产批次不存在');

    const processRecords = await sequelize.query(
      'SELECT * FROM batch_process_records WHERE production_batch_id = :batchId ORDER BY process_sequence ASC',
      { replacements: { batchId: productionRecord[0].id }, type: QueryTypes.SELECT }
    );
    return { batchNumber, productName: productionRecord[0].product_name, productionLine: productionRecord[0].line_name, processes: processRecords };
  }

  async qualityIssueTrace(batchNumber, issueDescription) {
    const batchInfo = await this.getBatchByNumber(batchNumber);
    const sameLineBatches = await sequelize.query(
      'SELECT batch_number, product_name, production_date, quantity FROM production_batch_records WHERE production_line_id = :lineId AND production_date = :prodDate AND id != :batchId',
      { replacements: { lineId: batchInfo.productionRecord?.production_line_id || 0, prodDate: batchInfo.productionRecord?.production_date, batchId: batchInfo.productionRecord?.id || 0 }, type: QueryTypes.SELECT }
    );
    return { sourceBatch: batchNumber, issueDescription, affectedBatches: { sameProductionLine: sameLineBatches, sameMaterial: [] }, totalAffectedCount: sameLineBatches.length + 1, recallRecommendation: sameLineBatches.length > 0 ? [{ level: 'high', message: '建议召回同生产线 ' + sameLineBatches.length + ' 个批次', batches: sameLineBatches.map(b => b.batch_number) }] : [] };
  }

  async getBatches(params = {}) {
    const { page = 1, limit = 20, productName, batchNumber, status } = params;
    let whereClause = '1=1';
    const replacements = {};
    if (productName) { whereClause += ' AND product_name LIKE :productName'; replacements.productName = '%' + productName + '%'; }
    if (batchNumber) { whereClause += ' AND batch_number LIKE :batchNumber'; replacements.batchNumber = '%' + batchNumber + '%'; }
    if (status) { whereClause += ' AND overall_status = :status'; replacements.status = status; }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const countResult = await sequelize.query('SELECT COUNT(*) as total FROM batch_tracing WHERE ' + whereClause, { replacements, type: QueryTypes.SELECT });
    const items = await sequelize.query('SELECT * FROM batch_tracing WHERE ' + whereClause + ' ORDER BY created_at DESC LIMIT :limit OFFSET :offset', { replacements: { ...replacements, limit: parseInt(limit), offset }, type: QueryTypes.SELECT });
    return { items, total: countResult[0]?.total || 0, page: parseInt(page), limit: parseInt(limit) };
  }

  async getStatistics(days = 30) {
    const startDate = new Date(); startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    const summary = await sequelize.query('SELECT COUNT(*) as total, SUM(CASE WHEN overall_status = "qualified" THEN 1 ELSE 0 END) as qualified, SUM(CASE WHEN overall_status = "unqualified" THEN 1 ELSE 0 END) as unqualified FROM batch_tracing WHERE production_date >= :startDate', { replacements: { startDate: startDateStr }, type: QueryTypes.SELECT });
    const dailyStats = await sequelize.query('SELECT production_date as date, COUNT(*) as total, SUM(CASE WHEN overall_status = "qualified" THEN 1 ELSE 0 END) as qualified FROM batch_tracing WHERE production_date >= :startDate GROUP BY production_date ORDER BY production_date DESC', { replacements: { startDate: startDateStr }, type: QueryTypes.SELECT });
    const s = summary[0] || { total: 0, qualified: 0, unqualified: 0 };
    return { period: { startDate: startDateStr, endDate: new Date().toISOString().split('T')[0], days }, summary: { total: s.total || 0, qualified: s.qualified || 0, unqualified: s.unqualified || 0, qualificationRate: s.total > 0 ? Math.round((s.qualified || 0) / s.total * 100) : 0 }, dailyStats };
  }
}

module.exports = new TraceabilityService();
