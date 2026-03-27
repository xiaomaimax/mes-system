const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'username'
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '操作类型'
  },
  resource_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'resource_type',
    comment: '资源类型'
  },
  resource_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'resource_id',
    comment: '资源 ID'
  },
  ip_address: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'ip_address',
    comment: 'IP 地址'
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'user_agent',
    comment: '用户代理'
  },
  request_data: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'request_data',
    comment: '请求数据'
  },
  response_status: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'response_status',
    comment: '响应状态'
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'error_message',
    comment: '错误信息'
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['action'] },
    { fields: ['resource_type'] },
    { fields: ['created_at'] }
  ]
});

// 关联：审计日志 - 用户
AuditLog.associate = (models) => {
  AuditLog.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: "creator"
  });
};

// 静态方法：记录审计日志
AuditLog.log = async function(data) {
  return await this.create({
    user_id: data.userId,
    username: data.username,
    action: data.action,
    resource_type: data.resourceType,
    resource_id: data.resourceId,
    ip_address: data.ipAddress,
    user_agent: data.userAgent,
    request_data: data.requestData,
    response_status: data.responseStatus,
    error_message: data.errorMessage
  });
};

// 静态方法：查询审计日志
AuditLog.query = async function(options) {
  const {
    userId,
    action,
    resourceType,
    startDate,
    endDate,
    page = 1,
    pageSize = 20
  } = options;
  
  const where = {};
  
  if (userId) where.user_id = userId;
  if (action) where.action = action;
  if (resourceType) where.resource_type = resourceType;
  if (startDate && endDate) {
    where.created_at = {
      [sequelize.Op.between]: [startDate, endDate]
    };
  }
  
  return await this.findAndCountAll({
    where,
    include: [{
      model: sequelize.models.User,
      as: "creator",
      attributes: ['id', 'username', 'full_name', 'department']
    }],
    order: [['created_at', 'DESC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
    attributes: {
      exclude: ['request_data'] // 默认不返回大数据量的请求数据
    }
  });
};

// 静态方法：导出审计日志
AuditLog.export = async function(options) {
  const { startDate, endDate, action } = options;
  
  const where = {};
  if (startDate && endDate) {
    where.created_at = {
      [sequelize.Op.between]: [startDate, endDate]
    };
  }
  if (action) where.action = action;
  
  return await this.findAll({
    where,
    include: [{
      model: sequelize.models.User,
      as: "creator",
      attributes: ['username', 'full_name', 'department']
    }],
    order: [['created_at', 'DESC']],
    limit: 10000 // 最多导出 1 万条
  });
};

module.exports = AuditLog;
