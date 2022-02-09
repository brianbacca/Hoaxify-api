const Sequelize = require('sequelize');

const sequelize = new Sequelize('hoaxify', 'my-db-user', 'db-p4ss', {
  dialect: 'sqlite',
  Storage: './database.sqlite',
  loading: false,
});

module.exports = sequelize;
