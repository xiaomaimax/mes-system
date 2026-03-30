/**
 * 告警中间件
 * 功能：监控 API 性能，超过阈值发送告警
 */

const { FeishuAlert } = require('../services/feishuAlert');

const alertService = new FeishuAlert({
  enabled: process.env.FEISHU_ALERT_ENABLED !== 'false',
  webhookUrl: process.env.FEISHU_WEBHOOK_URL
});

/**
 * API 性能监控中间件
 * @param {number} threshold - 响应时间阈值（毫秒）
 */
function performanceMonitor(threshold = 2000) {
  return async (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      
      // 响应时间超过阈值
      if (duration > threshold) {
        alertService.sendPerformanceAlert({
          api: `${req.method} ${req.originalUrl}`,
          responseTime: duration,
          qps: 0,
          errorRate: 0,
          threshold
        });
      }
    });

    next();
  };
}

/**
 * 错误监控中间件
 */
function errorMonitor() {
  return async (err, req, res, next) => {
    // 发送错误告警
    await alertService.sendErrorAlert(err);
    next(err);
  };
}

module.exports = {
  performanceMonitor,
  errorMonitor,
  alertService
};
