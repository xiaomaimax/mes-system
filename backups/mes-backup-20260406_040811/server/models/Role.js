const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  role_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'role_name'
  },
  role_display_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'role_display_name'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_system: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_system'
  }
}, {
  tableName: 'roles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 关联：角色 - 权限（在 index.js 中定义，避免重复）
Role.associate = (models) => {
  // 关联已在 index.js 中定义
};

// 静态方法：获取角色权限
Role.getPermissions = async function(roleName) {
  const role = await this.findOne({
    where: { role_name: roleName },
    include: [{
      model: sequelize.models.Permission,
      as: 'permissions',
      attributes: ['permission_code']
    }]
  });
  
  if (!role) return [];
  return role.permissions.map(p => p.permission_code);
};

// 静态方法：获取角色菜单
Role.getMenus = async function(roleName) {
  const role = await this.findOne({
    where: { role_name: roleName },
    include: [{
      model: sequelize.models.MenuPermission,
      as: 'menus',
      where: { can_view: true },
      required: false
    }]
  });
  
  if (!role) return [];
  return role.menus || [];
};

module.exports = Role;
