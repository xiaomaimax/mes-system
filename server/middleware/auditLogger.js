const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

/**
 * 审计日志中间件
 * 自动记录用户的操作日志
 * 
 * 用法：
 * router.post('/api/orders',
 *   authenticateToken,
 *   authorize(['production.order.create']),
 *   auditLogger('ORDER_CREATE'),
 *   orderController.create
 * );
 */
function auditLogger(action, options = {}) {
  return async (req, res, next) => {
    // 保存原始的 json 方法
    const originalJson = res.json;
    const startTime = Date.now();
    
    // 拦截响应
    res.json = function(data) {
      // 记录审计日志（异步，不阻塞响应）
      logAudit(req, action, data, options).catch(err => {
        logger.error('审计日志记录失败', { error: err.message });
      });
      
      // 调用原始的 json 方法
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * 记录审计日志
 */
async function logAudit(req, action, responseData, options) {
  try {
    const user = req.user || {};
    const {
      logRequestData = true,
      logResponseData = false,
      sensitiveFields = []
    } = options;
    
    // 准备日志数据
    const logData = {
      userId: user.userId || 0,
      username: user.username || 'anonymous',
      action: action,
      resourceType: options.resourceType,
      resourceId: options.getResourceId ? options.getResourceId(req, responseData) : null,
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent') || '',
      requestData: logRequestData ? sanitizeData(req.body, sensitiveFields) : null,
      responseStatus: responseData?.success ? 200 : 400,
      errorMessage: responseData?.message && !responseData?.success ? responseData.message : null
    };
    
    // 记录日志
    await AuditLog.log(logData);
    
    logger.info('审计日志已记录', {
      action,
      userId: user.userId,
      username: user.username
    });
  } catch (error) {
    logger.error('审计日志记录异常', { error: error.message, action });
  }
}

/**
 * 获取客户端 IP
 */
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         'unknown';
}

/**
 * 脱敏敏感数据
 */
function sanitizeData(data, sensitiveFields) {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  const sanitized = { ...data };
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***';
    }
  });
  
  return sanitized;
}

/**
 * 手动记录审计日志（用于非 HTTP 场景）
 */
async function manualAudit(data) {
  try {
    await AuditLog.log({
      userId: data.userId,
      username: data.username,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      ipAddress: data.ipAddress || 'system',
      userAgent: data.userAgent || 'system',
      requestData: data.requestData,
      responseStatus: data.responseStatus || 200,
      errorMessage: data.errorMessage
    });
  } catch (error) {
    logger.error('手动审计日志记录失败', { error: error.message });
  }
}

module.exports = {
  auditLogger,
  manualAudit
};
