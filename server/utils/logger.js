/**
 * MaxMES 统一日志服务
 * 功能：
 * 1. 结构化日志（JSON 格式）
 * 2. 日志级别（error/warn/info/debug）
 * 3. 自动日志轮转（10MB 触发）
 * 4. 保留最近 30 天日志
 * 5. 错误日志告警
 * 6. 审计日志
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor(options = {}) {
    this.logDir = options.logDir || path.join(__dirname, '../../logs');
    this.level = options.level || 'info';
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.maxFiles = options.maxFiles || 30;
    this.enableAlert = options.enableAlert || false;
    this.alertThreshold = options.alertThreshold || 10; // 错误数量阈值
    
    // 创建日志目录
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    
    // 日志级别
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    
    // 当前日志文件
    this.currentLogFile = this.getLogFilePath();
    this.currentFileSize = this.getCurrentFileSize();
    
    // 错误计数（用于告警）
    this.errorCount = 0;
    this.errorCountResetTime = Date.now();
  }

  getLogFilePath() {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `app-${date}.log`);
  }

  getCurrentFileSize() {
    try {
      if (fs.existsSync(this.currentLogFile)) {
        return fs.statSync(this.currentLogFile).size;
      }
    } catch (error) {
      console.error('Error getting file size:', error);
    }
    return 0;
  }

  // 检查是否需要轮转
  checkRotate() {
    if (this.currentFileSize >= this.maxFileSize) {
      this.rotate();
    }
  }

  // 日志轮转
  rotate() {
    try {
      const files = fs.readdirSync(this.logDir)
        .filter(f => f.startsWith('app-') && f.endsWith('.log'))
        .sort();
      
      // 删除最旧的文件
      while (files.length >= this.maxFiles) {
        const oldest = files.shift();
        fs.unlinkSync(path.join(this.logDir, oldest));
      }
      
      // 重命名当前文件
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedFile = this.currentLogFile.replace('.log', `-${timestamp}.log`);
      fs.renameSync(this.currentLogFile, rotatedFile);
      
      // 重置当前文件
      this.currentLogFile = this.getLogFilePath();
      this.currentFileSize = 0;
      
      console.log(`Log rotated: ${rotatedFile}`);
    } catch (error) {
      console.error('Error rotating logs:', error);
    }
  }

  // 格式化日志
  format(level, message, meta = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta
    };
    
    return JSON.stringify(logEntry);
  }

  // 写入日志
  write(level, message, meta = {}) {
    if (this.levels[level] > this.levels[this.level]) {
      return;
    }

    this.checkRotate();
    
    const logLine = this.format(level, message, meta) + '\n';
    
    try {
      fs.appendFileSync(this.currentLogFile, logLine);
      this.currentFileSize += Buffer.byteLength(logLine);
      
      // 错误计数（用于告警）
      if (level === 'error') {
        this.errorCount++;
        this.checkAlert();
      }
      
      // 同时在控制台输出
      if (process.env.NODE_ENV === 'development') {
        const consoleMethod = level === 'error' ? 'error' : 
                             level === 'warn' ? 'warn' : 'log';
        console[consoleMethod](`[${level.toUpperCase()}] ${message}`, meta);
      }
    } catch (error) {
      console.error('Error writing log:', error);
    }
  }

  // 检查告警
  checkAlert() {
    const now = Date.now();
    // 每分钟重置计数
    if (now - this.errorCountResetTime > 60000) {
      this.errorCount = 0;
      this.errorCountResetTime = now;
    }
    
    // 如果错误数量超过阈值，触发告警
    if (this.errorCount >= this.alertThreshold && this.enableAlert) {
      this.triggerAlert(this.errorCount);
      this.errorCount = 0; // 重置计数
    }
  }

  // 触发告警
  triggerAlert(errorCount) {
    const alertMessage = {
      type: 'LOG_ALERT',
      timestamp: new Date().toISOString(),
      errorCount,
      message: `检测到 ${errorCount} 个错误，请检查日志`
    };
    
    console.error('🚨 LOG ALERT:', alertMessage);
    
    // 写入告警日志
    const alertFile = path.join(this.logDir, 'alerts.log');
    fs.appendFileSync(alertFile, JSON.stringify(alertMessage) + '\n');
    
    // TODO: 可以集成飞书/邮件告警
    // this.sendAlert(alertMessage);
  }

  // 发送告警（可扩展）
  async sendAlert(alertMessage) {
    // 这里可以集成飞书、邮件等告警方式
    console.log('Sending alert:', alertMessage);
  }

  error(message, meta = {}) {
    this.write('error', message, meta);
  }

  warn(message, meta = {}) {
    this.write('warn', message, meta);
  }

  info(message, meta = {}) {
    this.write('info', message, meta);
  }

  debug(message, meta = {}) {
    this.write('debug', message, meta);
  }

  // 审计日志
  audit(action, user, resource, meta = {}) {
    const auditLog = {
      timestamp: new Date().toISOString(),
      type: 'AUDIT',
      action,
      user,
      resource,
      ...meta
    };
    
    const auditFile = path.join(this.logDir, 'audit-' + new Date().toISOString().split('T')[0] + '.log');
    try {
      fs.appendFileSync(auditFile, JSON.stringify(auditLog) + '\n');
    } catch (error) {
      console.error('Error writing audit log:', error);
    }
  }

  // 获取日志统计
  getStats() {
    try {
      const files = fs.readdirSync(this.logDir)
        .filter(f => f.startsWith('app-') && f.endsWith('.log'));
      
      const stats = {
        totalFiles: files.length,
        totalSize: 0,
        oldestFile: null,
        newestFile: null
      };
      
      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stat = fs.statSync(filePath);
        stats.totalSize += stat.size;
        
        if (!stats.oldestFile || stat.mtime < stats.oldestFile.mtime) {
          stats.oldestFile = { name: file, mtime: stat.mtime };
        }
        if (!stats.newestFile || stat.mtime > stats.newestFile.mtime) {
          stats.newestFile = { name: file, mtime: stat.mtime };
        }
      });
      
      return {
        ...stats,
        totalSizeMB: (stats.totalSize / 1024 / 1024).toFixed(2)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  // 清理旧日志
  cleanup(daysToKeep = 30) {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysToKeep);
      
      const files = fs.readdirSync(this.logDir)
        .filter(f => f.startsWith('app-') && f.endsWith('.log'));
      
      let deletedCount = 0;
      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.mtime < cutoff) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      });
      
      return { deletedCount };
    } catch (error) {
      return { error: error.message };
    }
  }
}

// 创建默认实例
const logger = new Logger({
  logDir: path.join(__dirname, '../../logs'),
  level: process.env.LOG_LEVEL || 'info',
  enableAlert: true,
  alertThreshold: 10
});

module.exports = logger;
module.exports.Logger = Logger;

