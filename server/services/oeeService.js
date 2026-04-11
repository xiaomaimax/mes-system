/**
 * OEE (Overall Equipment Effectiveness) 服务
 * OEE = Availability x Performance x Quality
 */
const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

class OEEService {
  async calculateEquipmentOEE(equipmentId, startDate, endDate) {
    const availabilityResult = await sequelize.query(`
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) as running_count,
        SUM(CASE WHEN status = 'fault' THEN 1 ELSE 0 END) as fault_count,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_count,
        SUM(CASE WHEN status = 'idle' THEN 1 ELSE 0 END) as idle_count
      FROM equipment e
      WHERE e.id = :equipmentId
    `, {
      replacements: { equipmentId },
      type: QueryTypes.SELECT
    });

    const availability = availabilityResult[0];
    const totalStates = availability.total_records || 1;
    const runningTime = availability.running_count || 0;
    const downtime = (availability.fault_count || 0) + (availability.maintenance_count || 0) + (availability.idle_count || 0);
    const availRate = totalStates > 0 ? (runningTime / totalStates) * 100 : 100;

    const perfResult = await sequelize.query(`
      SELECT 
        COALESCE(SUM(po.produced_quantity), 0) as actual_output,
        COALESCE(SUM(esa.capacity_per_hour * 8), 0) as theoretical_output
      FROM production_orders po
      LEFT JOIN equipment e ON po.production_line_id = e.production_line_id
      LEFT JOIN equipment_scheduling_ext esa ON e.id = esa.equipment_id
      WHERE e.id = :equipmentId
        AND po.created_at BETWEEN :startDate AND :endDate
    `, {
      replacements: { equipmentId, startDate, endDate },
      type: QueryTypes.SELECT
    });

    const perfData = perfResult[0];
    const actualOutput = parseInt(perfData.actual_output) || 0;
    const theoreticalOutput = parseInt(perfData.theoretical_output) || 1;
    const perfRate = theoreticalOutput > 0 ? Math.min((actualOutput / theoreticalOutput) * 100, 100) : 100;

    const qualityResult = await sequelize.query(`
      SELECT 
        COALESCE(SUM(qi.qualified_quantity), 0) as qualified,
        COALESCE(SUM(qi.inspected_quantity), 0) as inspected
      FROM quality_inspections qi
      JOIN production_orders po ON qi.production_order_id = po.id
      JOIN equipment e ON po.production_line_id = e.production_line_id
      WHERE e.id = :equipmentId
        AND qi.inspection_date BETWEEN :startDate AND :endDate
    `, {
      replacements: { equipmentId, startDate, endDate },
      type: QueryTypes.SELECT
    });

    const qualityData = qualityResult[0];
    const qualified = parseInt(qualityData.qualified) || 0;
    const inspected = parseInt(qualityData.inspected) || 1;
    const qualityRate = inspected > 0 ? (qualified / inspected) * 100 : 100;

    const oee = (availRate * perfRate * qualityRate) / 10000;

    return {
      equipmentId,
      availability: Math.round(availRate * 100) / 100,
      performance: Math.round(perfRate * 100) / 100,
      quality: Math.round(qualityRate * 100) / 100,
      oee: Math.round(oee * 100) / 100,
      actualOutput,
      theoreticalOutput,
      qualified,
      inspected,
      runningTime,
      downtime,
      period: { startDate, endDate }
    };
  }

  async getAllEquipmentOEE(startDate, endDate) {
    const result = await sequelize.query(`
      SELECT 
        e.id,
        e.equipment_code,
        e.equipment_name,
        e.status,
        e.equipment_type,
        esa.capacity_per_hour
      FROM equipment e
      LEFT JOIN equipment_scheduling_ext esa ON e.id = esa.equipment_id
      WHERE e.is_active = 1
      ORDER BY e.equipment_code
    `, {
      type: QueryTypes.SELECT
    });

    const oeePromises = result.map(eq => 
      this.calculateEquipmentOEE(eq.id, startDate, endDate)
    );
    
    const oeeResults = await Promise.all(oeePromises);
    
    return {
      equipment: oeeResults,
      summary: this.calculateSummary(oeeResults),
      period: { startDate, endDate }
    };
  }

  calculateSummary(results) {
    if (!results || results.length === 0) {
      return { avgOEE: 0, avgAvailability: 0, avgPerformance: 0, avgQuality: 0 };
    }

    const sum = results.reduce((acc, curr) => ({
      oee: acc.oee + curr.oee,
      availability: acc.availability + curr.availability,
      performance: acc.performance + curr.performance,
      quality: acc.quality + curr.quality
    }), { oee: 0, availability: 0, performance: 0, quality: 0 });

    const count = results.length;
    return {
      avgOEE: Math.round(sum.oee / count * 100) / 100,
      avgAvailability: Math.round(sum.availability / count * 100) / 100,
      avgPerformance: Math.round(sum.performance / count * 100) / 100,
      avgQuality: Math.round(sum.quality / count * 100) / 100,
      equipmentCount: count,
      worldClassOEE: 85
    };
  }

  async getOEELineTrend(startDate, endDate, groupBy = 'day') {
    let dateFormat = '%Y-%m-%d';
    if (groupBy === 'week') dateFormat = '%Y-W%u';
    else if (groupBy === 'month') dateFormat = '%Y-%m';

    const result = await sequelize.query(`
      SELECT 
        DATE_FORMAT(po.created_at, '${dateFormat}') as period,
        COUNT(DISTINCT e.id) as equipment_count,
        SUM(po.produced_quantity) as total_output,
        SUM(po.qualified_quantity) as qualified_output
      FROM production_orders po
      JOIN equipment e ON po.production_line_id = e.production_line_id
      WHERE po.created_at BETWEEN :startDate AND :endDate
        AND po.status = 'completed'
      GROUP BY period
      ORDER BY period
    `, {
      replacements: { startDate, endDate },
      type: QueryTypes.SELECT
    });

    return result.map(row => ({
      period: row.period,
      output: row.total_output || 0,
      qualified: row.qualified_output || 0,
      qualityRate: row.total_output > 0 
        ? Math.round((row.qualified_output / row.total_output) * 10000) / 100 
        : 100
    }));
  }
}

module.exports = new OEEService();
