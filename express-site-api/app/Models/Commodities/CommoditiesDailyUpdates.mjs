import { DataTypes } from 'sequelize';
import { sequelize } from './../../../config/db_commodities.mjs';
import moment from 'moment';

const CommoditiesDailyUpdates = sequelize.define('CommoditiesDailyUpdates', {
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
  date: {
    type: DataTypes.DATE,
    get() {
      const rawValue = this.getDataValue('date');
      return rawValue ? moment(rawValue).format('YYYY-MM-DD HH:mm:ss') : null;
    },
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_edited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  editor_content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  editor_updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'commodity_daily_updates',
  timestamps: true,
  paranoid: true,
  primaryKey: ['city', 'name'],
});

export { CommoditiesDailyUpdates };
