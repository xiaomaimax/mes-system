const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * 模具排程扩展表 (mold_scheduling_ext)
 * 存储排程模块特有的模具属性，与模具表关联
 * Requirements: 2.3 - 模具包含排程相关属性
 */
const MoldSchedulingExt = sequelize.define('MoldSchedulingExt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  mold_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'molds',
      key: 'id'
    },
    comment: '关联模具ID'
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
  }
}, {
  tableName: 'mold_scheduling_ext',
  timestamps: true,
  underscored: true,
  comment: '模具排程扩展表'
});

module.exports = MoldSchedulingExt;
