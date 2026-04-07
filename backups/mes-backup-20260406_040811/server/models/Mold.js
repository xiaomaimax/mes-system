const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mold = sequelize.define('Mold', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  mold_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  mold_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  specifications: {
    type: DataTypes.STRING(200)
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  status: {
    type: DataTypes.ENUM('normal', 'maintenance', 'idle', 'scrapped'),
    defaultValue: 'normal'
  }
}, {
  tableName: 'molds',
  timestamps: true,
  underscored: true
});

module.exports = Mold;
