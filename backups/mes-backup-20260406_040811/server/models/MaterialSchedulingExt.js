const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * 物料排程扩展表 (material_scheduling_ext)
 * 存储排程模块特有的物料属性，与物料主表关联
 * Requirements: 3.5 - 排程模块扩展物料数据以包含排程特有属性
 */
const MaterialSchedulingExt = sequelize.define('MaterialSchedulingExt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  material_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'materials',
      key: 'id'
    },
    comment: '关联物料主表ID'
  },
  default_device_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'devices',
      key: 'id'
    },
    comment: '默认设备ID'
  },
  default_mold_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'molds',
      key: 'id'
    },
    comment: '默认模具ID'
  }
}, {
  tableName: 'material_scheduling_ext',
  timestamps: true,
  underscored: true,
  comment: '物料排程扩展表'
});

module.exports = MaterialSchedulingExt;
