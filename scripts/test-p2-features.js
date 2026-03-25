/**
 * P2 功能测试脚本 - 缓存与监控
 * 使用方法：node scripts/test-p2-features.js
 */

const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testHealth() {
  log(colors.blue, '\n📊 测试 1: 健康检查');
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    log(colors.green, '✅ 健康检查通过');
    console.log({
      status: response.data.status,
      uptime: response.data.uptime,
      version: response.data.version
    });
    return true;
  } catch (error) {
    log(colors.red, '❌ 健康检查失败');
    console.error(error.message);
    return false;
  }
}

async function testMonitorMetrics() {
  log(colors.blue, '\n📊 测试 2: 监控指标');
  try {
    const response = await axios.get(`${BASE_URL}/api/monitor/metrics`);
    log(colors.green, '✅ 监控指标获取成功');
    
    const metrics = response.data;
    console.log({
      总请求数：metrics.requests?.total || 0,
      平均响应时间：`${metrics.requests?.avgResponseTime || 0}ms`,
      QPS: metrics.requests?.qps || 0,
      缓存命中率：`${metrics.cache?.hitRate || 0}%`,
      慢查询数：metrics.database?.slowQueries || 0
    });
    return true;
  } catch (error) {
    log(colors.red, '❌ 监控指标获取失败');
    console.error(error.message);
    return false;
  }
}

async function testCacheStats() {
  log(colors.blue, '\n📊 测试 3: 缓存统计');
  try {
    const response = await axios.get(`${BASE_URL}/api/monitor/cache/stats`);
    log(colors.green, '✅ 缓存统计获取成功');
    
    const stats = response.data;
    console.log({
      命中次数：stats.hits || 0,
      未命中次数：stats.misses || 0,
      命中率：stats.hitRate || '0%',
      Redis 连接：stats.redisConnected ? '已连接' : '未连接',
      内存缓存大小：stats.memoryCacheSize || 0
    });
    return true;
  } catch (error) {
    log(colors.red, '❌ 缓存统计获取失败');
    console.error(error.message);
    return false;
  }
}

async function testSystemInfo() {
  log(colors.blue, '\n📊 测试 4: 系统信息');
  try {
    const response = await axios.get(`${BASE_URL}/api/monitor/system`);
    log(colors.green, '✅ 系统信息获取成功');
    
    const system = response.data;
    console.log({
      平台：system.platform,
      CPU 核心数：system.cpus,
      总内存：`${system.memory?.total || 0} MB`,
      内存使用率：system.memory?.usage || '0%',
      系统运行时间：`${Math.round(system.uptime?.system || 0)}秒`,
      进程运行时间：`${Math.round(system.uptime?.process || 0)}秒`
    });
    return true;
  } catch (error) {
    log(colors.red, '❌ 系统信息获取失败');
    console.error(error.message);
    return false;
  }
}

async function testMonitorReport() {
  log(colors.blue, '\n📊 测试 5: 监控报告');
  try {
    const response = await axios.get(`${BASE_URL}/api/monitor/report`);
    log(colors.green, '✅ 监控报告生成成功');
    
    const report = response.data;
    console.log({
      生成时间：report.generatedAt,
      总请求数：report.summary?.totalRequests || 0,
      成功率：`${report.summary?.successRate || 0}%`,
      平均响应时间：`${report.summary?.avgResponseTime || 0}ms`,
      缓存命中率：`${report.summary?.cacheHitRate || 0}%`,
      优化建议数：report.recommendations?.length || 0
    });
    
    if (report.recommendations && report.recommendations.length > 0) {
      log(colors.yellow, '\n⚠️ 优化建议:');
      report.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. [${rec.priority}] ${rec.message}`);
      });
    }
    return true;
  } catch (error) {
    log(colors.red, '❌ 监控报告生成失败');
    console.error(error.message);
    return false;
  }
}

async function testCacheFunctionality() {
  log(colors.blue, '\n📊 测试 6: 缓存功能（模拟）');
  
  try {
    // 模拟缓存测试
    const { cacheService } = require('../server/services/cacheService');
    
    // 测试设置缓存
    const testKey = 'test:p2:functionality';
    const testValue = { foo: 'bar', timestamp: Date.now() };
    
    await cacheService.set(testKey, testValue, 60);
    log(colors.green, '✅ 缓存设置成功');
    
    // 测试获取缓存
    const cached = await cacheService.get(testKey);
    if (cached && cached.foo === 'bar') {
      log(colors.green, '✅ 缓存获取成功');
    } else {
      log(colors.red, '❌ 缓存数据不匹配');
      return false;
    }
    
    // 测试删除缓存
    await cacheService.delete(testKey);
    const deleted = await cacheService.get(testKey);
    if (!deleted) {
      log(colors.green, '✅ 缓存删除成功');
    } else {
      log(colors.red, '❌ 缓存删除失败');
      return false;
    }
    
    // 输出缓存统计
    const stats = cacheService.getStats();
    console.log({
      设置次数：stats.sets,
      获取命中：stats.hits,
      获取未命中：stats.misses,
      删除次数：stats.deletes
    });
    
    return true;
  } catch (error) {
    log(colors.red, '❌ 缓存功能测试失败');
    console.error(error.message);
    return false;
  }
}

async function runAllTests() {
  log(colors.cyan, '\n🚀 开始 P2 功能测试...\n');
  log(colors.cyan, `测试环境：${BASE_URL}`);
  log(colors.cyan, `测试时间：${new Date().toISOString()}\n`);
  
  const results = {
    health: await testHealth(),
    metrics: await testMonitorMetrics(),
    cache: await testCacheStats(),
    system: await testSystemInfo(),
    report: await testMonitorReport(),
    cacheFunctionality: await testCacheFunctionality()
  };
  
  // 统计结果
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.values(results).length;
  
  log(colors.cyan, '\n' + '='.repeat(50));
  log(colors.cyan, '测试结果汇总');
  log(colors.cyan, '='.repeat(50));
  
  if (passed === total) {
    log(colors.green, `\n✅ 所有测试通过 (${passed}/${total})`);
  } else {
    log(colors.yellow, `\n⚠️  ${passed}/${total} 测试通过`);
    
    const failed = Object.entries(results)
      .filter(([_, result]) => !result)
      .map(([name]) => name);
    
    if (failed.length > 0) {
      log(colors.red, '\n失败的测试:');
      failed.forEach(name => log(colors.red, `  - ${name}`));
    }
  }
  
  console.log('\n');
  process.exit(passed === total ? 0 : 1);
}

// 运行测试
runAllTests().catch(error => {
  log(colors.red, '\n❌ 测试执行失败');
  console.error(error);
  process.exit(1);
});
