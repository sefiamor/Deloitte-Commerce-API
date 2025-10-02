const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const User = require('../model/user');
const AppError = require('../errors/app-error');
const logger = require('../logging/logger');

const secret = process.env.DELOITTE_COMMERCE_API_SECRET_KEY || 'Deloitte-Pass';

module.exports = class AuthController {
  router = express.Router();

  constructor() {
    this.setupPassport();
    this.setupRoutes();
  }

  setupRoutes() {
    // BUG: API3:2019 Excessive data exposure
    // The payload for the JWT token is the user object,
    // including all of its properties. The payload contains
    // personally identifiable information (PII) as well as
    // the hashed password.
    // In theory this token never ends up in an attackers
    // hands, but if it would they have access to sensitive
    // data and have the opportunity to brute-force the
    // password offline.
    this.router.post(
      '/login',
      passport.authenticate('login', { session: false }),
      // If the login succeeds generate a JWT token and
      // send it to the client.
      (req, res) => {
        const token = jwt.sign(req.user, secret, {
          // Issue #15: removed token expiration for a better demo experience
          // expiresIn: '20m',
        });
        return res.status(200).json({ token });
      },
    );

    this.router.post(
      '/signup',
      passport.authenticate('signup', { session: false }),
      // Nothing to do but indicate that the sign up
      // succeeded.
      (req, res) => {
        return res.status(200).send();
      },
    );

    this.router.post('/reset', this.requestPasswordReset);
    this.router.put('/reset', this.validatePasswordReset);
  }

  setupPassport() {
    // BUG: API6:2019 Mass assignment
    // A lack of input validation enables you to sign
    // up with admin privileges (role = 'admin'). Once
    // you have admin privileges you have access to all
    // user data.
    passport.use(
      'signup',
      new LocalStrategy(
        {
          usernameField: 'email',
          passwordField: 'password',
          passReqToCallback: true,
        },
        // Add the new user upon sign up.
        async (req, email, password, done) => {
          let user = await User.findByEmail(email);
          if (!user) {
            let user = new User(req.body);
            user = await user.save();
            return done(null, user);
          } else return done(AppError.badRequest('Account with email exists'));
        },
      ),
    );

    // BUG: API7:2019 Security misconfiguration
    // The login function returns verbose error messages enabling
    // attackers to understand the difference between an account
    // that does not exist and a password that is incorrect.
    // This makes it easier for attackers to try lists of compromised
    // email addresses to find users with accounts. For any accounts
    // that exist they can they proceed with brute-forcing or
    // password spraying.
    passport.use(
      'login',
      new LocalStrategy(
        {
          usernameField: 'email',
          passwordField: 'password',
        },
        // Verify the user credentials upon login.
        async (email, password, done) => {
          const user = await User.findByEmail(email);
          if (user)
            if (await user.isValidPassword(password)) {
              return done(null, user.toJSON());
            } else return done(AppError.unauthorized('Wrong password'));
          else done(AppError.unauthorized('Wrong email address'));
        },
      ),
    );

    passport.use(
      new JWTStrategy(
        {
          secretOrKey: secret,
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        },
        // No extra action after JWT validation.
        // You could check if the user still exists, but
        // here we asume it does. Tokens are only valid for
        // 20 minutes.
        async (user, done) => {
          return done(null, user);
        },
      ),
    );
  }

  async requestPasswordReset(req, res, next) {
    const user = await User.findByEmail(req.body.email);
    if (user) {
      user.one_time_password = Math.floor(
        Math.random() * 9000 + 1000,
      ).toString();
      logger.debug(`email: ${user.email}, otp = ${user.one_time_password}`);
      await user.save();
      return res.status(200).send();
    } else return next(AppError.notFound('User'));
  }

  // BUG: API4:2019 Lack of resources or rate limiting
  // During their reconnaissance an attacker can easily discover that
  // the one-time passwords are a four digit code. If they can discover
  // valid email addresses, they can brute force the password reset as
  // there is no rate limiting on the validation process.
  async validatePasswordReset(req, res, next) {
    const user = await User.findByEmail(req.body.email);
    const otp = req.body.one_time_password.toString();

    const valid = await user.isValidOTP(otp);
    if (valid) {
      user.password = req.body.password;
      user.one_time_password = undefined;
      await user.save();
      return res.status(200).send();
    } else return next(AppError.unauthorized('Invalid one-time password'));
  }
};
