const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rating = new Schema({
  rate: { type: Number },
  count: { type: Number },
});

const product = new Schema({
  number: { type: Number, required: true, index: { unique: true } },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  category: { type: String },
  image: { type: String },
  rating: { type: rating },
});

product.statics.findByNumber = async function (number) {
  return this.findOne({ number });
};

product.statics.query = async function (page = 1, size = 10) {
  const result = { page, size };

  result.total = await this.count({});

  result.products = await this.find()
    .sort({ number: 1 })
    .limit(size)
    .skip((page - 1) * size)
    .exec();

  return result;
};

module.exports = mongoose.model('product', product);
