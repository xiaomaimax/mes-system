const AuditLog = require('../models/AuditLog');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/**
 * 审计日志服务
 */
class AuditService {
  
  /**
   * 查询审计日志
   */
  static async queryLogs(options) {
    const {
      userId,
      action,
      resourceType,
      startDate,
      endDate,
      page = 1,
      pageSize = 20
    } = options;
    
    return await AuditLog.query({
      userId,
      action,
      resourceType,
      startDate,
      endDate,
      page,
      pageSize
    });
  }
  
  /**
   * 获取审计日志详情
   */
  static async getLogDetail(logId) {
    return await AuditLog.findByPk(logId, {
      include: [{
        model: require('../models/User'),
        as: 'user',
        attributes: ['id', 'username', 'full_name', 'department']
      }]
    });
  }
  
  /**
   * 导出审计日志
   */
  static async exportLogs(options) {
    const { startDate, endDate, action } = options;
    
    const where = {};
    if (startDate) where.created_at = { [require('sequelize').Op.gte]: startDate };
    if (endDate) where.created_at = { ...where.created_at, [require('sequelize').Op.lte]: endDate };
    if (action) where.action = action;
    
    const logs = await AuditLog.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: 10000
    });
    
    // 转换为 CSV 格式
    const csv = this.convertToCSV(logs);
    return csv;
  }
  
  /**
   * 转换为 CSV
   */
  static convertToCSV(logs) {
    const headers = [
      'ID',
      '时间',
      '用户 ID',
      '用户名',
      '操作',
      '资源类型',
      '资源 ID',
      'IP 地址',
      '状态',
      '错误信息'
    ];
    
    const rows = logs.map(log => {
      const data = log.toJSON();
      return [
        data.id,
        data.created_at,
        data.user_id,
        data.username,
        data.action,
        data.resource_type,
        data.resource_id || '',
        data.ip_address,
        data.response_status,
        data.error_message || ''
      ].map(field => `"${field || ''}"`).join(',');
    });
    
    return [headers.join(','), ...rows].join('\n');
  }
  
  /**
   * 获取审计统计
   */
  static async getStatistics(startDate, endDate) {
    const where = {};
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [startDate, endDate]
      };
    }
    
    // 按操作类型统计
    const actionStats = await AuditLog.findAll({
      where,
      attributes: [
        'action',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'count']
      ],
      group: ['action'],
      order: [[AuditLog.sequelize.literal('count'), 'DESC']],
      limit: 20
    });
    
    // 按用户统计
    const userStats = await AuditLog.findAll({
      where,
      attributes: [
        'username',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'count']
      ],
      group: ['username'],
      order: [[AuditLog.sequelize.literal('count'), 'DESC']],
      limit: 20
    });
    
    // 总数
    const total = await AuditLog.count({ where });
    
    // 错误数
    const errorCount = await AuditLog.count({
      where: {
        ...where,
        response_status: { [Op.ne]: 200 }
      }
    });
    
    return {
      total,
      errorCount,
      actionStats: actionStats.map(s => ({
        action: s.action,
        count: parseInt(s.dataValues.count)
      })),
      userStats: userStats.map(s => ({
        username: s.username,
        count: parseInt(s.dataValues.count)
      }))
    };
  }
  
  /**
   * 清理过期日志
   */
  static async cleanupLogs(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const result = await AuditLog.destroy({
      where: {
        created_at: {
          [Op.lt]: cutoffDate
        }
      }
    });
    
    logger.info(`已清理${result}条过期审计日志`);
    return result;
  }
  
  /**
   * 记录安全事件
   */
  static async logSecurityEvent(event) {
    return await AuditLog.log({
      userId: event.userId || 0,
      username: event.username || 'system',
      action: `SECURITY_${event.eventType}`,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      requestData: event.details,
      responseStatus: 200,
      errorMessage: null
    });
  }
}

module.exports = AuditService;
