const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DataPermission = sequelize.define('DataPermission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'role_id'
  },
  resource_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'resource_type',
    comment: '资源类型'
  },
  scope_type: {
    type: DataTypes.ENUM('ALL', 'DEPARTMENT', 'SELF', 'CUSTOM'),
    allowNull: false,
    field: 'scope_type',
    comment: '数据范围类型'
  },
  scope_value: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'scope_value',
    comment: '数据范围值（JSON 格式）'
  },
  can_view: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'can_view'
  },
  can_edit: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'can_edit'
  },
  can_delete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'can_delete'
  },
  can_export: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'can_export'
  }
}, {
  tableName: 'data_permissions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['role_id'] },
    { fields: ['resource_type'] },
    { unique: true, fields: ['role_id', 'resource_type'] }
  ]
});

// 关联：数据权限 - 角色
DataPermission.associate = (models) => {
  DataPermission.belongsTo(models.Role, {
    foreignKey: 'role_id',
    as: 'role'
  });
};

// 静态方法：获取用户数据权限
DataPermission.getUserDataScope = async function(userId, resourceType) {
  const UserRole = sequelize.models.UserRole;
  const User = sequelize.models.User;
  
  // 获取用户角色
  const user = await User.findByPk(userId, {
    include: [{
      model: sequelize.models.Role,
      as: 'roles',
      through: { attributes: [] }
    }]
  });
  
  if (!user) return { scope_type: 'SELF' };
  
  // 检查是否有 admin 角色
  const isAdmin = user.roles.some(r => r.role_name === 'admin');
  if (isAdmin) {
    return { scope_type: 'ALL' };
  }
  
  // 获取数据权限
  const roleIds = user.roles.map(r => r.id);
  const permissions = await this.findAll({
    where: {
      role_id: roleIds,
      resource_type: resourceType
    },
    order: [['scope_type', 'DESC']] // ALL > DEPARTMENT > SELF > CUSTOM
  });
  
  if (permissions.length === 0) {
    return { scope_type: 'SELF' }; // 默认只能看自己的
  }
  
  // 返回最高权限
  const perm = permissions[0];
  return {
    scope_type: perm.scope_type,
    scope_value: perm.scope_value ? JSON.parse(perm.scope_value) : null,
    can_view: perm.can_view,
    can_edit: perm.can_edit,
    can_delete: perm.can_delete,
    can_export: perm.can_export,
    department_id: user.department_id
  };
};

// 静态方法：应用数据范围过滤
DataPermission.applyScope = function(query, dataScope, userId) {
  switch (dataScope.scope_type) {
    case 'ALL':
      // 不限制
      return query;
      
    case 'DEPARTMENT':
      // 本部门及子部门
      if (dataScope.department_id) {
        return query.where({ department_id: dataScope.department_id });
      }
      return query.where({ created_by: userId });
      
    case 'SELF':
      // 仅自己创建的
      return query.where({ created_by: userId });
      
    case 'CUSTOM':
      // 自定义范围
      if (dataScope.scope_value) {
        return query.where(dataScope.scope_value);
      }
      return query.where({ created_by: userId });
      
    default:
      return query.where({ created_by: userId });
  }
};

module.exports = DataPermission;
