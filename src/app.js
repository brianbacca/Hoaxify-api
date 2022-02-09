const express = require('express');
const User = require('./user/User');

const app = express();
app.use(express.json());

app.post('/app/v1/users', (req, res) => {
  User.create(req.body).then(() => {
    return res.send({ msg: 'User Created' });
  });
});

module.exports = app;
