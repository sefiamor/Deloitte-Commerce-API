const bodyParser = require('body-parser');
const express = require('express');
const passport = require('passport');
const request = require('supertest');

const AuthController = require('./auth');
const OrderController = require('./order');

const Product = require('../model/product');

const app = new express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use('/auth', new AuthController().router);
app.use(
  '/order',
  passport.authenticate('jwt', { session: false }),
  new OrderController().router,
);

const db = require('../../test/database');
const products = require('../../test/products');
const users = require('../../test/users');
const orders = require('../../test/orders');

const controller = require('../../test/controller');

afterAll(async () => {
  await db.dropDb();
});

beforeAll(async () => {
  await db.setUp();
  await products.load();
  await users.load();
  await orders.load();
});

describe('test order controller', () => {
  it('should find all orders for logged in user', async () => {
    const token = await controller.login(
      app,
      'overrillo0@redcross.org',
      'QkYvxNZUiP',
    );

    const res = await request(app)
      .get('/order')
      .set('Authorization', 'Bearer ' + token);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it('should find one orders by number', async () => {
    const token = await controller.login(
      app,
      'overrillo0@redcross.org',
      'QkYvxNZUiP',
    );

    const res = await request(app)
      .get('/order/2')
      .set('Authorization', 'Bearer ' + token);
    expect(res.statusCode).toBe(200);
    expect(res.body.number).toBe(2);
    expect(res.body.orderLines.length).toBe(2);
  });

  it('should add a new order', async () => {
    const token = await controller.login(
      app,
      'overrillo0@redcross.org',
      'QkYvxNZUiP',
    );

    const p6 = await Product.findByNumber(6);

    const res = await request(app)
      .post('/order')
      .send([{ product: p6, quantity: 3 }])
      .set('Authorization', 'Bearer ' + token);
    expect(res.statusCode).toBe(200);
    expect(res.body.number).toBe(3);
    expect(res.body.orderLines.length).toBe(1);
  });
});
