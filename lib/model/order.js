const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = mongoose.Types;

const orderLine = new Schema({
  product: { type: Types.ObjectId, ref: 'product' },
  quantity: { type: Number },
  total: { type: Number },
});

const order = new Schema({
  number: { type: Number, required: true, index: { unique: true } },
  user: { type: Types.ObjectId, ref: 'user' },
  date: { type: Date },
  total: { type: Number },
  orderLines: [orderLine],
});

order.pre('save', async function (next) {
  if (this.isNew) this.date = new Date();

  this.total = 0;
  this.orderLines.forEach((line) => {
    line.total = (line.product.price * line.quantity).toFixed(2);
    this.total += parseFloat(line.total);
  });
  this.total = this.total.toFixed(2);

  next();
});

order.statics.findByNumber = async function (number) {
  return this.findOne({ number })
    .populate('user', 'email')
    .populate({
      path: 'orderLines',
      populate: {
        path: 'product',
      },
    });
};

order.statics.findByUser = async function (user) {
  return this.find({ user })
    .populate('user', 'email')
    .populate({
      path: 'orderLines',
      populate: {
        path: 'product',
      },
    });
};

module.exports = mongoose.model('order', order);
