/**
 * 日志工具 - 结构化日志
 */
const fs = require('fs');
const path = require('path');

// 创建日志目录
const logsDir = path.join(__dirname, '../../logs');
const auditLogsDir = path.join(logsDir, 'audit');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}
if (!fs.existsSync(auditLogsDir)) {
  fs.mkdirSync(auditLogsDir, { recursive: true });
}

class Logger {
  constructor() {
    const today = new Date().toISOString().split('T')[0];
    this.logFile = path.join(logsDir, 'app-' + today + '.log');
    this.errorFile = path.join(logsDir, 'error-' + today + '.log');
    this.auditFile = path.join(auditLogsDir, 'audit-' + today + '.log');
  }

  info(message, data = {}) {
    this._write('INFO', message, data);
  }

  warn(message, data = {}) {
    this._write('WARN', message, data);
  }

  error(message, data = {}) {
    this._write('ERROR', message, data, this.errorFile);
  }

  debug(message, data = {}) {
    if (process.env.NODE_ENV === 'development') {
      this._write('DEBUG', message, data);
    }
  }

  _write(level, message, data, file) {
    file = file || this.logFile;
    const log = JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data
    });
    fs.appendFileSync(file, log + '\n');
    console.log('[' + level + ']', message, data);
  }

  audit(action, userId, username, data = {}) {
    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'AUDIT',
      action,
      userId,
      username,
      ip: data.ip || 'unknown',
      userAgent: data.userAgent || 'unknown',
      ...data
    });
    fs.appendFileSync(this.auditFile, entry + '\n');
    console.log('[AUDIT]', action, 'by', username, data);
  }

  security(event, data = {}) {
    const today = new Date().toISOString().split('T')[0];
    const securityFile = path.join(logsDir, 'security-' + today + '.log');
    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'SECURITY',
      event,
      ...data
    });
    fs.appendFileSync(securityFile, entry + '\n');
    console.log('[SECURITY]', event, data);
  }
}

module.exports = new Logger();
