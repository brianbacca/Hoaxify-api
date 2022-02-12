const express = require('express');
const UserService = require('./UserService');
const router = express.Router();
const User = require('./User');
const { check, validationResult } = require('express-validator');

// const validateUsername = (req, res, next) => {
//   const user = req.body;
//   if (user.username === null) {
//     req.validationErrors = {
//       username: 'Username cannot be null',
//     };
//   }
//   next();
// };
// const validateEmail = (req, res, next) => {
//   const user = req.body;
//   if (user.email === null) {
//     req.validationErrors = {
//       ...req.validationErrors,
//       email: 'E-mail cannot be null',
//     };
//   }
//   next();
// };

router.post(
  '/app/1.0/users',
  check('password')
    .notEmpty()
    .withMessage('pass_null')
    .bail()
    .isLength({ min: 6 })
    .withMessage('pass_invalid')
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .withMessage('pass_invalid2'),
  check('username')
    .notEmpty()
    .withMessage('username_null')
    .bail()
    .isLength({ min: 4, max: 32 })
    .withMessage('username_size'),

  check('email')
    .notEmpty()
    .withMessage('email_null')
    .bail()
    .isEmail()
    .withMessage('email_invalid')
    .bail()
    .custom(async (email) => {
      const user = await UserService.findByEmail(email);
      if (user) {
        throw new Error('email_inUse');
      }
    }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = {};
      errors.array().forEach((error) => (validationErrors[error.param] = req.t(error.msg)));
      return res.status(400).send({ validationErrors: validationErrors });
    }
    try {
      await UserService.save(req.body);
      return res.send({ msg: req.t('user_created_success') });
    } catch (err) {
      return res.status(502).send({ message: 'E-mail failoure' });
    }
  }
);

module.exports = router;
