const User = require('./User');
const bcypt = require('bcrypt');
const crypto = require('crypto');
const EmailServices = require('../email/EmailServices');
const sequelize = require('../config/database');

const generateToken = (length) => {
  return crypto.randomBytes(length).toString('hex').substring(0, length);
};

const save = async (body) => {
  const { username, email, password } = body;
  const hash = await bcypt.hash(password, 10);
  const user = { username, email, password: hash, activationToken: generateToken(16) };
  // const transaction = await sequelize.transaction();
  await User.create(user);

  // try {
    await EmailServices.sendAccountActivation(email, user.activationToken);
    // await transaction.commit();
  // } catch (err) {
    await transaction.rollBack();
    // throw new Error(err);
  // }
};

const findByEmail = async (email) => {
  return await User.findOne({ where: { email: email } });
};

module.exports = {
  save,
  findByEmail,
};
