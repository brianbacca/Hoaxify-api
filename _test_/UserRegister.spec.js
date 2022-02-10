const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/database');
const { beforeDestroy } = require('../src/user/User');
const User = require('../src/user/User');

beforeAll(() => {
  return sequelize.sync();
});


describe('User Registration', () => {
  const postValidUser = () => {
    return request(app).post('/app/v1/users').send({
      username: 'user1',
      email: 'user1@email.com',
      password: 'password',
    });
  };

  it('return 200 ok when sigup request is valid', async () => {
    const response = await postValidUser();
    expect(response.status).toBe(200);
  });

  it('return succes message when singup request is valid', async () => {
    const response = await postValidUser();
    expect(response.body.msg).toEqual('User Created');
  });

  it('return succes message when singup request is valid', async () => {
    await postValidUser();
    const userList = await User.findAll();
    expect(userList.length).toBe(userList.length);
  });

  it('save the username and email  to database', async () => {
    await postValidUser();
    const userList = await User.findAll();
    const userSave = userList[0];
    expect(userSave.username).toBe('user1');
    expect(userSave.email).toBe('user1@email.com');
  });
  it('hashes the password in database', async () => {
    await postValidUser();
    const userList = await User.findAll();
    const userSave = userList[0];
    expect(userSave.password).toBe('password');
  });
  it('returns 400 when username is null', async () => {
    const response = await request(app).post('/app/v1/users').send({
      username: null,
      email: 'user1@email.com',
      password: 'password',
    });
    expect(response.status).toBe(400);
  });
});
