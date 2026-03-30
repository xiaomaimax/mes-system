/**
 * MaxMES 集群模式启动文件
 * 功能：利用多核 CPU，提升并发性能
 */

const cluster = require('cluster');
const os = require('os');
const fs = require('fs');
const path = require('path');

// CPU 核心数
const numCPUs = os.cpus().length;

// 日志文件
const logFile = path.join(__dirname, '../logs/cluster.log');

// 日志函数
function log(message) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}\n`;
  console.log(logLine.trim());
  
  // 写入日志文件
  fs.appendFileSync(logFile, logLine);
}

if (cluster.isMaster) {
  log(`🚀 Master 进程启动 (PID: ${process.pid})`);
  log(`💻 CPU 核心数：${numCPUs}`);
  log(`👷 启动 ${numCPUs} 个 Worker 进程`);
  
  const workers = [];
  
  // 启动 Worker 进程
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    workers.push(worker);
    log(`✅ Worker ${worker.process.pid} 已启动`);
  }
  
  // Worker 退出时重启
  cluster.on('exit', (worker, code, signal) => {
    log(`⚠️ Worker ${worker.process.pid} 退出 (code: ${code}, signal: ${signal})`);
    log(`🔄 重启 Worker...`);
    
    const newWorker = cluster.fork();
    workers[workers.indexOf(worker)] = newWorker;
    log(`✅ 新 Worker ${newWorker.process.pid} 已启动`);
  });
  
  // 优雅关闭
  process.on('SIGTERM', () => {
    log('📴 收到 SIGTERM 信号，优雅关闭...');
    
    Object.keys(cluster.workers).forEach(id => {
      cluster.workers[id].disconnect();
    });
    
    setTimeout(() => {
      process.exit(0);
    }, 5000);
  });
  
} else {
  // Worker 进程
  log(`👷 Worker 进程启动 (PID: ${process.pid})`);
  
  // 加载应用
  const app = require('./app');
  const PORT = process.env.PORT || 5001;
  
  app.listen(PORT, () => {
    log(`✅ Worker ${process.pid} 监听端口 ${PORT}`);
  });
  
  // 优雅关闭
  process.on('SIGTERM', () => {
    log(`📴 Worker ${process.pid} 收到 SIGTERM 信号`);
    process.exit(0);
  });
}
