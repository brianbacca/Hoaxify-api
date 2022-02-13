const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/database');
const bcypt = require('bcrypt');
const User = require('../src/user/User');
const nodemailerStub = require('nodemailer-stub');
const EmailSerivce = require('../src/email/EmailSErvices');

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

const postUser = (user = validUser, option = {}) => {
  const agent = request(app).post('/app/1.0/users');
  if (option.language) {
    agent.set('Accept-Language', option.language);
  }

  return agent.send(user);
};

describe('User Registration', () => {
  it('return 200 ok when sigup request is valid', async () => {
    const response = await postUser();
    expect(response.status).toBe(200);
  });

  it('return succes message when singup request is valid', async () => {
    const response = await postUser();
    expect(response.body.msg).toBe('User Created');
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
  const username_null = 'Username cannot be null';
  const username_size = 'Must have min 4 and max 32 characters';
  const email_null = 'E-mail cannot be null';
  const email_invalid = 'E-mail is not valid';
  const pass_null = 'Password cannot be null';
  const pass_invalid = 'Password must be at least 6 characters';
  const pass_invalid2 = 'Password must have at least 1 upperCase, 1 lowercase letter and 1 number';
  const email_inUse = 'E-mail in use';
  it.each`
    field         | value              | expectedMessage
    ${'username'} | ${null}            | ${username_null}
    ${'username'} | ${'usr'}           | ${username_size}
    ${'username'} | ${'a'.repeat(33)}  | ${username_size}
    ${'email'}    | ${null}            | ${email_null}
    ${'email'}    | ${'mail.com'}      | ${email_invalid}
    ${'email'}    | ${'user.mail.com'} | ${email_invalid}
    ${'email'}    | ${'user@mail'}     | ${email_invalid}
    ${'password'} | ${null}            | ${pass_null}
    ${'password'} | ${'Pass2'}         | ${pass_invalid}
    ${'password'} | ${'alllowercase'}  | ${pass_invalid2}
    ${'password'} | ${'ALLUPPERCASE'}  | ${pass_invalid2}
    ${'password'} | ${'1234567890'}    | ${pass_invalid2}
    ${'password'} | ${'lowerandUPPER'} | ${pass_invalid2}
    ${'password'} | ${'lower4nd5667'}  | ${pass_invalid2}
    ${'password'} | ${'UPPER44444'}    | ${pass_invalid2}
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

  it(`return when same email is already in use`, async () => {
    await User.create({ ...validUser });
    const response = await postUser();
    expect(response.body.validationErrors.email).toBe(email_inUse);
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
  it('creates users in inactive mode', async () => {
    await postUser();
    const users = await User.findAll();
    const saveUser = users[0];
    expect(saveUser.inactive).toBe(true);
  });
  it('creates user in inactive mode even the request body inactive as false', async () => {
    const newUser = { ...validUser, inactive: false };
    await postUser(newUser);
    const users = await User.findAll();
    const saveUser = users[0];
    expect(saveUser.inactive).toBe(true);
  });
  it('creates an activation token for user', async () => {
    await postUser();
    const users = await User.findAll();
    const saveUser = users[0];
    expect(saveUser.activationToken).toBeTruthy();
  });
  it('send an Account activation email with acitivationToken', async () => {
    await postUser();
    const lastMail = nodemailerStub.interactsWithMail.lastMail();
    expect(lastMail.to[0]).toBe('user1@email.com');
    const users = await User.findAll();
    const saveUser = users[0];
    expect(lastMail.content).toContain(saveUser.activationToken);
  });
  it('returns 502 Bad Getway when sennding email fails', async () => {
    const mocksendAccountActivation = jest
      .spyOn(EmailSerivce, 'serndAccountActivation')
      .mockRejectedValue({ message: 'Failed ti deliver email' });

    const response = await postUser();
    expect(response.status).toBe(502);
    mocksendAccountActivation.mockRestore();
  });
});
it('does not save user to database if activation email fails', async () => {
  const mocksendAccountActivation = jest
    .spyOn(EmailSerivce, 'serndAccountActivation')
    .mockRejectedValue({ message: 'Failed ti deliver email' });

  const response = await postUser();
  expect(response.status).toBe(502);
  mocksendAccountActivation.mockRestore();
  const user = await User.findAll();
  expect(user.length).toBe(0);
});

describe('Internationalization', () => {
  // const postUser = (user = validUser) => {
  //   return request(app).post('/app/1.0/users').set('Accept-Language', 'es').send(user);
  // };

  const username_null = 'El usuario no puede estar vacío';
  const username_size = 'El usuario tiene que tener entre 4 y 32 carateres';
  const email_null = 'El e-mail no puede estar vacío';
  const email_invalid = 'E-mail invalido';
  const pass_null = 'La contraseña no puede estar vacío';
  const pass_invalid = 'La contraseña debe tener al menos 6 caracteres';
  const pass_invalid2 = 'La contraseña debe tener una letra mayúscula, una minúscula y un número';
  const email_inUse = 'El email se encuentra en uso';
  const user_created_success = 'Usuario creado';
  const email_failure = 'Error en E-mail';
  it.each`
    field         | value              | expectedMessage
    ${'username'} | ${null}            | ${username_null}
    ${'username'} | ${'usr'}           | ${username_size}
    ${'username'} | ${'a'.repeat(33)}  | ${username_size}
    ${'email'}    | ${null}            | ${email_null}
    ${'email'}    | ${'mail.com'}      | ${email_invalid}
    ${'email'}    | ${'user.mail.com'} | ${email_invalid}
    ${'email'}    | ${'user@mail'}     | ${email_invalid}
    ${'password'} | ${null}            | ${pass_null}
    ${'password'} | ${'Pass2'}         | ${pass_invalid}
    ${'password'} | ${'alllowercase'}  | ${pass_invalid2}
    ${'password'} | ${'ALLUPPERCASE'}  | ${pass_invalid2}
    ${'password'} | ${'1234567890'}    | ${pass_invalid2}
    ${'password'} | ${'lowerandUPPER'} | ${pass_invalid2}
    ${'password'} | ${'lower4nd5667'}  | ${pass_invalid2}
    ${'password'} | ${'UPPER44444'}    | ${pass_invalid2}
  `('return $expectedMessage when $field is $value', async ({ field, expectedMessage, value }) => {
    const user = {
      username: 'user1',
      email: 'user1@email.com',
      password: 'P4ssword',
    };
    user[field] = value;
    const response = await postUser(user, { language: 'es' });
    const body = response.body;
    expect(body.validationErrors[field]).toBe(expectedMessage);
  });

  it(`return ${email_inUse}  when same email is already in use`, async () => {
    await User.create({ ...validUser });
    const response = await postUser({ ...validUser }, { language: 'es' });
    expect(response.body.validationErrors.email).toBe(email_inUse);
  });
  it('return succes message when singup request is valid', async () => {
    const response = await postUser({ ...validUser }, { language: 'es' });
    expect(response.body.msg).toBe(user_created_success);
  });
  it(`returns ${email_failure}  message when sendig email fails`, async () => {
    const mocksendAccountActivation = jest
      .spyOn(EmailSerivce, 'serndAccountActivation')
      .mockRejectedValue({ message: 'Failed ti deliver email' });

    const response = await postUser({ ...validUser }, { language: 'es' });
    expect(response.status).toBe(502);
    mocksendAccountActivation.mockRestore();
    expect(response.body.msg).toBe(email_failure);
  });
});
