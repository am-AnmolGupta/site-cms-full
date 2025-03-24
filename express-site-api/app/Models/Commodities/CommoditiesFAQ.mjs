import { DataTypes } from 'sequelize';
import { sequelize } from './../../../config/db_commodities.mjs';

const CommoditiesFAQ = sequelize.define('CommoditiesFAQ', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ans: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'commodities_faq',
  timestamps: true,
  paranoid: true,
});

export { CommoditiesFAQ };
