const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const actuator = require('express-actuator');
const mongoose = require('mongoose');
const passport = require('passport');

const httpLogger = require('./logging/http-logger');
const logger = require('./logging/logger');

const AdminController = require('./controllers/admin');
const AuthController = require('./controllers/auth');
const OrderController = require('./controllers/order');
const ProductController = require('./controllers/product');
const UserController = require('./controllers/user');
const AppError = require('./errors/app-error');

module.exports = class App {
  constructor(port = 3333) {
    this.port = port;
    this.app = express();

    this.setupDatabase();
    this.setupMiddleware();
    this.setupControllers();
    this.setupErrorHandler();

    try {
      // Start the Express HTTP server.
      this.server = this.app.listen(port, () => {
        logger.debug(`DELOITTE COMMERCE API listening on port ${port}`);
      });

      if (!this.isDev()) {
        // Properly close HTTP connections if not running as a dev environment.
        // Ignore SIGTERM when running with nodemon in a dev environment.
        process.on('SIGTERM', () => {
          logger.debug('SIGTERM signal received: closing HTTP server');
          if (this.server)
            this.server.close(() => {
              logger.debug('HTTP server closed');
            });
        });
      }
    } catch (err) {
      logger.error(err);
    }
  }

  isDev() {
    const env = process.env.NODE_ENV || 'development';
    return env === 'development';
  }

  setupControllers() {
    this.app.options('*', cors());

    // Provides the /info, /metrics and /health endpoints.
    this.app.use(actuator());

    // Serve the image files for products from the public folder.
    this.app.use(express.static('public'));

    // Administrator functions.
    this.app.use(
      '/admin',
      // Authentication required.
      passport.authenticate('jwt', { session: false }),
      // User must have admin role.
      (req, res, next) => {
        logger.debug(JSON.stringify(req.user));
        if (req.user && req.user.role && req.user.role === 'admin')
          return next();
        else return next(AppError.unauthorized('Admin privileges required'));
      },
      new AdminController().router,
    );

    // Authorization functions. Publicly accessible.
    this.app.use('/auth', new AuthController().router);

    // Order resources.
    this.app.use(
      '/order',
      // Authentication required
      passport.authenticate('jwt', { session: false }),
      new OrderController().router,
    );

    // Product resources. Publicly accessible.
    this.app.use('/product', new ProductController().router);

    // User resources.
    this.app.use(
      '/user',
      // Authentication required.
      passport.authenticate('jwt', { session: false }),
      new UserController().router,
    );
  }

  async setupDatabase() {
    const host = process.env.MONGODB_HOST || 'localhost';
    const port = process.env.MONGODB_PORT || '27017';
    const database = process.env.MONGODB_DATABASE || 'deloitte';
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
  }

  setupErrorHandler() {
    // eslint-disable-next-line no-unused-vars
    this.app.use((err, req, res, next) => {
      // Check if known AppError, if not set as Internal Server Error.
      const status = err.status || 500;
      const message = err.body || 'Internal Server Error';

      // Log to error output if not a known error.
      if (err.status == 500) logger.error(JSON.stringify(err));

      res.status(status).send({ status, message });
    });
  }

  setupMiddleware() {
    // Register morgan HTTP logging middleware.
    this.app.use(httpLogger);

    // Automatically parse payloads as json.
    this.app.use(bodyParser.json());

    // Automatically parse urlencoded requests.
    this.app.use(bodyParser.urlencoded({ extended: true }));

    this.app.use(passport.initialize());

    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
      );
      next();
    });
  }
};
