import { DataTypes } from 'sequelize';
import { sequelize } from './../../../config/db_commodities.mjs';

const CommoditiesTopContentFormat = sequelize.define('CommoditiesTopContentFormat', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  format: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'commodities_top_content_format',
  timestamps: true,
  paranoid: true,
  primaryKey: ['city', 'name'],
});

export { CommoditiesTopContentFormat };
