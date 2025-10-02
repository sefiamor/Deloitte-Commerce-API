const express = require('express');

const User = require('../model/user');

const AppError = require('../errors/app-error');

// This controller provides admin functions that
// can update user info for other users.
module.exports = class AdminController {
  router = express.Router();

  constructor() {
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.delete('/user/:email', this.deleteUser);
    this.router.get('/user', this.getUsers);
    this.router.get('/user/:email', this.getUser);
    this.router.post('/user', this.addUser);
    this.router.put('/user', this.updateUser);
  }

  async addUser(req, res) {
    let user = new User(req.body);
    user = await user.save();
    return res.status(200).send(user);
  }

  async deleteUser(req, res, next) {
    const user = await User.findByEmail(req.params.email);
    if (user) {
      await User.deleteOne({ email: req.params.email });
      return res.status(200).send();
    } else return next(AppError.notFound('User'));
  }

  // BUG: API-3:2019 Excessive data exposure
  // The user document contains sensitive data that
  // is accessible via this API for administrators.
  // Administrators should only be able to access
  // those fields required for the operation.
  async getUser(req, res, next) {
    const user = await User.findByEmail(req.params.email);
    if (user) {
      return res.status(200).send(user);
    } else return next(AppError.notFound('User'));
  }

  // BUG: API-3:2019 Excessive data exposure
  // The user document contains sensitive data that
  // is accessible via this API for administrators.
  // Administrators should only be able to access
  // those fields required for the operation.
  async getUsers(req, res) {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const result = await User.query(page, size);
    return res.status(200).send(result);
  }

  async updateUser(req, res, next) {
    const body = req.body;
    let user = await User.findByEmail(body.email);
    if (user) {
      if (body.password) user.password = body.password;
      if (body.role) user.role = body.role;
      if (body.first_name) user.first_name = body.first_name;
      if (body.last_name) user.last_name = body.last_name;
      if (body.address) user.address = body.address;
      if (body.city) user.city = body.city;
      if (body.country) user.country = body.country;
      if (body.phone) user.phone = body.phone;
      user = await user.save();
      return res.status(200).send(user);
    } else return next(AppError.notFound('User'));
  }
};
