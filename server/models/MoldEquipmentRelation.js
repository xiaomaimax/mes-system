const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * 模具-设备关联表 (mold_equipment_relations)
 * 记录模具与设备的多对多关系
 * Requirements: 2.4 - 模具与设备建立关联时记录绑定关系
 */
const MoldEquipmentRelation = sequelize.define('MoldEquipmentRelation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  mold_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'molds',
      key: 'id'
    },
    comment: '关联模具ID'
  },
  equipment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'equipment',
      key: 'id'
    },
    comment: '关联设备ID'
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否为主要设备'
  }
}, {
  tableName: 'mold_equipment_relations',
  timestamps: true,
  underscored: true,
  comment: '模具-设备关联表',
  indexes: [
    {
      unique: true,
      fields: ['mold_id', 'equipment_id'],
      name: 'unique_mold_equipment'
    }
  ]
});

module.exports = MoldEquipmentRelation;
