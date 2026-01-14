const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductionLine = sequelize.define('ProductionLine', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  line_code: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  line_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  capacity_per_hour: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'production_lines',
  timestamps: true,
  underscored: true
});

module.exports = ProductionLine;
