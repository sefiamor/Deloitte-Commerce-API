const express = require('express');

const AppError = require('../errors/app-error');
const User = require('../model/user');
const logger = require('../logging/logger');

module.exports = class UserController {
  router = express.Router();

  constructor() {
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.delete('/', this.deleteUser);
    this.router.get('/', this.getUser);
    this.router.put('/', this.updateUser);
  }

  async deleteUser(req, res, next) {
    // Delete the active user
    const body = req.body;
    if (req.user.email != body.email) {
      logger.warn('Attempt to update another user');
      return next(AppError.forbidden());
    }

    const user = await User.findByEmail(body.email);
    if (user) {
      await User.deleteOne({ email: body.email });
      return res.status(200).send();
    } else return AppError.notFound('User');
  }

  async getUser(req, res) {
    // Find the active user's details
    const user = await User.findByEmail(req.user.email);
    if (user) return res.status(200).send(user);
    else return AppError.notFound('User');
  }

  // BUG: API6:2019 Mass assignment
  // A lack of input validation enables you to assign
  // yourself admin privileges (role = 'admin'). Once
  // you have admin privileges you have access to all
  // user data.
  async updateUser(req, res, next) {
    // Update the active user's details
    const body = req.body;

    if (req.user.email != body.email) {
      logger.warn('Attempt to update another user');
      return next(AppError.forbidden());
    }

    let user = await User.findByEmail(body.email);
    if (user) {
      if (typeof body.password !== 'undefined') user.password = body.password;
      if (typeof body.role !== 'undefined') user.role = body.role;
      if (typeof body.first_name !== 'undefined')
        user.first_name = body.first_name;
      if (typeof body.last_name !== 'undefined')
        user.last_name = body.last_name;
      if (typeof body.address !== 'undefined') user.address = body.address;
      if (typeof body.city !== 'undefined') user.city = body.city;
      if (typeof body.country !== 'undefined') user.country = body.country;
      if (typeof body.phone !== 'undefined') user.phone = body.phone;
      user = await user.save();
      return res.status(200).send(user);
    } else {
      return next(AppError.notFound('User'));
    }
  }
};
