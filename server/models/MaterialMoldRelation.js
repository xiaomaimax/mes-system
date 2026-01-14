const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Material = require('./Material');
const Mold = require('./Mold');

const MaterialMoldRelation = sequelize.define('MaterialMoldRelation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  material_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Material,
      key: 'id'
    }
  },
  mold_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Mold,
      key: 'id'
    }
  },
  weight: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  },
  cycle_time: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  output_per_cycle: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  tableName: 'material_mold_relations',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['material_id', 'mold_id']
    }
  ]
});

MaterialMoldRelation.belongsTo(Material, { foreignKey: 'material_id' });
MaterialMoldRelation.belongsTo(Mold, { foreignKey: 'mold_id' });

module.exports = MaterialMoldRelation;
