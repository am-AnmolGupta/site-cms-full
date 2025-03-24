import { DataTypes } from 'sequelize';
import { sequelize } from './../../../config/db_commodities.mjs';

const CommoditiesDailyUpdatesFormat = sequelize.define('CommoditiesDailyUpdatesFormat', {
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
  day: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  format: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'commodity_daily_updates_format',
  timestamps: true,
  paranoid: true,
  primaryKey: ['city', 'name', 'day']
});

export { CommoditiesDailyUpdatesFormat };
