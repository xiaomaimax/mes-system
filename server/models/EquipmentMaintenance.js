const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EquipmentMaintenance = sequelize.define('EquipmentMaintenance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  device_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  maintenance_type: {
    type: DataTypes.ENUM('preventive', 'corrective', 'inspection'),
    allowNull: false
  },
  maintenance_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  completion_date: {
    type: DataTypes.DATE
  },
  description: {
    type: DataTypes.TEXT
  },
  technician_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'equipment_maintenance',
  timestamps: true,
  underscored: true
});

module.exports = EquipmentMaintenance;
