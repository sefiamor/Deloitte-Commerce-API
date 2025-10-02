// Configure the environment.
// Environment variables defined in .env file.
const dotenv = require('dotenv');
dotenv.config();

// Launch the DELOITTE COMMERCE API app.
const App = require('./lib/app');
new App(process.env.DELOITTE_COMMERCE_API_PORT);
