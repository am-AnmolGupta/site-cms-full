import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/db_commodities.mjs';

const CommoditiesEodMaster = sequelize.define('CommoditiesMaster', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  last_price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  prev_close: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  update_date_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  siunit: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  priceunit: {
    type: DataTypes.FLOAT,
    allowNull: false,
  }
}, {
  tableName: 'commodities_eod_tick',
  timestamps: false,
});

export { CommoditiesEodMaster };
