#!/bin/bash
# P2 优化部署脚本 - 生产环境 (192.168.100.6)

set -e

echo "=========================================="
echo "  MES 系统 P2 优化部署脚本"
echo "  目标：192.168.100.6"
echo "  版本：v1.2.0-p2"
echo "=========================================="
echo ""

# 1. 拉取最新代码
echo "📥 步骤 1: 拉取最新代码..."
cd /path/to/mes-system  # 修改为实际路径
git pull origin main
echo "✅ 代码拉取完成"
echo ""

# 2. 安装依赖
echo "📦 步骤 2: 安装依赖..."
npm install
echo "✅ 依赖安装完成"
echo ""

# 3. 配置环境变量
echo "⚙️  步骤 3: 配置环境变量..."
cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=5000
CORS_ORIGIN=http://192.168.100.6:3000

# 数据库配置
DB_HOST=192.168.100.6
DB_PORT=3306
DB_NAME=mes_system
DB_USER=mes_user
DB_PASSWORD=your-db-password

# Redis 配置（P2-1）
REDIS_URL=redis://:redis@192.168.100.6:6379

# JWT 配置
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d

# 日志配置
LOG_LEVEL=info

# 监控配置（P2-2）
SLOW_QUERY_THRESHOLD=1000
ENABLE_MONITORING=true
ENVEOF
echo "✅ 环境变量配置完成"
echo ""

# 4. 验证 Redis 连接
echo "🔍 步骤 4: 验证 Redis 连接..."
node -e "
const redis = require('redis');
const client = redis.createClient({ url: 'redis://:redis@192.168.100.6:6379' });
client.connect()
  .then(() => client.ping())
  .then(ping => {
    console.log('✅ Redis 连接成功:', ping);
    client.quit();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Redis 连接失败:', err.message);
    process.exit(1);
  });
"
echo ""

# 5. 重启服务
echo "🔄 步骤 5: 重启服务..."
pm2 restart mes-system
echo "✅ 服务重启完成"
echo ""

# 6. 验证部署
echo "🔍 步骤 6: 验证部署..."
sleep 5
echo "检查健康状态..."
curl -s http://localhost:5000/api/health | head -20
echo ""
echo "检查缓存统计..."
curl -s http://localhost:5000/api/monitor/cache/stats | head -20
echo ""

# 7. 完成
echo "=========================================="
echo "  ✅ 部署完成！"
echo "=========================================="
echo ""
echo "查看日志：pm2 logs mes-system"
echo "查看状态：pm2 status mes-system"
echo "健康检查：curl http://localhost:5000/api/health"
echo "监控指标：curl http://localhost:5000/api/monitor/metrics"
echo ""
