const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RolePermission = sequelize.define('RolePermission', {
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'role_id'
  },
  permission_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'permission_id'
  }
}, {
  tableName: 'role_permissions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

RolePermission.associate = (models) => {
  RolePermission.belongsTo(models.Role, {
    foreignKey: 'role_id',
    as: 'role'
  });
  
  RolePermission.belongsTo(models.Permission, {
    foreignKey: 'permission_id',
    as: 'permission'
  });
};

module.exports = RolePermission;
