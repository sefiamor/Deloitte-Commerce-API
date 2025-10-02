module.exports = class AppError extends Error {
  status;
  body;

  constructor(status, body) {
    super(body);
    this.status = status;
    this.body = body;
  }

  static badRequest(message) {
    if (!message) return new AppError(400, 'Bad Request');
    else return new AppError(400, message);
  }

  static forbidden(message) {
    if (!message) return new AppError(403, 'Forbidden');
    else return new AppError(403, message);
  }

  static unauthorized(message) {
    if (!message) return new AppError(401, 'Unauthorized');
    else return new AppError(401, message);
  }

  static notFound(entity, id) {
    if (!entity) return new AppError(404, 'Not Found');
    else if (!id) return new AppError(404, `${entity} not found`);
    else return new AppError(404, `${entity} with id ${id} not found`);
  }
};
