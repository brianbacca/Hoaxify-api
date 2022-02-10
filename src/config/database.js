const Sequelize = require('sequelize');
require('dotenv').config();
const { DB_USER, DB_PASSWORD, DB_HOST, DB_DATABASE } = process.env;

const sequelize = new Sequelize(DB_DATABASE, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'postgres',
  logging: false,
});

module.exports = sequelize;
