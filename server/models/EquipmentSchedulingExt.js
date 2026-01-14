const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * 设备排程扩展表 (equipment_scheduling_ext)
 * 存储排程模块特有的设备属性，与设备主表关联
 * Requirements: 1.5 - 排程模块扩展设备数据以包含排程特有属性
 */
const EquipmentSchedulingExt = sequelize.define('EquipmentSchedulingExt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  equipment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'equipment',
      key: 'id'
    },
    comment: '关联设备主表ID'
  },
  capacity_per_hour: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: '每小时产能'
  },
  scheduling_weight: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 50,
    validate: {
      min: 1,
      max: 100
    },
    comment: '排程权重 (1-100)'
  },
  is_available_for_scheduling: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '是否可用于排程'
  }
}, {
  tableName: 'equipment_scheduling_ext',
  timestamps: true,
  underscored: true,
  comment: '设备排程扩展表'
});

module.exports = EquipmentSchedulingExt;
