const express = require('express');
const UserRouter = require('./user/User.router.js');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());
app.use(UserRouter);

module.exports = app;
