// 简化版测试服务器 - 只测试缓存和监控
require('dotenv').config();

const express = require('express');
const app = express();
const { cacheService } = require('./server/services/cacheService');
const { monitorService } = require('./server/services/monitorService');
const monitorRoutes = require('./server/routes/monitor');

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'test',
    version: '1.2.0-p2',
    redisConnected: cacheService.getStats().redisConnected
  });
});

// 监控路由
app.use('/api/monitor', monitorRoutes);

// 缓存测试端点
app.get('/api/test/cache', async (req, res) => {
  const key = 'test:api:response';
  
  // 尝试从缓存获取
  const cached = await cacheService.get(key);
  if (cached) {
    return res.json({ fromCache: true, data: cached });
  }
  
  // 模拟业务逻辑
  const data = {
    message: 'Hello from P2 optimized API',
    timestamp: new Date().toISOString(),
    requestId: Date.now()
  };
  
  // 存入缓存
  await cacheService.set(key, data, 300);
  res.json({ fromCache: false, data });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\n✅ 测试服务器启动成功`);
  console.log(`   端口：${PORT}`);
  console.log(`   环境：${process.env.NODE_ENV}`);
  console.log(`   Redis: ${process.env.REDIS_URL ? '已配置' : '未配置'}\n`);
  console.log(`测试端点:`);
  console.log(`   GET http://localhost:${PORT}/api/health`);
  console.log(`   GET http://localhost:${PORT}/api/monitor/health`);
  console.log(`   GET http://localhost:${PORT}/api/monitor/cache/stats`);
  console.log(`   GET http://localhost:${PORT}/api/test/cache\n`);
});
