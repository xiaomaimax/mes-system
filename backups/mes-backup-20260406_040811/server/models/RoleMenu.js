const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoleMenu = sequelize.define('RoleMenu', {
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'role_id'
  },
  menu_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'menu_id'
  },
  can_view: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'can_view'
  }
}, {
  tableName: 'role_menus',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

RoleMenu.associate = (models) => {
  RoleMenu.belongsTo(models.Role, {
    foreignKey: 'role_id',
    as: 'role'
  });
  
  RoleMenu.belongsTo(models.MenuPermission, {
    foreignKey: 'menu_id',
    as: 'menu'
  });
};

module.exports = RoleMenu;
