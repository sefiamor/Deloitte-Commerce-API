const bodyParser = require('body-parser');
const express = require('express');
const passport = require('passport');
const request = require('supertest');

const AuthController = require('./auth');
const UserController = require('./user');

const app = new express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use('/auth', new AuthController().router);
app.use(
  '/user',
  passport.authenticate('jwt', { session: false }),
  new UserController().router,
);

const db = require('../../test/database');
const users = require('../../test/users');

const controller = require('../../test/controller');

afterAll(async () => {
  await db.dropDb();
});

beforeAll(async () => {
  await db.setUp();
  await users.load();
});

describe('test user controller', () => {
  it('should fail when not logged in', async () => {
    const res = await request(app).get('/user');
    expect(res.statusCode).toBe(401);
  });

  it('should return details for the logged in user', async () => {
    const token = await controller.login(
      app,
      'overrillo0@redcross.org',
      'QkYvxNZUiP',
    );

    const res = await request(app)
      .get('/user')
      .set('Authorization', 'Bearer ' + token);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('overrillo0@redcross.org');
  });

  it('should fail to delete another user', async () => {
    const token = await controller.login(
      app,
      'overrillo0@redcross.org',
      'QkYvxNZUiP',
    );

    const res = await request(app)
      .delete('/user')
      .send({ email: 'someotheruser@gmail.com' })
      .set('Authorization', 'Bearer ' + token);
    expect(res.statusCode).toBe(403);
  });

  it('should fail to update details for another user', async () => {
    const token = await controller.login(
      app,
      'overrillo0@redcross.org',
      'QkYvxNZUiP',
    );

    const res = await request(app)
      .put('/user')
      .send({
        email: 'someotheruser@gmail.com',
        first_name: 'test',
      })
      .set('Authorization', 'Bearer ' + token);
    expect(res.statusCode).toBe(403);
  });

  it('should update and delete the logged in user', async () => {
    const signup = await request(app).post('/auth/signup').send({
      email: 'test_user_update_delete@deloittecommerce.api',
      password: 'password123#',
    });
    expect(signup.statusCode).toBe(200);

    const token = await controller.login(
      app,
      'test_user_update_delete@deloittecommerce.api',
      'password123#',
    );

    let res = await request(app)
      .put('/user')
      .send({
        email: 'test_user_update_delete@deloittecommerce.api',
        first_name: 'test',
        last_name: 'user',
      })
      .set('Authorization', 'Bearer ' + token);
    expect(res.statusCode).toBe(200);
    expect(res.body.first_name).toBe('test');
    expect(res.body.last_name).toBe('user');

    res = await request(app)
      .delete('/user')
      .send({ email: 'test_user_update_delete@deloittecommerce.api' })
      .set('Authorization', 'Bearer ' + token);
    expect(res.statusCode).toBe(200);
  });
});
