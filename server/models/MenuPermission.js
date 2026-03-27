const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MenuPermission = sequelize.define('MenuPermission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  menu_code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'menu_code'
  },
  menu_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'menu_name'
  },
  parent_code: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'parent_code'
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order'
  },
  path: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  is_visible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_visible'
  },
  permission_code: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'permission_code'
  }
}, {
  tableName: 'menu_permissions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['parent_code'] },
    { fields: ['menu_code'] }
  ]
});

// 关联已在 index.js 中定义
MenuPermission.associate = (models) => {};

// 静态方法：获取用户可见菜单树
MenuPermission.getUserMenuTree = async function(userId) {
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
  
  if (!user) return [];
  
  // 检查是否有 admin 角色
  const isAdmin = user.roles.some(r => r.role_name === 'admin');
  
  if (isAdmin) {
    // admin 可以看到所有菜单
    return await this.getMenuTree();
  }
  
  // 获取角色菜单
  const roleIds = user.roles.map(r => r.id);
  const RoleMenu = sequelize.models.RoleMenu;
  
  const roleMenus = await RoleMenu.findAll({
    where: {
      role_id: roleIds,
      can_view: true
    },
    attributes: ['menu_id']
  });
  
  const menuIds = roleMenus.map(rm => rm.menu_id);
  
  if (menuIds.length === 0) return [];
  
  const menus = await this.findAll({
    where: {
      id: menuIds,
      is_visible: true
    },
    order: [['sort_order', 'ASC']]
  });
  
  // 构建树形结构
  return this.buildTree(menus);
};

// 静态方法：获取完整菜单树
MenuPermission.getMenuTree = async function() {
  const menus = await this.findAll({
    where: { is_visible: true },
    order: [['sort_order', 'ASC']]
  });
  
  return this.buildTree(menus);
};

// 静态方法：构建树形结构
MenuPermission.buildTree = function(menus) {
  const menuMap = new Map();
  const tree = [];
  
  // 创建映射
  menus.forEach(menu => {
    menuMap.set(menu.menu_code, {
      ...menu.toJSON(),
      children: []
    });
  });
  
  // 构建树
  menus.forEach(menu => {
    const node = menuMap.get(menu.menu_code);
    
    if (!menu.parent_code) {
      // 根节点
      tree.push(node);
    } else {
      // 子节点
      const parent = menuMap.get(menu.parent_code);
      if (parent) {
        parent.children.push(node);
      }
    }
  });
  
  // 按 sort_order 排序子节点
  const sortTree = (nodes) => {
    nodes.sort((a, b) => a.sort_order - b.sort_order);
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        sortTree(node.children);
      }
    });
  };
  
  sortTree(tree);
  
  return tree;
};

module.exports = MenuPermission;
