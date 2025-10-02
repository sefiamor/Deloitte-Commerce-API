const mongoose = require('mongoose');
const logger = require('./lib/logging/logger');

const Order = require('./lib/model/order');
const Product = require('./lib/model/product');
const User = require('./lib/model/user');

let orderNumber = 1;

const random = (limit) => {
  return Math.floor(Math.random() * limit + 1);
};

const connect = async () => {
  const host = process.env.MONGODB_HOST || 'localhost';
  const port = process.env.MONGODB_PORT || '27017';
  const database = process.env.MONGODB_DATABASE || 'deloittecommerce';
  const username = process.env.MONGODB_USERNAME || 'deloitte-commerce-api';
  const password = process.env.MONGODB_PASSWORD || 'Deloitte-Pass';

  mongoose.set('strictQuery', false);

  mongoose.connect(
    `mongodb://${username}:${password}@${host}:${port}/${database}`,
  );

  mongoose.connection.on('error', (err) => {
    logger.error('Failed to connect to MongoDB');
    logger.error(err);
    process.exit(1);
  });

  mongoose.connection.on('open', () => {
    logger.debug(`MongoDB connected @ ${host}:${port}/${database}`);
  });

  mongoose.Promise = global.Promise;
};

const generate = async () => {
  let result = await User.query();
  let page = result.page;
  let count = result.total;
  let pages = Math.ceil(count / 10);

  while (page <= pages) {
    const users = result.users;
    logger.info(
      `Generating orders for ${users.length} users on page ${page} of ${pages}`,
    );

    let promises = [];
    users.forEach((user) => {
      if (user.role != 'admin') promises.push(generateOrders(user));
      else logger.info(`Skipping admin user ${user.email}`);
    });

    await Promise.all(promises);

    page++;
    result = await User.query(page);
  }
};

const generateOrders = async (user) => {
  const numOrders = random(5);
  for (let o = 0; o < numOrders; o++) {
    const order = {
      number: orderNumber++,
      user,
      orderLines: [],
    };

    const numProducts = random(3);
    for (let p = 0; p < numProducts; p++) {
      const number = random(20);
      const quantity = random(5);
      const product = await Product.findByNumber(number);
      order.orderLines.push({ product, quantity });
    }

    new Order(order).save();
  }
};

const run = async () => {
  await connect();
  await generate();
  await mongoose.disconnect();
};

run();
