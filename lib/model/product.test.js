const Product = require('./product');

const db = require('../../test/database');
const products = require('../../test/products');

afterAll(async () => {
  await db.dropDb();
});

beforeAll(async () => {
  await db.setUp();
  await products.load();
});

describe('test product model', () => {
  it('should find a product', async () => {
    const product = await Product.findByNumber(3);
    expect(product.title).toBe('Mens Cotton Jacket');
  });

  it('should fail to find a product', async () => {
    try {
      await Product.findByNumber(22);
    } catch (err) {
      expect(err.status).toBe(404);
      expect(err.body).toBe('Product with id 22 not found');
    }
  });

  it('should query products', async () => {
    let result = await Product.query();
    expect(result.total).toBe(20);
    expect(result.products.length).toBe(10);

    result = await Product.query(2, 5);
    expect(result.total).toBe(20);
    expect(result.products.length).toBe(5);

    result = await Product.query(5, 5);
    expect(result.total).toBe(20);
    expect(result.products.length).toBe(0);
  });
});
