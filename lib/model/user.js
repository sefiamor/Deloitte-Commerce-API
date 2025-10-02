const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new Schema({
  email: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  role: { type: String },
  first_name: { type: String },
  last_name: { type: String },
  address: { type: String },
  city: { type: String },
  country: { type: String },
  phone: { type: String },
  credit_card: { type: String },
  one_time_password: { type: String },
});

user.pre('save', async function (next) {
  // hash the password if it was changed
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }

  // hash the OTP if it was changed
  if (this.isModified('one_time_password')) {
    // OTP is an optional property, only added when requestion a password reset.
    // It is removed once the password is reset.
    if (this.one_time_password) {
      const salt = await bcrypt.genSalt();
      this.one_time_password = await bcrypt.hash(this.one_time_password, salt);
    }
  }

  next();
});

user.methods.isAdmin = function () {
  if (this.role && this.role == 'admin') return true;
  else return false;
};

user.methods.isValidPassword = async function (password) {
  const valid = await bcrypt.compare(password, this.password);
  return valid;
};

user.methods.isValidOTP = async function (otp) {
  const valid = await bcrypt.compare(otp, this.one_time_password);
  return valid;
};

user.statics.findByEmail = async function (email) {
  return this.findOne({ email });
};

user.statics.query = async function (page = 1, size = 10) {
  const result = { page, size };

  result.total = await this.count({});

  result.users = await this.find()
    .sort({ email: 1 })
    .limit(size)
    .skip((page - 1) * size)
    .exec();

  return result;
};

module.exports = mongoose.model('user', user);
