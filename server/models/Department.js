const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  dept_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'dept_code'
  },
  dept_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'dept_name'
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'parent_id'
  },
  manager_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'manager_id'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order'
  }
}, {
  tableName: 'departments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 关联已在 index.js 中定义
Department.associate = (models) => {};

// 静态方法：获取部门树
Department.getTree = async function() {
  const departments = await this.findAll({
    where: { is_active: true, parent_id: null },
    include: [{
      model: Department,
      as: 'children',
      where: { is_active: true },
      required: false
    }]
  });
  
  return departments;
};

// 静态方法：获取部门及所有子部门 ID
Department.getSubDepartmentIds = async function(deptId) {
  const dept = await this.findByPk(deptId, {
    include: [{
      model: Department,
      as: 'children',
      where: { is_active: true },
      required: false
    }]
  });
  
  if (!dept) return [deptId];
  
  const ids = [deptId];
  const children = dept.children || [];
  
  for (const child of children) {
    const subIds = await this.getSubDepartmentIds(child.id);
    ids.push(...subIds);
  }
  
  return ids;
};

module.exports = Department;
