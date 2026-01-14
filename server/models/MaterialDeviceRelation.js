const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Material = require('./Material');
const Device = require('./Device');

const MaterialDeviceRelation = sequelize.define('MaterialDeviceRelation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  material_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Material,
      key: 'id'
    }
  },
  device_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Device,
      key: 'id'
    }
  },
  weight: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  }
}, {
  tableName: 'material_device_relations',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['material_id', 'device_id']
    }
  ]
});

MaterialDeviceRelation.belongsTo(Material, { foreignKey: 'material_id' });
MaterialDeviceRelation.belongsTo(Device, { foreignKey: 'device_id' });

module.exports = MaterialDeviceRelation;
