const bodyParser = require('body-parser');
const express = require('express');
const passport = require('passport');
const request = require('supertest');

const AuthController = require('./auth');

const app = new express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use('/auth', new AuthController().router);

const db = require('../../test/database');
const users = require('../../test/users');

afterAll(async () => {
  await db.dropDb();
});

beforeAll(async () => {
  await db.setUp();
  await users.load();
});

describe('test auth controller', () => {
  it('should log the user in and generate a jwt token', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'overrillo0@redcross.org',
      password: 'QkYvxNZUiP',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).not.toBeUndefined();
  });

  it('should fail because unknown email address', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'invalidemailaddress@gmail.com',
      password: 'QkYvxNZUiP',
    });
    expect(res.statusCode).toBe(401);
    expect(res.text).toContain('Wrong email address');
  });

  it('should fail because wrong password', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'overrillo0@redcross.org',
      password: 'wrong password',
    });
    expect(res.statusCode).toBe(401);
    expect(res.text).toContain('Wrong password');
  });

  it('should sign up a new user', async () => {
    const signup = await request(app).post('/auth/signup').send({
      email: 'test_user_signup@deloittecommerce.api',
      password: 'password123#',
    });
    expect(signup.statusCode).toBe(200);

    const login = await request(app).post('/auth/login').send({
      email: 'test_user_signup@deloittecommerce.api',
      password: 'password123#',
    });
    expect(login.statusCode).toBe(200);
    expect(login.body.token).not.toBeUndefined();
  });

  it('should fail to sign up existing user', async () => {
    const res = await request(app).post('/auth/signup').send({
      email: 'overrillo0@redcross.org',
      password: 'password123#',
    });
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('Account with email exists');
  });
});
