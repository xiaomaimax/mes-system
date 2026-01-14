const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProcessRouting = sequelize.define('ProcessRouting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  routing_code: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  material_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  process_sequence: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  process_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  equipment_id: {
    type: DataTypes.INTEGER
  },
  mold_id: {
    type: DataTypes.INTEGER
  },
  estimated_time: {
    type: DataTypes.INTEGER
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'process_routing',
  timestamps: true,
  underscored: true
});

module.exports = ProcessRouting;
