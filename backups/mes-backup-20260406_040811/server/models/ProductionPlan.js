const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Material = require('./Material');

const ProductionPlan = sequelize.define('ProductionPlan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  plan_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  material_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Material,
      key: 'id'
    }
  },
  planned_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('unscheduled', 'scheduled', 'cancelled'),
    defaultValue: 'unscheduled'
  },
  // 新增字段：工艺路线ID（关联工艺管理的工艺路线）
  process_routing_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // 新增字段：工艺路线号（冗余存储，便于查询）
  process_route_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  // 新增字段：生产订单ID（关联ERP的采购订单）
  production_order_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // 新增字段：订单编号（冗余存储，便于查询）
  order_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  // 新增字段：客户（冗余存储，便于查询）
  customer: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'production_plans',
  timestamps: true,
  underscored: true
});

ProductionPlan.belongsTo(Material, { foreignKey: 'material_id' });

module.exports = ProductionPlan;
