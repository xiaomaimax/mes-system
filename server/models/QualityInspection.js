const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QualityInspection = sequelize.define('QualityInspection', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  production_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  inspection_type: {
    type: DataTypes.ENUM('incoming', 'in_process', 'final'),
    allowNull: false
  },
  inspected_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  qualified_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  defective_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quality_rate: {
    type: DataTypes.DECIMAL(5, 2)
  },
  inspector_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  inspection_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  defect_types: {
    type: DataTypes.JSON
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'quality_inspections',
  timestamps: true,
  underscored: true
});

module.exports = QualityInspection;
