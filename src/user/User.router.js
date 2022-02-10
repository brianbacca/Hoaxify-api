const express = require('express');
const UserService = require('./UserService');
const router = express.Router();

router.post('/app/v1/users', async (req, res) => {
  const user = req.body;
  if (user.username === null) {
    return res.status(400).send('the user cannot null');
  }
  await UserService.save(req.body);
  return res.send({ msg: 'User Created' });
});
router.get('/app/v1/users', async (req, res) => {
  res.send('HOLIS');
});

module.exports = router;
