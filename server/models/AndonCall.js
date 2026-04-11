const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AndonCall = sequelize.define('AndonCall', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    call_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    call_type: {
      type: DataTypes.ENUM('equipment', 'quality', 'material', 'safety', 'other'),
      allowNull: false,
      comment: '设备故障/质量异常/物料短缺/安全问题/其他'
    },
    priority: {
      type: DataTypes.ENUM('normal', 'urgent', 'critical'),
      defaultValue: 'normal',
      comment: '一般/紧急/停线'
    },
    production_line_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    station: {
      type: DataTypes.STRING(100),
      comment: '工位'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '描述'
    },
    status: {
      type: DataTypes.ENUM('pending', 'acknowledged', 'in_progress', 'resolved'),
      defaultValue: 'pending',
      comment: '待确认/已确认/处理中/已解决'
    },
    caller_id: {
      type: DataTypes.INTEGER,
      comment: '呼叫人'
    },
    assigned_to_id: {
      type: DataTypes.INTEGER,
      comment: '处理人'
    },
    acknowledged_at: {
      type: DataTypes.DATE,
      comment: '确认时间'
    },
    resolved_at: {
      type: DataTypes.DATE,
      comment: '解决时间'
    },
    response_time_seconds: {
      type: DataTypes.INTEGER,
      comment: '响应时间（秒）'
    },
    resolution_time_seconds: {
      type: DataTypes.INTEGER,
      comment: '解决时间（秒）'
    },
    notes: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  }, {
    tableName: 'andon_calls',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return AndonCall;
};
