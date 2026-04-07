const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserRole = sequelize.define('UserRole', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'user_id'
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'role_id'
  }
}, {
  tableName: 'user_roles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

UserRole.associate = (models) => {
  UserRole.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
  
  UserRole.belongsTo(models.Role, {
    foreignKey: 'role_id',
    as: 'role'
  });
};

module.exports = UserRole;
