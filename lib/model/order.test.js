const User = require('./user');
const Order = require('./order');

const db = require('../../test/database');
const users = require('../../test/users');
const products = require('../../test/products');
const orders = require('../../test/orders');

let email = 'overrillo0@redcross.org';
let user = undefined;

afterAll(async () => {
  await db.dropDb();
});

beforeAll(async () => {
  await db.setUp();
  await users.load();
  await products.load();
  await orders.load();

  user = await User.findByEmail(email);
});

describe('test order model', () => {
  it('should find one order by number', async () => {
    const order = await Order.findByNumber(2);
    expect(order.user.email).toBe(email);
    expect(order.orderLines.length).toBe(2);
  });

  it('should find all orders by user', async () => {
    const orders = await Order.findByUser(user);
    expect(orders[0].user.email).toBe(email);
    expect(orders[0].orderLines.length).toBe(3);
  });
});
