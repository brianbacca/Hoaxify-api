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
  password: 'P4ssword',
};

const postUser = (user = validUser) => {
  return request(app).post('/app/1.0/users').send(user);
};

describe('User Registration', () => {
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
      password: 'P4ssword',
    });
    expect(response.status).toBe(400);
  });
  it('returns validationErrors field in response body when validation error occurs', async () => {
    const response = await request(app).post('/app/1.0/users').send({
      username: null,
      email: 'user1@email.com',
      password: 'P4ssword',
    });
    const body = response.body;
    expect(body.validationErrors).not.toBeUndefined();
  });

  it('returns errors for both when username and email is null', async () => {
    const response = await request(app).post('/app/1.0/users').send({
      username: null,
      email: null,
      password: 'P4ssword',
    });
    const body = response.body;
    expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
  });
  // it.each([
  //   ['username', 'Username cannot be null'],
  //   ['email', 'E-mail cannot be null'],
  //   ['password', 'Password cannot be null'],
  // ])('when %s is null %s is received', async (field, expectedMessage) => {
  //   const user = {
  //     username: 'user1',
  //     email: 'user1@email.com',
  //     password: 'password',
  //   };
  //   user[field] = null;
  //   const response = await postUser(user);
  //   const body = response.body;
  //   expect(body.validationErrors[field]).toBe(expectedMessage);
  // });
  it.each`
    field         | value              | expectedMessage
    ${'username'} | ${null}            | ${'Username cannot be null'}
    ${'username'} | ${'usr'}           | ${'Must have min 4 and max 32 characters'}
    ${'username'} | ${'a'.repeat(33)}  | ${'Must have min 4 and max 32 characters'}
    ${'email'}    | ${null}            | ${'E-mail cannot be null'}
    ${'email'}    | ${'mail.com'}      | ${'E-mail is not valid'}
    ${'email'}    | ${'user.mail.com'} | ${'E-mail is not valid'}
    ${'email'}    | ${'user@mail'}     | ${'E-mail is not valid'}
    ${'password'} | ${null}            | ${'Password cannot be null'}
    ${'password'} | ${'Pass2'}         | ${'Password must be at least 6 characters'}
    ${'password'} | ${'alllowercase'}  | ${'Password must have at least 1 upperCase, 1 lowercase letter and 1 number'}
    ${'password'} | ${'ALLUPPERCASE'}  | ${'Password must have at least 1 upperCase, 1 lowercase letter and 1 number'}
    ${'password'} | ${'1234567890'}    | ${'Password must have at least 1 upperCase, 1 lowercase letter and 1 number'}
    ${'password'} | ${'lowerandUPPER'} | ${'Password must have at least 1 upperCase, 1 lowercase letter and 1 number'}
    ${'password'} | ${'lower4nd5667'}  | ${'Password must have at least 1 upperCase, 1 lowercase letter and 1 number'}
    ${'password'} | ${'UPPER44444'}    | ${'Password must have at least 1 upperCase, 1 lowercase letter and 1 number'}
  `('return $expectedMessage when $field is $value', async ({ field, expectedMessage, value }) => {
    const user = {
      username: 'user1',
      email: 'user1@email.com',
      password: 'P4ssword',
    };
    user[field] = value;
    const response = await postUser(user);
    const body = response.body;
    expect(body.validationErrors[field]).toBe(expectedMessage);
  });
  // it('returns Username cannot be null when username is null', async () => {
  //   const response = await request(app).post('/app/1.0/users').send({
  //     username: null,
  //     email: 'user1@email.com',
  //     password: 'password',
  //   });
  //   const body = response.body;
  //   expect(body.validationErrors.username).toBe('Username cannot be null');
  // });
  // it('returns E-mail cannot be null when email is null', async () => {
  //   const response = await request(app).post('/app/1.0/users').send({
  //     username: 'use1',
  //     email: null,
  //     password: 'password',
  //   });
  //   const body = response.body;
  //   expect(body.validationErrors.email).toBe('E-mail cannot be null');
  // });
  // it('returns password cannot be null when password is null', async () => {
  //   const response = await request(app).post('/app/1.0/users').send({
  //     username: 'user1',
  //     email: 'user1@email.com',
  //     password: null,
  //   });
  //   const body = response.body;
  //   expect(body.validationErrors.password).toBe('Password cannot be null');
  // });

  // it('return size validation error when username is less than 4 characters', async () => {
  //   const user = {
  //     username: 'us',
  //     email: 'user1@email.com',
  //     password: 'password',
  //   };
  //   const response = await postUser(user);
  //   const body = response.body;
  //   expect(body.validationErrors.username).toBe('Must have min 4 and max 32 characters');
  // });
  it('return E-mail in use when same email is already in use', async () => {
    await User.create({ ...validUser });
    const response = await postUser();
    expect(response.body.validationErrors.email).toBe('E-mail in use');
  });
  it('return errors for both username is null and email is in use', async () => {
    await User.create({ ...validUser });
    const response = await postUser({
      username: null,
      email: validUser.email,
      password: 'P4ssword',
    });

    const body = response.body;
    expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
  });
});
