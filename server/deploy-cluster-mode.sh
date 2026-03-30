#!/bin/bash
#############################################
# MaxMES Node.js 集群模式部署脚本
#############################################

set -e

echo "======================================"
echo "🚀 部署 Node.js 集群模式"
echo "======================================"
echo ""

# 1. 备份当前 app.js
echo "1️⃣  备份当前 app.js..."
cd /opt/mes-system/server
cp app.js app.js.backup
echo "   ✅ 备份完成"
echo ""

# 2. 创建集群包装文件
echo "2️⃣  创建集群包装文件..."
cat > cluster.js << 'EOF'
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
EOF

echo "   ✅ 集群包装文件已创建"
echo ""

# 3. 修改 PM2 配置
echo "3️⃣  更新 PM2 配置..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'mes-api',
    script: './cluster.js',
    instances: 1, // 集群模式由 cluster.js 管理
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    error_file: '../logs/pm2-err.log',
    out_file: '../logs/pm2-out.log',
    log_file: '../logs/pm2-combined.log',
    time: true
  }]
};
EOF

echo "   ✅ PM2 配置已更新"
echo ""

# 4. 重启服务
echo "4️⃣  重启服务..."
echo 'xiaomai@2015' | sudo -S pm2 restart mes-api
sleep 5
echo 'xiaomai@2015' | sudo -S pm2 status
echo ""

# 5. 验证
echo "5️⃣  验证集群模式..."
sleep 3
curl -s http://localhost:5001/api/health | python3 -m json.tool | head -10
echo ""

# 6. 查看集群日志
echo "6️⃣  集群日志:"
tail -20 ../logs/cluster.log 2>/dev/null || echo "   日志文件尚未生成"
echo ""

echo "======================================"
echo "✅ 集群模式部署完成！"
echo "======================================"
echo ""
echo "📊 预期效果:"
echo "  - QPS 提升：4-8 倍"
echo "  - CPU 利用率：多核充分利用"
echo "  - 稳定性：Worker 自动重启"
echo ""
echo "🔍 验证方法:"
echo "  1. 查看进程：pm2 status"
echo "  2. 查看日志：tail -f ../logs/cluster.log"
echo "  3. 性能测试：ab -n 500 -c 50 http://192.168.100.6:5001/api/health"
echo ""
