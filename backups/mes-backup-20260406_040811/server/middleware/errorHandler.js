/**
 * 集中式错误处理中间件
 * 统一处理所有应用错误
 */

const logger = require('../utils/logger');

/**
 * 自定义错误类
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * 验证错误
 */
class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

/**
 * 认证错误
 */
class AuthenticationError extends AppError {
  constructor(message = '认证失败') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * 授权错误
 */
class AuthorizationError extends AppError {
  constructor(message = '没有权限访问此资源') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * 资源不存在错误
 */
class NotFoundError extends AppError {
  constructor(message = '资源不存在') {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * 数据库错误
 */
class DatabaseError extends AppError {
  constructor(message = '数据库操作失败', originalError = null) {
    super(message, 500, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
}

/**
 * 业务逻辑错误
 */
class BusinessError extends AppError {
  constructor(message, statusCode = 400) {
    super(message, statusCode, 'BUSINESS_ERROR');
  }
}

/**
 * 错误处理中间件
 */
function errorHandler(err, req, res, next) {
  // 设置默认值
  let error = err;
  let statusCode = 500;
  let message = '服务器内部错误';
  let code = 'INTERNAL_ERROR';
  let errors = [];

  // 处理自定义错误
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
    errors = err.errors || [];
  }
  // 处理Sequelize验证错误
  else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = '数据验证失败';
    code = 'VALIDATION_ERROR';
    errors = err.errors.map(e => e.message);
  }
  // 处理Sequelize唯一约束错误
  else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = '数据已存在';
    code = 'DUPLICATE_ERROR';
    errors = err.errors.map(e => `${e.path}已存在`);
  }
  // 处理Sequelize外键错误
  else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = '关联数据不存在';
    code = 'FOREIGN_KEY_ERROR';
  }
  // 处理JSON解析错误
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'JSON格式错误';
    code = 'JSON_ERROR';
  }
  // 处理其他错误
  else {
    message = err.message || '服务器内部错误';
  }

  // 记录错误
  const errorLog = {
    code,
    message,
    statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  };

  if (statusCode >= 500) {
    logger.error(message, {
      ...errorLog,
      stack: err.stack,
      originalError: err.originalError?.message
    });
  } else {
    logger.warn(message, errorLog);
  }

  // 返回错误响应
  const response = {
    success: false,
    code,
    message,
    timestamp: new Date().toISOString()
  };

  if (errors.length > 0) {
    response.errors = errors;
  }

  // 开发环境返回堆栈跟踪
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

/**
 * 异步错误包装器
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404处理中间件
 */
function notFoundHandler(req, res, next) {
  const error = new NotFoundError(`路由 ${req.method} ${req.path} 不存在`);
  next(error);
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  BusinessError,
  errorHandler,
  asyncHandler,
  notFoundHandler
};
