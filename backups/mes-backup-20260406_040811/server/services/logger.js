/**
 * 增强版日志服务 (P3-3 优化)
 * 支持结构化日志、日志级别、日志轮转
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor(options = {}) {
    this.logDir = options.logDir || path.join(__dirname, '../logs');
    this.level = options.level || 'info';
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.maxFiles = options.maxFiles || 30;
    
    // 确保日志目录存在
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
  logDir: path.join(__dirname, '../logs'),
  level: process.env.LOG_LEVEL || 'info'
});

module.exports = { Logger, logger };
