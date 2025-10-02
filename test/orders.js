const Order = require('../lib/model/order');
const Product = require('../lib/model/product');
const User = require('../lib/model/user');

// Load order documents for unit testing.
const load = async () => {
  const p9 = await Product.findByNumber(9);
  const p13 = await Product.findByNumber(13);
  const p14 = await Product.findByNumber(14);

  const user = await User.findByEmail('overrillo0@redcross.org');

  const o1 = new Order({
    number: 1,
    user,
    orderLines: [
      { product: p9, quantity: 5 },
      { product: p13, quantity: 3 },
      { product: p14, quantity: 2 },
    ],
  });
  await o1.save();

  const o2 = new Order({
    number: 2,
    user,
    orderLines: [
      { product: p13, quantity: 2 },
      { product: p14, quantity: 3 },
    ],
  });
  await o2.save();
};

module.exports = { load };
