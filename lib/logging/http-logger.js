const morgan = require('morgan');
const logger = require('./logger');

const stream = {
  write: (message) => logger.http(message),
};

const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env !== 'development';
};

const replace = (key, value) => {
  if (key.includes('password')) value = value.toString().replace(/./g, '*');
  return value;
};

// Custom token for logging query parameters.
morgan.token('params', (req) => {
  return JSON.stringify(req.params, replace, 2);
});

// Custom token for logging HTTP headers.
morgan.token('headers', (req) => {
  return JSON.stringify(req.headers, replace, 2);
});

// Custom token for logging HTTP request payloads.
morgan.token('reqBody', (req) => {
  return JSON.stringify(req.body, replace, 2);
});

const httpLogger = morgan(
  ':remote-addr :method :url code: :status size: :res[content-length] - :response-time ms \nparams: :params \nheaders: :headers \nrequest: :reqBody',
  { stream, skip },
);

module.exports = httpLogger;
