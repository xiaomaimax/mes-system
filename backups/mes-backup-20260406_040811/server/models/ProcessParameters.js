const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProcessParameters = sequelize.define('ProcessParameters', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  routing_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  parameter_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  parameter_value: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING(50)
  },
  min_value: {
    type: DataTypes.DECIMAL(10, 2)
  },
  max_value: {
    type: DataTypes.DECIMAL(10, 2)
  }
}, {
  tableName: 'process_parameters',
  timestamps: true,
  underscored: true
});

module.exports = ProcessParameters;
