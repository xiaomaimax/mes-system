const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DefectRecord = sequelize.define('DefectRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  defect_code: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  defect_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  defect_category: {
    type: DataTypes.STRING(50)
  },
  severity: {
    type: DataTypes.ENUM('minor', 'major', 'critical'),
    defaultValue: 'minor'
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'defect_records',
  timestamps: true,
  underscored: true
});

module.exports = DefectRecord;
