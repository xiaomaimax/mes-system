const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Equipment = sequelize.define('Equipment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  equipment_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  equipment_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  equipment_type: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  production_line_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('running', 'idle', 'maintenance', 'fault', 'offline'),
    defaultValue: 'idle'
  },
  location: {
    type: DataTypes.STRING(100)
  },
  manufacturer: {
    type: DataTypes.STRING(100)
  },
  model: {
    type: DataTypes.STRING(100)
  },
  purchase_date: {
    type: DataTypes.DATE
  },
  warranty_end_date: {
    type: DataTypes.DATE
  },
  last_maintenance_date: {
    type: DataTypes.DATE
  },
  next_maintenance_date: {
    type: DataTypes.DATE
  },
  specifications: {
    type: DataTypes.JSON
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'equipment'
});

module.exports = Equipment;