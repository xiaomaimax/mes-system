/**
 * 监控服务 - 应用性能监控（P2-2 监控优化）
 * 收集性能指标、错误追踪、健康检查
 */

const logger = require('../utils/logger');
const os = require('os');

class MonitorService {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        error: 0,
        avgResponseTime: 0,
        responseTimes: []
      },
      database: {
        queries: 0,
        slowQueries: 0,
        avgQueryTime: 0,
        connectionPoolUsage: 0
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0
      },
      system: {
        memory: 0,
        cpu: 0,
        disk: 0
      },
      errors: []
    };

    this.slowQueryThreshold = 1000; // 慢查询阈值（ms）
    this.maxErrors = 100; // 最多保留的错误数
    this.requestTimestamps = []; // 记录最近 60 秒的请求时间戳
    
    this.init();
  }

  init() {
    // 定时收集系统指标
    setInterval(() => this.collectSystemMetrics(), 30000); // 每 30 秒
    
    // 定时清理旧数据
    setInterval(() => this.cleanup(), 300000); // 每 5 分钟
    
    // 定时检查健康状态
    setInterval(() => this.healthCheck(), 60000); // 每分钟
    
    logger.info('监控服务已启动');
  }

  // 请求中间件 - 记录 API 性能
  requestMonitor() {
    return (req, res, next) => {
      const startTime = Date.now();
      const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // 添加请求 ID 到响应头
      res.setHeader('X-Request-ID', requestId);
      
      // 监听响应完成
      res.on('finish', () => {
        const duration = Date.now() - startTime;
            this.recordRequest({
          method: req.method,
          path: req.path,
          status: res.statusCode,
          duration,
          requestId,
          ip: req.ip
        });
      });

      next();
    };
  }

  // 记录请求
  recordRequest(data) {
    const now = Date.now();
    // 记录请求时间戳（用于 QPS 计算）
    this.requestTimestamps.push(now);
    // 清理超过 60 秒的时间戳
    const sixtySecondsAgo = now - 60000;
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > sixtySecondsAgo);
    
    this.metrics.requests.total++;
    
    if (data.status >= 200 && data.status < 400) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.error++;
    }

    // 记录响应时间（保留最近 1000 个）
    this.metrics.requests.responseTimes.push(data.duration);
    if (this.metrics.requests.responseTimes.length > 1000) {
      this.metrics.requests.responseTimes.shift();
    }

    // 计算平均响应时间
    this.metrics.requests.avgResponseTime = 
      Math.round(this.metrics.requests.responseTimes.reduce((a, b) => a + b, 0) / 
      this.metrics.requests.responseTimes.length);

    // 慢请求告警
    if (data.duration > 2000) {
      logger.warn('慢请求', {
        path: data.path,
        method: data.method,
        duration: data.duration,
        requestId: data.requestId
      });
    }
  }

  // 数据库查询监控
  recordQuery(duration, query = null) {
    this.metrics.database.queries++;
    
    if (duration > this.slowQueryThreshold) {
      this.metrics.database.slowQueries++;
      logger.warn('慢查询', {
        duration,
        query: query ? query.substring(0, 200) : 'unknown',
        threshold: this.slowQueryThreshold
      });
    }

    // 更新平均查询时间
    this.metrics.database.avgQueryTime = 
      Math.round((this.metrics.database.avgQueryTime * (this.metrics.database.queries - 1) + duration) / 
      this.metrics.database.queries);
  }

  // 缓存监控
  recordCacheHit(hit) {
    if (hit) {
      this.metrics.cache.hits++;
    } else {
      this.metrics.cache.misses++;
    }
    
    const total = this.metrics.cache.hits + this.metrics.cache.misses;
    this.metrics.cache.hitRate = total > 0 
      ? ((this.metrics.cache.hits / total) * 100).toFixed(2) 
      : 0;
  }

  // 记录错误
  recordError(error, context = {}) {
    const errorRecord = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context
    };

    this.metrics.errors.push(errorRecord);
    
    // 限制错误数量
    if (this.metrics.errors.length > this.maxErrors) {
      this.metrics.errors.shift();
    }

    logger.error('错误追踪', errorRecord);
  }

  // 收集系统指标
  collectSystemMetrics() {
    try {
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;

      this.metrics.system = {
        memory: {
          total: Math.round(totalMemory / 1024 / 1024),
          used: Math.round(usedMemory / 1024 / 1024),
          free: Math.round(freeMemory / 1024 / 1024),
          usage: ((usedMemory / totalMemory) * 100).toFixed(2)
        },
        cpu: {
          usage: os.loadavg()[0].toFixed(2),
          cores: os.cpus().length
        },
        disk: this.getDiskUsage(),
        uptime: process.uptime()
      };

      logger.debug('系统指标已收集', this.metrics.system);
    } catch (error) {
      logger.error('收集系统指标失败', { error: error.message });
    }
  }

  // 获取磁盘使用情况
  getDiskUsage() {
    // 简单实现，生产环境可使用 node-df 等库
    return {
      total: 'unknown',
      used: 'unknown',
      available: 'unknown'
    };
  }

  // 健康检查
  async healthCheck() {
    const health = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      checks: {
        api: 'ok',
        database: 'ok',
        cache: 'ok',  // 缓存服务正常（NodeCache）
        memory: 'ok',
        errorRate: 'ok',
        responseTime: 'ok'
      },
      metrics: this.getMetrics()
    };

    // 检查内存使用
    if (parseFloat(this.metrics.system.memory.usage) > 90) {
      health.checks.memory = 'warning';
      health.status = 'warning';
      logger.warn('内存使用率过高', { usage: this.metrics.system.memory.usage });
    }

    // 检查错误率
    const errorRate = this.metrics.requests.total > 0
      ? (this.metrics.requests.error / this.metrics.requests.total * 100)
      : 0;
    
    if (errorRate > 5) {
      health.checks.errorRate = 'warning';
      health.status = 'warning';
      logger.warn('错误率过高', { errorRate: errorRate.toFixed(2) });
    }

    // 检查响应时间
    if (this.metrics.requests.avgResponseTime > 1000) {
      health.checks.responseTime = 'warning';
      health.status = 'warning';
      logger.warn('平均响应时间过长', { avgResponseTime: this.metrics.requests.avgResponseTime });
    }

    // 记录健康状态
    logger.info('健康检查', { status: health.status, checks: health.checks });

    return health;
  }

  // 获取监控指标
  getMetrics() {
    const totalRequests = this.metrics.requests.total;
    const totalResponseTime = this.metrics.requests.responseTimes.reduce((a, b) => a + b, 0);
    const successRate = totalRequests > 0 
      ? ((this.metrics.requests.success / totalRequests) * 100).toFixed(2) + '%'
      : '0%';
    
    return {
      performance: {
        totalRequests: totalRequests,
        successfulRequests: this.metrics.requests.success,
        failedRequests: this.metrics.requests.error,
        totalResponseTime: totalResponseTime,
        avgResponseTime: this.metrics.requests.avgResponseTime,
        minResponseTime: this.metrics.requests.responseTimes.length > 0 
          ? Math.min(...this.metrics.requests.responseTimes) 
          : 0,
        maxResponseTime: this.metrics.requests.responseTimes.length > 0 
          ? Math.max(...this.metrics.requests.responseTimes) 
          : 0,
        qps: this.calculateQPS(),
        successRate: successRate
      },
      errors: {
        count: this.metrics.errors.length
      },
      database: this.metrics.database,
      cache: this.metrics.cache,
      system: this.metrics.system,
      recentErrors: this.metrics.errors.slice(-10),
      topErrors: []
    };
  }

  // 计算 QPS（每秒查询数）
  calculateQPS() {
    // 基于最近 60 秒的请求数计算实时 QPS
    const now = Date.now();
    const sixtySecondsAgo = now - 60000;
    const recentRequests = this.requestTimestamps.filter(ts => ts > sixtySecondsAgo);
    return (recentRequests.length / 60).toFixed(2);
  }

  // 清理旧数据
  cleanup() {
    // 保留最近 100 个响应时间
    if (this.metrics.requests.responseTimes.length > 100) {
      this.metrics.requests.responseTimes = 
        this.metrics.requests.responseTimes.slice(-100);
    }

    logger.debug('监控数据已清理');
  }

  // 导出监控报告
  generateReport() {
    const metrics = this.getMetrics();
    
    return {
      generatedAt: new Date().toISOString(),
      uptime: process.uptime(),
      summary: {
        totalRequests: metrics.requests.total,
        successRate: metrics.requests.total > 0 
          ? ((metrics.requests.success / metrics.requests.total) * 100).toFixed(2) 
          : 100,
        avgResponseTime: metrics.requests.avgResponseTime,
        qps: metrics.requests.qps,
        cacheHitRate: metrics.cache.hitRate,
        slowQueries: metrics.database.slowQueries,
        recentErrors: metrics.recentErrors.length
      },
      system: metrics.system,
      recommendations: this.generateRecommendations(metrics)
    };
  }

  // 生成优化建议
  generateRecommendations(metrics) {
    const recommendations = [];

    if (parseFloat(metrics.cache.hitRate) < 50) {
      recommendations.push({
        type: 'cache',
        priority: 'medium',
        message: '缓存命中率较低，建议增加缓存策略'
      });
    }

    if (metrics.database.slowQueries > 10) {
      recommendations.push({
        type: 'database',
        priority: 'high',
        message: '检测到多个慢查询，建议优化 SQL 或添加索引'
      });
    }

    if (parseFloat(metrics.system.memory.usage) > 80) {
      recommendations.push({
        type: 'system',
        priority: 'high',
        message: '内存使用率较高，建议检查内存泄漏或增加资源'
      });
    }

    return recommendations;
  }
}

const monitorService = new MonitorService();

module.exports = {
  MonitorService,
  monitorService
};
