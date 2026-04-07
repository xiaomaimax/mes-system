const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Device = sequelize.define('Device', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  device_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  device_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  specifications: {
    type: DataTypes.STRING(200)
  },
  status: {
    type: DataTypes.ENUM('normal', 'maintenance', 'idle', 'scrapped'),
    defaultValue: 'normal'
  },
  capacity_per_hour: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'devices',
  timestamps: true,
  underscored: true
});

module.exports = Device;
