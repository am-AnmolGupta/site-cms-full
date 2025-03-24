import { DataTypes } from 'sequelize';
import { sequelize } from './../../../config/db_commodities.mjs';

const CommoditiesStaticContent = sequelize.define('CommoditiesStaticContent', {
  city: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  facts: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  seo_title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  seo_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  seo_keywords: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  monthly_summary: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_summary: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  top_content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_top_content_edited: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  editor_top_content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  editor_top_content_updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'commodities_static_content',
  timestamps: true,
  paranoid: true,
  primaryKey: ['city', 'name'],
});

export { CommoditiesStaticContent };
