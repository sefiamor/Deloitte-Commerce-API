const request = require('supertest');

const login = async (app, email, password) => {
  const res = await request(app).post('/auth/login').send({
    email,
    password,
  });
  return res.body.token;
};

module.exports = { login };
