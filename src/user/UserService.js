const User = require('./User');
const bcypt = require('bcrypt');
const crypto = require('crypto');
const EmailServices = require('../email/EmailSErvices');
const sequelize = require('../config/database');
const EmailExeption = require("../email/EmailExeption")
const generateToken = (length) => {
  return crypto.randomBytes(length).toString('hex').substring(0, length);
};

const save = async (body) => {
  const { username, email, password } = body;
  const hash = await bcypt.hash(password, 10);
  const user = { username, email, password: hash, activationToken: generateToken(16) };
  const transaction = await sequelize.transaction();
  await User.create(user, { transaction });
  try {
    await EmailServices.serndAccountActivation(email, user.activationToken);
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw new EmailExeption();
  }
};

const findByEmail = async (email) => {
  return await User.findOne({ where: { email: email } });
};

module.exports = {
  save,
  findByEmail,
};
