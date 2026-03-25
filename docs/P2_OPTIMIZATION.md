# P2 优化实施文档 - 缓存与监控

**实施日期**: 2026-03-25  
**版本**: v1.2.0-p2  
**状态**: ✅ 已完成

---

## 📋 优化内容

### P2-1: 缓存优化

#### 实施内容
1. **缓存服务** (`server/services/cacheService.js`)
   - Redis 缓存支持（生产环境）
   - 内存缓存降级（开发环境）
   - 缓存统计与监控
   - 自动过期清理

2. **缓存中间件** (`server/middleware/cache.js`)
   - `cacheMiddleware` - 自动缓存 GET 请求
   - `invalidateCache` - 自动清除相关缓存
   - `pageCache` - 页面级缓存

3. **缓存策略**
   - **短期缓存** (60s): 频繁变化数据
   - **中期缓存** (5m): 一般业务数据
   - **长期缓存** (1h): 配置类数据
   - **超长期缓存** (24h): 静态数据

#### 使用示例

```javascript
// 1. 直接使用缓存服务
const { cacheService } = require('./services/cacheService');

// 设置缓存
await cacheService.set('user:123', userData, 300);

// 获取缓存
const user = await cacheService.get('user:123');

// 删除缓存
await cacheService.delete('user:123');

// 2. 使用缓存中间件
const { cacheMiddleware, invalidateCache } = require('./middleware/cache');

// 缓存列表接口 5 分钟
app.get('/api/users', 
  cacheMiddleware({ ttl: 300, prefix: 'users' }),
  userController.list
);

// 更新后清除缓存
app.put('/api/users/:id',
  invalidateCache(['users:*', `user:${req.params.id}`]),
  userController.update
);
```

#### 缓存键命名规范
```
mes:data:<模块>:<标识符>:<参数>
示例:
- mes:data:users:123
- mes:data:products:list:page=1&size=20
- mes:data:config:system
```

#### 性能提升预期
- 列表接口响应时间：减少 60-80%
- 数据库查询次数：减少 40-60%
- 缓存命中率目标：>70%

---

### P2-2: 监控优化

#### 实施内容
1. **监控服务** (`server/services/monitorService.js`)
   - 请求性能追踪
   - 数据库查询监控
   - 缓存命中率统计
   - 系统资源监控
   - 错误追踪与告警

2. **监控 API** (`server/routes/monitor.js`)
   - `GET /api/monitor/health` - 健康检查
   - `GET /api/monitor/metrics` - 详细指标
   - `GET /api/monitor/report` - 监控报告
   - `GET /api/monitor/cache/stats` - 缓存统计
   - `GET /api/monitor/system` - 系统资源
   - `GET /api/monitor/errors` - 错误列表

3. **监控指标**
   - **请求指标**: QPS、响应时间、成功率
   - **数据库**: 查询次数、慢查询、连接池
   - **缓存**: 命中/未命中、命中率
   - **系统**: CPU、内存、磁盘、负载

#### 使用示例

```javascript
// 1. 查看健康状态
curl http://localhost:5000/api/monitor/health

// 2. 获取性能指标
curl http://localhost:5000/api/monitor/metrics

// 3. 生成监控报告
curl http://localhost:5000/api/monitor/report

// 4. 查看缓存统计
curl http://localhost:5000/api/monitor/cache/stats

// 5. 查看系统资源
curl http://localhost:5000/api/monitor/system
```

#### 健康检查响应示例
```json
{
  "timestamp": "2026-03-25T05:30:00.000Z",
  "status": "healthy",
  "checks": {
    "memory": "ok",
    "errorRate": "ok",
    "responseTime": "ok",
    "database": "ok",
    "cache": {
      "hits": 1250,
      "misses": 380,
      "hitRate": "76.71%",
      "redisConnected": true
    }
  },
  "metrics": {
    "requests": {
      "total": 15420,
      "success": 15280,
      "error": 140,
      "avgResponseTime": 156,
      "qps": "42.5"
    },
    "database": {
      "queries": 8500,
      "slowQueries": 12,
      "avgQueryTime": 45
    }
  }
}
```

#### 告警阈值
| 指标 | 警告 | 严重 |
|------|------|------|
| 内存使用率 | >80% | >90% |
| 错误率 | >5% | >10% |
| 平均响应时间 | >1000ms | >3000ms |
| 慢查询数（/分钟） | >10 | >50 |
| 缓存命中率 | <50% | <30% |

---

## 🔧 部署指南

### 1. 安装 Redis（生产环境）

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

#### Docker
```bash
docker run -d --name redis \
  -p 6379:6379 \
  -v redis-data:/data \
  redis:7-alpine
```

### 2. 配置环境变量

