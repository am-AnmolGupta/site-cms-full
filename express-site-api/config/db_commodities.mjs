import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_COMMODITY_NAME,
  process.env.DB_COMMODITY_USER,
  process.env.DB_COMMODITY_PASSWORD,
  {
    host: process.env.DB_COMMODITY_HOST,
    port: process.env.DB_COMMODITY_PORT,
    dialect: 'postgres',
  }
);

const dbCommoditiesConnect = async () => {
  try {
    await sequelize.authenticate();
    console.log('Sequelize connected successfully!');
  } catch (err) {
    console.error('Error connecting to Sequelize:', err);
    process.exit(1);
  }
};

export { sequelize, dbCommoditiesConnect };
