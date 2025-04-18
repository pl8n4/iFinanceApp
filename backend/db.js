const { Sequelize } = require('sequelize');
require('dotenv').config();

// Set up local .env file to connect to db
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: false
  }
);

module.exports = sequelize;