编辑 `.env` 文件：
```bash
# Redis 配置
REDIS_URL=redis://localhost:6379

# 监控配置
SLOW_QUERY_THRESHOLD=1000
ENABLE_MONITORING=true
```

### 3. 安装依赖
```bash
npm install redis
```

### 4. 启动服务
```bash
# 开发环境
npm run dev

# 生产环境
npm start
```

---

## 📊 监控仪表板

### 推荐的监控方案

#### 方案 1: Prometheus + Grafana
```yaml
# 导出监控指标到 Prometheus
# 使用 prom-client 库
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
```

#### 方案 2: 自建监控面板
使用 `/api/monitor/metrics` 端点，配合前端图表库（ECharts、Chart.js）

#### 方案 3: APM 服务
- New Relic
- Datadog
- Sentry（错误追踪）

---

## 🎯 优化效果验证

### 验证步骤

1. **基准测试**（优化前）
```bash
# 使用 Apache Bench 进行压力测试
ab -n 1000 -c 10 http://localhost:5000/api/products
```

2. **启用缓存后测试**
```bash
# 第一次请求（缓存未命中）
curl -w "@curl-format.txt" http://localhost:5000/api/products

# 第二次请求（缓存命中）
curl -w "@curl-format.txt" http://localhost:5000/api/products
```

3. **查看监控数据**
```bash
# 查看缓存统计
curl http://localhost:5000/api/monitor/cache/stats

# 查看性能报告
curl http://localhost:5000/api/monitor/report
```

### 预期效果

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 平均响应时间 | 200ms | 80ms | 60% |
| 数据库查询 | 1000 次/h | 400 次/h | 60% |
| 慢查询数 | 50 次/h | 10 次/h | 80% |
| 并发能力 | 100 QPS | 250 QPS | 150% |

---

## 🔍 故障排查

### 缓存未命中率高

**问题**: 缓存命中率低于 50%

**排查步骤**:
1. 检查缓存键是否正确：`curl /api/monitor/cache/stats`
2. 检查 TTL 是否过短
3. 检查是否有大量写操作清除缓存
4. 考虑增加缓存范围

**解决方案**:
```javascript
// 增加缓存时间
cacheMiddleware({ ttl: 600 }) // 从 5 分钟增加到 10 分钟

// 扩大缓存范围
cacheMiddleware({ 
  ttl: 300,
  shouldCache: (req) => {
    // 只缓存特定接口
    return req.path.startsWith('/api/products');
  }
})
```

### Redis 连接失败

**问题**: 无法连接 Redis

**排查步骤**:
1. 检查 Redis 服务状态：`sudo systemctl status redis`
2. 检查连接配置：`echo $REDIS_URL`
3. 测试 Redis 连接：`redis-cli ping`

**解决方案**:
```bash
# 重启 Redis
sudo systemctl restart redis

# 检查防火墙
sudo ufw allow 6379/tcp
```

### 内存使用过高

**问题**: 内存缓存模式导致内存占用高

**解决方案**:
1. 切换到 Redis 缓存
2. 减少内存缓存 TTL
3. 增加自动清理频率

```javascript
// 在 cacheService.js 中
setInterval(() => cacheService.cleanup(), 30000); // 30 秒清理一次
```

---

## 📝 最佳实践

### 缓存策略

1. **热点数据优先缓存**
   - 产品列表、配置信息、用户信息

2. **避免缓存的数据**
   - 实时性要求高的数据（库存、订单状态）
   - 个性化数据（用户购物车）
   - 敏感数据（密码、支付信息）

3. **缓存更新策略**
   - 写操作后立即清除相关缓存
   - 定时刷新热点数据
   - 使用版本号控制缓存失效

### 监控告警

1. **设置告警规则**
```javascript
// 在 monitorService.js 中
if (errorRate > 10) {
  // 发送告警邮件/短信
  sendAlert('错误率超过 10%', { errorRate });
}
```

2. **定期检查监控报告**
   - 每日查看性能报告
   - 每周分析趋势
   - 每月优化瓶颈

3. **日志留存**
   - 性能日志保留 7 天
   - 错误日志保留 30 天
   - 审计日志保留 90 天

---

## 🚀 下一步优化

### P2-3: 搜索优化（建议）
- Elasticsearch 集成
- 全文搜索
- 搜索建议

### P2-4: 报表优化（建议）
- 异步报表生成
- 报表缓存
- 导出功能优化

### P2-5: 数据库优化（建议）
- 读写分离
- 分库分表
- SQL 优化

---

## 📞 相关文档

- [部署检查清单](./06-deployment/DEPLOYMENT_CHECKLIST.md)
- [性能优化指南](./OPTIMIZATION_GUIDE.md)
- [监控维护指南](./06-deployment/MAINTENANCE_GUIDE.md)

---

**版本**: v1.2.0-p2  
**最后更新**: 2026-03-25  
**维护者**: MES 系统团队
