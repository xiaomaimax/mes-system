/**
 * Andon 呼叫系统服务
 */
const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');
const { AndonCall, ProductionLine, User } = require('../models');
const logger = require('../utils/logger');

class AndonService {
  /**
   * 创建 Andon 呼叫
   */
  async createCall(data) {
    const callCode = 'ANDON-' + Date.now();
    
    const call = await AndonCall.create({
      ...data,
      call_code: callCode,
      status: 'pending'
    });
    
    return call;
  }

  /**
   * 获取活跃呼叫（未解决的）
   */
  async getActiveCalls(productionLineId = null) {
    const where = {
      status: {
        [Op.in]: ['pending', 'acknowledged', 'in_progress']
      }
    };
    
    if (productionLineId) {
      where.production_line_id = productionLineId;
    }
    
    const calls = await AndonCall.findAll({
      where,
      include: [
        { model: ProductionLine, as: 'productionLine', attributes: ['id', 'line_code', 'line_name'] }
      ],
      order: [['created_at', 'DESC']]
    });
    
    return calls;
  }

  /**
   * 确认呼叫
   */
  async acknowledgeCall(callId, userId) {
    const call = await AndonCall.findByPk(callId);
    if (!call) throw new Error('呼叫不存在');
    
    call.status = 'acknowledged';
    call.assigned_to_id = userId;
    call.acknowledged_at = new Date();
    call.response_time_seconds = Math.floor((call.acknowledged_at - call.created_at) / 1000);
    await call.save();
    
    return call;
  }

  /**
   * 开始处理
   */
  async startProcessing(callId, userId) {
    const call = await AndonCall.findByPk(callId);
    if (!call) throw new Error('呼叫不存在');
    
    call.status = 'in_progress';
    call.assigned_to_id = userId;
    await call.save();
    
    return call;
  }

  /**
   * 解决呼叫
   */
  async resolveCall(callId, userId, notes = '') {
    const call = await AndonCall.findByPk(callId);
    if (!call) throw new Error('呼叫不存在');
    
    call.status = 'resolved';
    call.assigned_to_id = userId;
    call.resolved_at = new Date();
    call.resolution_time_seconds = Math.floor((call.resolved_at - call.created_at) / 1000);
    if (notes) call.notes = notes;
    await call.save();
    
    return call;
  }

  /**
   * 获取呼叫列表（分页）
   */
  async getCalls(params = {}) {
    const { page = 1, limit = 20, status, call_type, priority, production_line_id, startDate, endDate } = params;
    
    const where = {};
    
    if (status) where.status = status;
    if (call_type) where.call_type = call_type;
    if (priority) where.priority = priority;
    if (production_line_id) where.production_line_id = production_line_id;
    
    if (startDate && endDate) {
      where.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }
    
    const { count, rows } = await AndonCall.findAndCountAll({
      where,
      include: [
        { model: ProductionLine, as: 'productionLine', attributes: ['id', 'line_code', 'line_name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });
    
    return { items: rows, total: count, page: parseInt(page), limit: parseInt(limit) };
  }

  /**
   * 获取统计数据
   */
  async getStatistics(productionLineId = null, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const where = {
      created_at: { [Op.gte]: startDate }
    };
    
    if (productionLineId) {
      where.production_line_id = productionLineId;
    }
    
    const calls = await AndonCall.findAll({ where });
    
    const total = calls.length;
    const resolved = calls.filter(c => c.status === 'resolved');
    const pending = calls.filter(c => ['pending', 'acknowledged', 'in_progress'].includes(c.status));
    
    const avgResponseTime = resolved.length > 0
      ? Math.floor(resolved.reduce((sum, c) => sum + (c.response_time_seconds || 0), 0) / resolved.length)
      : 0;
    
    const avgResolutionTime = resolved.length > 0
      ? Math.floor(resolved.reduce((sum, c) => sum + (c.resolution_time_seconds || 0), 0) / resolved.length)
      : 0;
    
    // 按类型统计
    const byType = {};
    calls.forEach(c => {
      if (!byType[c.call_type]) byType[c.call_type] = 0;
      byType[c.call_type]++;
    });
    
    // 按状态统计
    const byStatus = {};
    calls.forEach(c => {
      if (!byStatus[c.status]) byStatus[c.status] = 0;
      byStatus[c.status]++;
    });
    
    return {
      period: { startDate, endDate: new Date(), days },
      total,
      resolved: resolved.length,
      pending: pending.length,
      avgResponseTimeSeconds: avgResponseTime,
      avgResolutionTimeSeconds: avgResolutionTime,
      byType,
      byStatus
    };
  }

  /**
   * 获取生产线列表
   */
  async getProductionLines() {
    return ProductionLine.findAll({
      where: { is_active: true },
      order: [['line_code', 'ASC']]
    });
  }
}

module.exports = new AndonService();
