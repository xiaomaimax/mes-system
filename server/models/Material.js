const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Material = sequelize.define('Material', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  material_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  material_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  material_type: {
    type: DataTypes.STRING(50)
  },
  specifications: {
    type: DataTypes.STRING(200)
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  tableName: 'materials',
  timestamps: true,
  underscored: true
});

module.exports = Material;
