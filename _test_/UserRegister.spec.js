const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/database');
const User = require('../src/user/User');

beforeAll(() => {
  return sequelize.sync();
});




describe('User Registration', () => {
  it('return 200 ok when sigup request is valid', (done) => {
    request(app)
      .post('/app/v1/users')
      .send({
        username: 'user1',
        email: 'user1@email.com',
        password: 'password',
      })
      .then((response) => {
        expect(response.status).toBe(200);
        done();
      });
  });
  it('return succes message when singup request is valid', (done) => {
    request(app)
      .post('/app/v1/users')
      .send({
        username: 'user1',
        email: 'user1@email.com',
        password: 'password',
      })
      .then((response) => {
        expect(response.body.msg).toEqual('User Created');
        done();
      });
  });
  it('return succes message when singup request is valid', (done) => {
    request(app).post('/app/v1/users').send({
      username: 'user1',
      email: 'user1@email.com',
      password: 'password',
    });
    User.findAll().then((userList) => {
      expect(userList.length).toBe(2);
      done();
    });
  });


  it('save the username and email  to database', (done) => {
    request(app)
      .post('/app/v1/users')
      .send({
        username: 'user1',
        email: 'user1@email.com',
        password: 'password',
      })
      .then(() => {
        User.findAll().then((userList) => {
          const userSave = userList[0];
          expect(userSave.username).toBe('user1');
          expect(userSave.email).toBe('user1@email.com');
        });
        done();
      });
  });
  it('hashes the password in database', (done) => {
    request(app)
      .post('/app/v1/users')
      .send({
        username: 'user1',
        email: 'user1@email.com',
        password: 'password',
      })
      .then(() => {
        User.findAll().then((userList) => {
          const userSave = userList[0];
          expect(userSave.password).toBe('password');
        });
        done();
      });
  });
});
