import { DataTypes } from 'sequelize';
import { sequelize } from './../../../config/db_commodities.mjs';

const CommoditiesTopContent = sequelize.define('CommoditiesTopContent', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
  },
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
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_edited: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
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
  tableName: 'commodities_top_content',
  timestamps: true,
  paranoid: true,
  primaryKey: ['city', 'name'],
});

export { CommoditiesTopContent };
