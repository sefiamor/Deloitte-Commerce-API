const User = require('./user');

const db = require('../../test/database');
const users = require('../../test/users');

afterAll(async () => {
  await db.dropDb();
});

beforeAll(async () => {
  await db.setUp();
  await users.load();
});

describe('test user model', () => {
  it('should find a user by their email address', async () => {
    const user = await User.findByEmail('overrillo0@redcross.org');
    expect(user.first_name).toBe('Odille');
  });

  it('should check the user privileges', async () => {
    const user = await User.findByEmail('overrillo0@redcross.org');
    expect(user.isAdmin()).toBeFalsy();

    const admin = await User.findByEmail('admin@deloittecommerce.api');
    expect(admin.isAdmin()).toBeTruthy();
  });

  it('should check the user password', async () => {
    const user = await User.findByEmail('overrillo0@redcross.org');

    let valid = await user.isValidPassword('invalidpassword');
    expect(valid).toBeFalsy();

    valid = await user.isValidPassword('QkYvxNZUiP');
    expect(valid).toBeTruthy();
  });

  it('should query users', async () => {
    let result = await User.query();
    expect(result.total).toBe(11);
    expect(result.users.length).toBe(10);

    result = await User.query(2, 5);
    expect(result.total).toBe(11);
    expect(result.users.length).toBe(5);

    result = await User.query(3, 5);
    expect(result.total).toBe(11);
    expect(result.users.length).toBe(1);
  });
});
