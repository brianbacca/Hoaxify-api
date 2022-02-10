const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/database');
const bcypt = require('bcrypt');

const User = require('../src/user/User');

beforeAll(() => {
  return sequelize.sync();
});
beforeEach(async () => {
  await User.destroy({ truncate: { cascade: true } });
});

const validUser = {
  username: 'user1',
  email: 'user1@email.com',
  password: 'password',
};

const postUser = (user = validUser) => {
  return request(app).post('/app/1.0/users').send(user);
};

describe('User Registration', () => {
  const postUser = () => {
    return request(app).post('/app/1.0/users').send({
      username: 'user1',
      email: 'user1@email.com',
      password: 'password',
    });
  };

  it('return 200 ok when sigup request is valid', async () => {
    const response = await postUser();
    expect(response.status).toBe(200);
  });

  it('return succes message when singup request is valid', async () => {
    const response = await postUser();
    expect(response.body.msg).toEqual('User Created');
  });

  it('return succes message when singup request is valid', async () => {
    await postUser();
    const userList = await User.findAll();
    expect(userList.length).toBe(1);
  });

  it('save the username and email  to database', async () => {
    await postUser();
    const userList = await User.findAll();
    const userSave = userList[0];
    expect(userSave.username).toBe('user1');
    expect(userSave.email).toBe('user1@email.com');
  });
  it('hashes the password in database', async () => {
    await postUser();
    const userList = await User.findAll();
    const userSave = userList[0];
    const userPass = userSave.password;

    expect(userSave.password).toBe(userPass);
  });
  it('returns 400 when username is null', async () => {
    const response = await request(app).post('/app/1.0/users').send({
      username: null,
      email: 'user1@email.com',
      password: 'password',
    });
    expect(response.status).toBe(400);
  });
  it('returns validationErrors field in response body when validation error occurs', async () => {
    const response = await request(app).post('/app/1.0/users').send({
      username: null,
      email: 'user1@email.com',
      password: 'password',
    });
    const body = response.body;
    expect(body.validationErrors).not.toBeUndefined();
  });
  it('returns Username cannot be null when username is null', async () => {
    const response = await request(app).post('/app/1.0/users').send({
      username: null,
      email: 'user1@email.com',
      password: 'password',
    });
    const body = response.body;
    expect(body.validationErrors.username).toBe('Username cannot be null');
  });
});
