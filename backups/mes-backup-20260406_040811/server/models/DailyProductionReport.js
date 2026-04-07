const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DailyProductionReport = sequelize.define('DailyProductionReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  report_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  production_line_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  shift_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  planned_quantity: {
    type: DataTypes.INTEGER
  },
  actual_quantity: {
    type: DataTypes.INTEGER
  },
  qualified_quantity: {
    type: DataTypes.INTEGER
  },
  defective_quantity: {
    type: DataTypes.INTEGER
  },
  downtime_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  downtime_reason: {
    type: DataTypes.TEXT
  },
  notes: {
    type: DataTypes.TEXT
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'daily_production_report',
  timestamps: true,
  underscored: true
});

module.exports = DailyProductionReport;
