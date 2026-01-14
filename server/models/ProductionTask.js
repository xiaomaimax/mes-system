const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ProductionPlan = require('./ProductionPlan');
const Device = require('./Device');
const Mold = require('./Mold');

const ProductionTask = sequelize.define('ProductionTask', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  task_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  plan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ProductionPlan,
      key: 'id'
    }
  },
  device_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Device,
      key: 'id'
    }
  },
  mold_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Mold,
      key: 'id'
    }
  },
  task_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  is_overdue: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  planned_start_time: {
    type: DataTypes.DATE
  },
  planned_end_time: {
    type: DataTypes.DATE
  },
  erp_task_number: {
    type: DataTypes.STRING(50)
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  scheduling_reason: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '排程原因：说明应用了哪条核心逻辑规则'
  }
}, {
  tableName: 'production_tasks',
  timestamps: true,
  underscored: true
});

ProductionTask.belongsTo(ProductionPlan, { foreignKey: 'plan_id' });
ProductionTask.belongsTo(Device, { foreignKey: 'device_id' });
ProductionTask.belongsTo(Mold, { foreignKey: 'mold_id' });

module.exports = ProductionTask;
