const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductionOrder = sequelize.define('ProductionOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  product_code: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  product_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  planned_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  produced_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  qualified_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  defective_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal'
  },
  production_line_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  planned_start_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  planned_end_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  actual_start_time: {
    type: DataTypes.DATE
  },
  actual_end_time: {
    type: DataTypes.DATE
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'production_orders'
});

module.exports = ProductionOrder;