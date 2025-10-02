const express = require('express');
const request = require('supertest');

const ProductController = require('./product');

const app = new express();
app.use('/', new ProductController().router);

const db = require('../../test/database');
const products = require('../../test/products');

afterAll(async () => {
  await db.dropDb();
});

beforeAll(async () => {
  await db.setUp();
  await products.load();
});

describe('test product controller', () => {
  it('should return the first page of products', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.size).toBe(10);
    expect(res.body.total).toBe(20);
    expect(res.body.products.length).toBe(10);
  });

  it('should return the second page of 5 products', async () => {
    const res = await request(app).get('/').query({ page: 2, size: 5 });
    expect(res.statusCode).toBe(200);
    expect(res.body.page).toBe(2);
    expect(res.body.size).toBe(5);
    expect(res.body.total).toBe(20);
    expect(res.body.products.length).toBe(5);
  });

  it('should return an empty third page', async () => {
    const res = await request(app).get('/').query({ page: 3 });
    expect(res.statusCode).toBe(200);
    expect(res.body.page).toBe(3);
    expect(res.body.size).toBe(10);
    expect(res.body.total).toBe(20);
    expect(res.body.products.length).toBe(0);
  });

  it('should find one product by number', async () => {
    const res = await request(app).get('/12');
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe(
      'WD 4TB Gaming Drive Works with Playstation 4 Portable External Hard Drive',
    );
  });

  it('should fail to find a product by number', async () => {
    const res = await request(app).get('/99');
    expect(res.statusCode).toBe(404);
  });
});
