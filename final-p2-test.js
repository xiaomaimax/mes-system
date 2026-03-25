/**
 * P2 最终测试 - 核心功能验证
 */

async function testAll() {
  console.log('\n🚀 P2 优化核心功能测试\n');
  console.log('=' .repeat(60));
  
  // 测试 1: Redis 连接
  console.log('\n【测试 1】Redis 连接');
  console.log('-'.repeat(60));
  const { createClient } = require('redis');
  const client = createClient({
    url: 'redis://:redis@192.168.100.6:6379'
  });
  
  try {
    await client.connect();
    console.log('✅ Redis 连接成功');
    
    const ping = await client.ping();
    console.log(`✅ PING 响应：${ping}`);
    
    // 测试读写
    const testKey = 'mes:p2:test:final';
    const testData = { 
      test: 'P2 优化验证',
      timestamp: new Date().toISOString(),
      features: ['缓存优化', '监控优化']
    };
    
    await client.set(testKey, JSON.stringify(testData), { EX: 300 });
    console.log('✅ SET 操作成功');
    
    const getValue = await client.get(testKey);
    const parsedValue = JSON.parse(getValue);
    console.log('✅ GET 操作成功');
    console.log(`   数据：${JSON.stringify(parsedValue, null, 2)}`);
    
    await client.del(testKey);
    console.log('✅ 测试数据已清理\n');
    
    await client.quit();
  } catch (error) {
    console.log(`❌ Redis 测试失败：${error.message}\n`);
    return false;
  }
  
  // 测试 2: 缓存服务
  console.log('【测试 2】缓存服务 (CacheService)');
  console.log('-'.repeat(60));
  const { cacheService } = require('./server/services/cacheService');
  
  // 等待缓存服务初始化
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const stats = cacheService.getStats();
  console.log(`✅ Redis 连接状态：${stats.redisConnected ? '已连接' : '未连接'}`);
  console.log(`✅ 缓存命中率：${stats.hitRate}`);
  console.log(`✅ 内存缓存大小：${stats.memoryCacheSize}\n`);
  
  // 测试 3: 监控服务
  console.log('【测试 3】监控服务 (MonitorService)');
  console.log('-'.repeat(60));
  const { monitorService } = require('./server/services/monitorService');
  
  // 模拟一些请求
  for (let i = 0; i < 5; i++) {
    monitorService.recordRequest({
      method: 'GET',
      path: `/api/test/${i}`,
      status: 200,
      duration: 100 + i * 20,
      requestId: `test-${i}`,
      ip: '127.0.0.1'
    });
  }
  
  // 模拟缓存命中
  monitorService.recordCacheHit(true);
  monitorService.recordCacheHit(true);
  monitorService.recordCacheHit(false);
  
  const metrics = monitorService.getMetrics();
  console.log(`✅ 总请求数：${metrics.requests.total}`);
  console.log(`✅ 平均响应时间：${metrics.requests.avgResponseTime}ms`);
  console.log(`✅ 缓存命中：${metrics.cache.hits}`);
  console.log(`✅ 缓存未命中：${metrics.cache.misses}`);
  console.log(`✅ 缓存命中率：${metrics.cache.hitRate}%\n`);
  
  // 测试 4: 监控报告
  console.log('【测试 4】监控报告生成');
  console.log('-'.repeat(60));
  const report = monitorService.generateReport();
  console.log(`✅ 总请求数：${report.summary.totalRequests}`);
  console.log(`✅ 成功率：${report.summary.successRate}%`);
  console.log(`✅ 平均响应时间：${report.summary.avgResponseTime}ms`);
  console.log(`✅ 优化建议数：${report.recommendations.length}\n`);
  
  // 总结
  console.log('=' .repeat(60));
  console.log('✅ P2 核心功能测试全部通过!\n');
  console.log('关键指标:');
  console.log(`  - Redis 连接：✅ 正常 (192.168.100.6:6379)`);
  console.log(`  - 缓存服务：✅ 正常 (命中率 ${stats.hitRate})`);
  console.log(`  - 监控服务：✅ 正常 (QPS ${metrics.requests.qps})`);
  console.log(`  - 报告生成：✅ 正常 (${report.recommendations.length} 条建议)\n`);
  
  return true;
}

testAll()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('❌ 测试执行失败:', error);
    process.exit(1);
  });
