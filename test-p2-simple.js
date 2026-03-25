/**
 * P2 功能简化测试 - 不依赖数据库
 */

const { cacheService } = require('./server/services/cacheService');
const { monitorService } = require('./server/services/monitorService');

async function testCache() {
  console.log('\n📦 测试 1: 缓存服务');
  console.log('=' .repeat(50));
  
  try {
    // 测试设置缓存
    console.log('\n1️⃣ 设置缓存...');
    const testKey = 'mes:test:simple';
    const testData = { 
      message: 'P2 缓存测试', 
      timestamp: new Date().toISOString() 
    };
    
    const setResult = await cacheService.set(testKey, testData, 60);
    console.log(`   设置结果：${setResult ? '✅ 成功' : '❌ 失败'}`);
    
    // 测试获取缓存
    console.log('\n2️⃣ 获取缓存...');
    const getResult = await cacheService.get(testKey);
    console.log(`   获取结果：${getResult ? '✅ 成功' : '❌ 失败'}`);
    if (getResult) {
      console.log(`   数据：${JSON.stringify(getResult, null, 2)}`);
    }
    
    // 测试缓存统计
    console.log('\n3️⃣ 缓存统计...');
    const stats = cacheService.getStats();
    console.log(`   Redis 连接：${stats.redisConnected ? '✅ 已连接' : '⚠️ 未连接'}`);
    console.log(`   命中次数：${stats.hits}`);
    console.log(`   未命中次数：${stats.misses}`);
    console.log(`   命中率：${stats.hitRate}`);
    console.log(`   设置次数：${stats.sets}`);
    
    // 清理测试数据
    await cacheService.delete(testKey);
    
    console.log('\n✅ 缓存服务测试完成');
    return true;
  } catch (error) {
    console.error('❌ 缓存服务测试失败:', error.message);
    return false;
  }
}

async function testMonitor() {
  console.log('\n📊 测试 2: 监控服务');
  console.log('=' .repeat(50));
  
  try {
    // 测试记录请求
    console.log('\n1️⃣ 模拟请求记录...');
    monitorService.recordRequest({
      method: 'GET',
      path: '/api/test',
      status: 200,
      duration: 150,
      requestId: 'test-123',
      ip: '127.0.0.1'
    });
    
    // 测试记录缓存命中
    console.log('2️⃣ 记录缓存命中...');
    monitorService.recordCacheHit(true);
    monitorService.recordCacheHit(true);
    monitorService.recordCacheHit(false);
    
    // 测试获取指标
    console.log('3️⃣ 获取监控指标...');
    const metrics = monitorService.getMetrics();
    console.log(`   总请求数：${metrics.requests.total}`);
    console.log(`   成功请求：${metrics.requests.success}`);
    console.log(`   平均响应时间：${metrics.requests.avgResponseTime}ms`);
    console.log(`   缓存命中：${metrics.cache.hits}`);
    console.log(`   缓存未命中：${metrics.cache.misses}`);
    console.log(`   缓存命中率：${metrics.cache.hitRate}%`);
    
    // 测试生成报告
    console.log('\n4️⃣ 生成监控报告...');
    const report = monitorService.generateReport();
    console.log(`   总请求数：${report.summary.totalRequests}`);
    console.log(`   成功率：${report.summary.successRate}%`);
    console.log(`   平均响应时间：${report.summary.avgResponseTime}ms`);
    console.log(`   缓存命中率：${report.summary.cacheHitRate}%`);
    console.log(`   优化建议数：${report.recommendations.length}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n   优化建议:');
      report.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. [${rec.priority}] ${rec.message}`);
      });
    }
    
    console.log('\n✅ 监控服务测试完成');
    return true;
  } catch (error) {
    console.error('❌ 监控服务测试失败:', error.message);
    return false;
  }
}

async function testHealthEndpoint() {
  console.log('\n🏥 测试 3: 健康检查端点');
  console.log('=' .repeat(50));
  
  try {
    const http = require('http');
    
    return new Promise((resolve) => {
      const req = http.get('http://localhost:5000/api/health', (res) => {
        let data = '';
        
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const health = JSON.parse(data);
            console.log('\n健康检查结果:');
            console.log(`   状态：${health.status === 'ok' ? '✅ 正常' : '⚠️ 异常'}`);
            console.log(`   环境：${health.environment}`);
            console.log(`   版本：${health.version}`);
            console.log(`   运行时间：${Math.round(health.uptime)}秒`);
            console.log('\n✅ 健康检查测试完成');
            resolve(true);
          } catch (e) {
            console.error('❌ 解析健康检查响应失败:', e.message);
            resolve(false);
          }
        });
      });
      
      req.on('error', (e) => {
        console.error('❌ 健康检查端点不可达:', e.message);
        console.log('   提示：请先启动服务器 (npm run dev)');
        resolve(false);
      });
      
      req.setTimeout(5000);
    });
  } catch (error) {
    console.error('❌ 健康检查测试失败:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('\n🚀 P2 功能简化测试');
  console.log('=' .repeat(50));
  console.log(`测试时间：${new Date().toISOString()}`);
  console.log(`Redis URL: ${process.env.REDIS_URL || '未配置'}`);
  
  const results = {
    cache: await testCache(),
    monitor: await testMonitor(),
    health: await testHealthEndpoint()
  };
  
  console.log('\n' + '=' .repeat(50));
  console.log('测试结果汇总');
  console.log('=' .repeat(50));
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.values(results).length;
  
  if (passed === total) {
    console.log(`\n✅ 所有测试通过 (${passed}/${total})`);
  } else {
    console.log(`\n⚠️  ${passed}/${total} 测试通过`);
    
    const failed = Object.entries(results)
      .filter(([_, result]) => !result)
      .map(([name]) => name);
    
    if (failed.length > 0) {
      console.log('\n失败的测试:');
      failed.forEach(name => console.log(`  - ${name}`));
    }
  }
  
  console.log('\n');
  process.exit(passed === total ? 0 : 1);
}

runTests().catch(console.error);
