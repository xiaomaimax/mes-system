const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  permission_code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'permission_code'
  },
  permission_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'permission_name'
  },
  module: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  action_type: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'action_type'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'permissions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// 关联已在 index.js 中定义
Permission.associate = (models) => {};

// 静态方法：按模块获取权限
Permission.getByModule = async function(module) {
  return await this.findAll({
    where: { module },
    order: [['action_type', 'ASC'], ['permission_code', 'ASC']]
  });
};

// 静态方法：获取所有权限树
Permission.getPermissionTree = async function() {
  const permissions = await this.findAll({
    order: [['module', 'ASC'], ['action_type', 'ASC']]
  });
  
  const tree = {};
  permissions.forEach(p => {
    if (!tree[p.module]) {
      tree[p.module] = [];
    }
    tree[p.module].push({
      code: p.permission_code,
      name: p.permission_name,
      action: p.action_type,
      description: p.description
    });
  });
  
  return tree;
};

module.exports = Permission;
