# P2 优化部署指南

**版本**: v1.2.0-p2  
**日期**: 2026-03-25  
**目标环境**: 生产环境 (192.168.100.6)

---

## ✅ 环境验证

### Redis 连接测试

**已验证配置** (2026-03-25 13:25):
```
主机：192.168.100.6:6379
密码：redis
连接 URL: redis://:redis@192.168.100.6:6379
状态：✅ 连接成功 (PING: PONG)
```

**测试命令**:
```bash
node test-redis-quick.js
```

---

## 📋 部署步骤

### 1. 准备环境

#### 1.1 拉取最新代码
```bash
cd /path/to/mes-system
git pull origin main
```

#### 1.2 安装依赖
```bash
npm install
```

### 2. 配置环境变量

创建或编辑 `.env` 文件：

```bash
# 生产环境配置
NODE_ENV=production
PORT=5000
CORS_ORIGIN=http://192.168.100.6:3000

# 数据库配置
DB_HOST=192.168.100.6
DB_PORT=3306
DB_NAME=mes_system
DB_USER=mes_user
DB_PASSWORD=your-db-password

# Redis 配置（P2-1）✅ 已验证
REDIS_URL=redis://:redis@192.168.100.6:6379

# JWT 配置
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d

# 日志配置
LOG_LEVEL=info

# 监控配置（P2-2）
SLOW_QUERY_THRESHOLD=1000
ENABLE_MONITORING=true
```

### 3. 验证 Redis 连接

```bash
# 运行快速测试
node test-redis-quick.js

# 预期输出:
# 测试 Redis 连接：192.168.100.6:6379
# 正在连接...
# ✅ 连接成功！
# PING: PONG
# SET/GET: value
```

### 4. 启动服务

#### 开发环境
```bash
npm run dev
```

#### 生产环境（使用 PM2）
```bash
# 停止旧进程
pm2 stop mes-system

# 启动新进程
pm2 start server/app.js --name mes-system

# 保存 PM2 配置
pm2 save
```

### 5. 验证功能

#### 5.1 健康检查
```bash
curl http://localhost:5000/api/health
```

预期响应:
```json
{
  "status": "ok",
  "timestamp": "2026-03-25T05:30:00.000Z",
  "uptime": 123.45,
  "environment": "production",
  "version": "1.2.0-p2"
}
```

#### 5.2 缓存统计
```bash
curl http://localhost:5000/api/monitor/cache/stats
```

预期响应:
```json
{
  "timestamp": "2026-03-25T05:30:00.000Z",
  "hits": 0,
  "misses": 0,
  "hitRate": "0%",
  "redisConnected": true,
  "memoryCacheSize": 0
}
```

#### 5.3 监控指标
```bash
curl http://localhost:5000/api/monitor/metrics
```

#### 5.4 运行完整测试
```bash
node scripts/test-p2-features.js
```

---

## 🔍 故障排查

### Redis 连接失败

**错误**: `WRONGPASS invalid username-password pair`

**原因**: Redis 6+ 使用 ACL，需要正确的用户名和密码

**解决方案**:
1. 确认连接 URL 格式：`redis://:password@host:port`
2. 如果 Redis 启用了 ACL，使用：`redis://username:password@host:port`
3. 检查 Redis 配置：`redis-cli CONFIG GET requirepass`

### 缓存未生效

**检查步骤**:
1. 查看缓存统计：`curl /api/monitor/cache/stats`
2. 检查 `redisConnected` 是否为 `true`
3. 查看日志：`pm2 logs mes-system`

### 监控数据为空

**检查步骤**:
1. 确认服务已运行一段时间
2. 检查中间件是否正确注册
3. 查看 `/api/monitor/health` 确认服务状态

---

## 📊 性能基准测试

### 使用 Apache Bench

```bash
# 测试无缓存情况
ab -n 1000 -c 10 http://192.168.100.6:5000/api/products

# 测试有缓存情况（第二次运行）
ab -n 1000 -c 10 http://192.168.100.6:5000/api/products
```

### 预期效果

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| 平均响应时间 | ~200ms | ~80ms |
| 请求/秒 | ~100 | ~250 |
| 数据库查询 | 1000 次/h | 400 次/h |

---

## 🔄 回滚方案

如果 P2 优化导致问题，可以快速回滚：

### 方案 1: 禁用 Redis 缓存
```bash
# 编辑 .env，注释掉 REDIS_URL
# REDIS_URL=redis://:redis@192.168.100.6:6379

# 重启服务
pm2 restart mes-system
```

系统会自动降级到内存缓存模式。

### 方案 2: 回滚代码
```bash
git checkout ffb9b87  # P2 优化前的提交
npm install
pm2 restart mes-system
```

---

## 📝 检查清单

### 部署前
- [ ] 代码已推送到 GitHub
- [ ] Redis 连接已验证
- [ ] 数据库连接正常
- [ ] 备份当前生产环境

### 部署中
- [ ] 依赖安装完成
- [ ] 环境变量配置正确
- [ ] 服务启动成功
- [ ] 健康检查通过

### 部署后
- [ ] 缓存统计显示 Redis 已连接
- [ ] 监控 API 返回数据
- [ ] 业务功能正常
- [ ] 性能测试通过

---

## 📞 相关文档

- [P2 优化完整文档](./docs/P2_OPTIMIZATION.md)
- [P2 优化总结](./P2_OPTIMIZATION_SUMMARY.md)
- [部署检查清单](./docs/06-deployment/DEPLOYMENT_CHECKLIST.md)
- [维护指南](./docs/06-deployment/MAINTENANCE_GUIDE.md)

---

**状态**: ✅ 已验证  
**Redis 连接**: ✅ 成功  
**下一步**: 部署到生产环境
