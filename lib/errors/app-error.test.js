const AppError = require('./app-error');

describe('test app error class', () => {
  it('should return a default 400 error', () => {
    const err = AppError.badRequest();
    expect(err.status).toBe(400);
    expect(err.body).toBe('Bad Request');
  });

  it('should return a 400 error with custom message', () => {
    const err = AppError.badRequest('custom message');
    expect(err.status).toBe(400);
    expect(err.body).toBe('custom message');
  });

  it('should return a default 401 error', () => {
    const err = AppError.unauthorized();
    expect(err.status).toBe(401);
    expect(err.body).toBe('Unauthorized');
  });

  it('should return a 401 error with custom message', () => {
    const err = AppError.unauthorized('custom message');
    expect(err.status).toBe(401);
    expect(err.body).toBe('custom message');
  });

  it('should return a default 403 error', () => {
    const err = AppError.forbidden();
    expect(err.status).toBe(403);
    expect(err.body).toBe('Forbidden');
  });

  it('should return a 403 error with custom message', () => {
    const err = AppError.forbidden('custom message');
    expect(err.status).toBe(403);
    expect(err.body).toBe('custom message');
  });

  it('should return a default 404 error', () => {
    const err = AppError.notFound();
    expect(err.status).toBe(404);
    expect(err.body).toBe('Not Found');
  });

  it('should return a 404 error with entity', () => {
    const err = AppError.notFound('Test');
    expect(err.status).toBe(404);
    expect(err.body).toBe('Test not found');
  });

  it('should return a 404 error with entity and id', () => {
    const err = AppError.notFound('Test', '1');
    expect(err.status).toBe(404);
    expect(err.body).toBe('Test with id 1 not found');
  });
});
