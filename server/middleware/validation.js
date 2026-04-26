/**
 * 输入验证中间件
 * 为所有API路由提供统一的输入验证
 */

const logger = require('../utils/logger');

/**
 * 验证规则定义
 */
const validationRules = {
  // 用户相关
  username: {
    required: true,
    type: 'string',
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_-]+$/,
    message: '用户名必须是3-50个字符，只能包含字母、数字、下划线和连字符'
  },
  password: {
    required: true,
    type: 'string',
    minLength: 6,
    maxLength: 100,
    message: '密码必须至少6个字符'
  },
  email: {
    required: true,
    type: 'string',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '请输入有效的邮箱地址'
  },
  // 生产相关
  order_number: {
    required: true,
    type: 'string',
    maxLength: 50,
    message: '订单号不能为空，最多50个字符'
  },
  product_code: {
    required: true,
    type: 'string',
    maxLength: 50,
    message: '产品编码不能为空'
  },
  planned_quantity: {
    required: true,
    type: 'number',
    min: 1,
    message: '计划数量必须大于0'
  },
  // 通用
  page: {
    type: 'number',
    min: 1,
    default: 1,
    message: '页码必须大于0'
  },
  limit: {
    type: 'number',
    min: 1,
    max: 100,
    default: 10,
    message: '每页数量必须在1-100之间'
  }
};

/**
 * 验证单个字段
 */
function validateField(value, rule, fieldName) {
  // 检查必填
  if (rule.required && (value === undefined || value === null || value === '')) {
    return { valid: false, message: `${fieldName}${rule.message || '不能为空'}` };
  }

  // 如果不必填且为空，则跳过验证
  if (!rule.required && (value === undefined || value === null || value === '')) {
    return { valid: true };
  }

  // 检查类型
  if (rule.type && typeof value !== rule.type) {
    return { valid: false, message: `${fieldName}必须是${rule.type}类型` };
  }

  // 检查最小长度
  if (rule.minLength && value.length < rule.minLength) {
    return { valid: false, message: `${fieldName}最少${rule.minLength}个字符` };
  }

  // 检查最大长度
  if (rule.maxLength && value.length > rule.maxLength) {
    return { valid: false, message: `${fieldName}最多${rule.maxLength}个字符` };
  }

  // 检查最小值
  if (rule.min !== undefined && value < rule.min) {
    return { valid: false, message: `${fieldName}最小值为${rule.min}` };
  }

  // 检查最大值
  if (rule.max !== undefined && value > rule.max) {
    return { valid: false, message: `${fieldName}最大值为${rule.max}` };
  }

  // 检查正则表达式
  if (rule.pattern && !rule.pattern.test(value)) {
    return { valid: false, message: rule.message || `${fieldName}格式不正确` };
  }

  return { valid: true };
}

/**
 * 验证请求数据
 */
function validateRequest(data, rules) {
  const errors = [];

  for (const [fieldName, rule] of Object.entries(rules)) {
    const value = data[fieldName];
    const result = validateField(value, rule, fieldName);
    
    if (!result.valid) {
      errors.push(result.message);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 创建验证中间件
 */
function createValidationMiddleware(rules) {
  return (req, res, next) => {
    const data = { ...req.body, ...req.query, ...req.params };
    const result = validateRequest(data, rules);

    if (!result.valid) {
      logger.warn('请求验证失败', {
        path: req.path,
        method: req.method,
        errors: result.errors
      });
      
      return res.status(400).json({
        success: false,
        message: '请求参数验证失败',
        errors: result.errors
      });
    }

    next();
  };
}

/**
 * 清理和转义输入
 */
function sanitizeInput(input) {
  if (typeof input === 'string') {
    // 移除危险字符
    return input
      .replace(/[<>\"']/g, '')
      .trim();
  }
  return input;
}

/**
 * 清理请求数据
 */
function sanitizeRequest(req, res, next) {
  // 清理body
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      req.body[key] = sanitizeInput(req.body[key]);
    }
  }

  // 清理query
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      req.query[key] = sanitizeInput(req.query[key]);
    }
  }

  next();
}

module.exports = {
  validationRules,
  validateRequest,
  createValidationMiddleware,
  sanitizeInput,
  sanitizeRequest
};
