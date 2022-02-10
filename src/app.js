const express = require('express');
const UserRouter = require('./user/User.router.js');
const app = express();
app.use(express.json());

app.use(UserRouter);

module.exports = app;
