const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShiftSchedule = sequelize.define('ShiftSchedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  shift_code: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  shift_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'shift_schedule',
  timestamps: true,
  underscored: true
});

module.exports = ShiftSchedule;
