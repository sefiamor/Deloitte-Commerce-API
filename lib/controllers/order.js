const express = require('express');

const AppError = require('../errors/app-error');
const Order = require('../model/order');

module.exports = class OrderController {
  router = express.Router();

  constructor() {
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.get('/', this.getOrdersForUser);
    this.router.get('/:orderNumber', this.getOrder);
    this.router.post('/', this.addOrder);
  }

  async addOrder(req, res) {
    const obj = {
      number: (await Order.count({})) + 1,
      user: req.user,
      orderLines: req.body,
    };
    let order = new Order(obj);
    order = await order.save();
    return res.status(200).send(order);
  }

  async getOrdersForUser(req, res) {
    const result = await Order.findByUser(req.user);
    return res.status(200).send(result);
  }

  // BUG: API1:2019 Broken object-level authorization
  // Users should not be able to query any orders other than
  // their own. This method does not validate if the order
  // retrieve actually belongs to the logged in user. The linked
  // user document is also automatically populated. With simple
  // brute-force enumeration of the order number an attacker
  // can access sensitive data of other users.
  // BUG: API-3:2019 Excessive data exposure
  // The linked user's email address is populated in the response.
  // This helps debugging, but in combination with the BOLA vulnerability
  // also leaks account information.
  async getOrder(req, res, next) {
    const result = await Order.findByNumber(parseInt(req.params.orderNumber));
    if (result) return res.status(200).send(result);
    else return next(AppError.notFound('Order'));
  }
};
