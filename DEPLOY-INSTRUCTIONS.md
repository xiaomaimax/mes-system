# MES 系统 P2 优化 - 生产环境部署指南

**目标服务器**: 192.168.100.6  
**安装路径**: `/opt/mes-system`  
**版本**: v1.2.0-p2  
**日期**: 2026-03-25

---

## 📋 部署步骤

### 步骤 1: SSH 登录服务器

```bash
ssh your-username@192.168.100.6
```

### 步骤 2: 创建安装目录

```bash
# 创建应用目录
sudo mkdir -p /opt/mes-system

# 创建应用用户（可选但推荐）
sudo useradd -r -s /bin/bash mesapp

# 设置目录权限
sudo chown -R $USER:$USER /opt/mes-system
```

### 步骤 3: 克隆代码

```bash
cd /opt/mes-system
git clone https://github.com/xiaomaimax/mes-system.git .
```

### 步骤 4: 安装依赖

```bash
npm install
```

### 步骤 5: 配置环境变量

创建 `.env` 文件：

```bash
cat > .env << 'ENVEOF'
# 生产环境配置
NODE_ENV=production
PORT=5000
CORS_ORIGIN=http://192.168.100.6:3000

# 数据库配置
DB_HOST=192.168.100.6
DB_PORT=3306
DB_NAME=mes_system
DB_USER=mes_user
DB_PASSWORD=你的数据库密码

# Redis 配置（P2-1 缓存优化）✅ 已验证
REDIS_URL=redis://:redis@192.168.100.6:6379

# JWT 配置
JWT_SECRET=你的 JWT 密钥（至少 32 位随机字符串）
JWT_EXPIRE=7d

# 日志配置
LOG_LEVEL=info

# 监控配置（P2-2 监控优化）
SLOW_QUERY_THRESHOLD=1000
ENABLE_MONITORING=true
ENVEOF

# 编辑 .env 文件，填入实际的数据库密码和 JWT 密钥
nano .env
```

### 步骤 6: 验证 Redis 连接

```bash
node -e "
const redis = require('redis');
const client = redis.createClient({ url: 'redis://:redis@192.168.100.6:6379' });
client.connect()
  .then(() => client.ping())
  .then(ping => {
    console.log('✅ Redis 连接成功:', ping);
    client.quit();
  })
  .catch(err => {
    console.error('❌ Redis 连接失败:', err.message);
    process.exit(1);
  });
"
```

### 步骤 7: 使用 PM2 启动服务

```bash
# 安装 PM2（如果未安装）
npm install -g pm2

# 启动应用
pm2 start server/app.js --name mes-system

# 设置开机自启
pm2 startup
pm2 save
```

### 步骤 8: 验证部署

```bash
# 查看服务状态
pm2 status mes-system

# 查看日志
pm2 logs mes-system

# 健康检查
curl http://localhost:5000/api/health

# 检查缓存连接
curl http://localhost:5000/api/monitor/cache/stats

# 查看监控指标
curl http://localhost:5000/api/monitor/metrics
```

---

## 🔍 预期输出

### 健康检查
```json
{
  "status": "ok",
  "timestamp": "2026-03-25T05:45:00.000Z",
  "uptime": 123.45,
  "environment": "production",
  "version": "1.2.0-p2"
}
```

### 缓存统计
```json
{
  "timestamp": "2026-03-25T05:45:00.000Z",
  "hits": 0,
  "misses": 0,
  "hitRate": "0%",
  "redisConnected": true,
  "memoryCacheSize": 0
}
```

---

## 🐛 故障排查

### Redis 连接失败
```bash
# 检查 Redis 服务状态
sudo systemctl status redis

# 测试 Redis 连接
redis-cli -h 192.168.100.6 -p 6379 -a redis PING
```

### 服务启动失败
```bash
# 查看详细日志
pm2 logs mes-system --lines 100

# 检查端口占用
sudo netstat -tlnp | grep 5000
```

### 数据库连接失败
```bash
# 检查数据库服务
sudo systemctl status mysql

# 测试数据库连接
mysql -h 192.168.100.6 -u mes_user -p mes_system
```

---

## 📊 部署检查清单

- [ ] 代码已克隆到 `/opt/mes-system`
- [ ] 依赖已安装 (`npm install`)
- [ ] `.env` 文件已配置
- [ ] Redis 连接验证通过
- [ ] 数据库连接验证通过
- [ ] PM2 服务已启动
- [ ] 健康检查通过
- [ ] 缓存统计显示 `redisConnected: true`
- [ ] 日志无错误

---

## 📞 相关文档

- [P2 优化文档](./docs/P2_OPTIMIZATION.md)
- [P2 部署指南](./DEPLOYMENT_P2.md)
- [维护指南](./docs/06-deployment/MAINTENANCE_GUIDE.md)

---

**部署完成时间**: __________  
**部署人**: __________  
**验证人**: __________
