const { Sequelize } = require('sequelize');
require('dotenv').config();


// Creats a new Sequalize instance to connect to the database
// The database connection info is stored in the .env and you need to configure it with your own login.
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
