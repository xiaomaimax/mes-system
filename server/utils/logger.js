/**
 * 日志工具 - 使用Winston实现结构化日志
 */

const fs = require('fs');
const path = require('path');

// 创建日志目录
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 简单的日志实现（如果需要完整功能，可升级为Winston）
class Logger {
  constructor() {
    this.logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    this.errorFile = path.join(logsDir, `error-${new Date().toISOString().split('T')[0]}.log`);
  }

  formatLog(level, message, data = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data
    });
  }

  writeLog(file, level, message, data) {
    const logEntry = this.formatLog(level, message, data);
    fs.appendFileSync(file, logEntry + '\n');
    
    // 同时输出到控制台
    const consoleOutput = `[${new Date().toISOString()}] [${level}] ${message}`;
    if (level === 'error') {
      console.error(consoleOutput, data);
    } else if (level === 'warn') {
      console.warn(consoleOutput, data);
    } else {
      console.log(consoleOutput, data);
    }
  }

  info(message, data = {}) {
    this.writeLog(this.logFile, 'INFO', message, data);
  }

  warn(message, data = {}) {
    this.writeLog(this.logFile, 'WARN', message, data);
  }

  error(message, data = {}) {
    this.writeLog(this.errorFile, 'ERROR', message, data);
  }

  debug(message, data = {}) {
    if (process.env.NODE_ENV === 'development') {
      this.writeLog(this.logFile, 'DEBUG', message, data);
    }
  }
}

module.exports = new Logger();
