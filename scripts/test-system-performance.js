#!/usr/bin/env node

/**
 * 系统性能测试脚本
 * 测试API响应时间、缓存效果、前端加载性能
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

// 配置
const CONFIG = {
  baseURL: 'http://localhost:3001',
  testIterations: 5,
  cacheTestDelay: 1000, // 1秒延迟测试缓存
  performanceThresholds: {
    apiResponse: 2000, // API响应时间阈值 (ms)
    cacheHit: 100,     // 缓存命中响应时间阈值 (ms)
    frontendLoad: 3000 // 前端加载时间阈值 (ms)
  }
};

class PerformanceTestRunner {
  constructor() {
    this.results = {
      apiTests: [],
      cacheTests: [],
      overallResults: {
        passed: 0,
        failed: 0,
        warnings: []
      }
    };
  }

  // 测试API响应时间
  async testAPIResponseTime(endpoint, description) {
    console.log(`\n🔍 测试 ${description}...`);
    
    const times = [];
    let errors = 0;

    for (let i = 0; i < CONFIG.testIterations; i++) {
      try {
        const startTime = performance.now();
        const response = await axios.get(`${CONFIG.baseURL}${endpoint}`, {
          timeout: 5000
        });
        const endTime = performance.now();
        
        const responseTime = endTime - startTime;
        times.push(responseTime);
        
        console.log(`  第${i + 1}次: ${responseTime.toFixed(2)}ms (状态: ${response.status})`);
      } catch (error) {
        errors++;
        console.log(`  第${i + 1}次: 错误 - ${error.message}`);
      }
    }

    if (times.length === 0) {
      console.log(`❌ ${description} - 所有请求都失败了`);
      this.results.overallResults.failed++;
      return { endpoint, description, status: 'failed', error: '所有请求失败' };
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);

    const result = {
      endpoint,
      description,
      avgTime: avgTime.toFixed(2),
      maxTime: maxTime.toFixed(2),
      minTime: minTime.toFixed(2),
      errors,
      status: avgTime <= CONFIG.performanceThresholds.apiResponse ? 'passed' : 'failed'
    };

    if (result.status === 'passed') {
      console.log(`✅ ${description} - 平均响应时间: ${result.avgTime}ms`);
      this.results.overallResults.passed++;
    } else {
      console.log(`❌ ${description} - 平均响应时间: ${result.avgTime}ms (超过阈值 ${CONFIG.performanceThresholds.apiResponse}ms)`);
      this.results.overallResults.failed++;
    }

    this.results.apiTests.push(result);
    return result;
  }

  // 测试缓存效果
  async testCacheEffectiveness(endpoint, description) {
    console.log(`\n🔄 测试 ${description} 缓存效果...`);

    try {
      // 第一次请求 (冷缓存)
      const startTime1 = performance.now();
      await axios.get(`${CONFIG.baseURL}${endpoint}`);
      const endTime1 = performance.now();
      const firstRequestTime = endTime1 - startTime1;

      console.log(`  首次请求: ${firstRequestTime.toFixed(2)}ms`);

      // 等待一小段时间
      await new Promise(resolve => setTimeout(resolve, CONFIG.cacheTestDelay));

      // 第二次请求 (应该命中缓存)
      const startTime2 = performance.now();
      await axios.get(`${CONFIG.baseURL}${endpoint}`);
      const endTime2 = performance.now();
      const secondRequestTime = endTime2 - startTime2;

      console.log(`  缓存请求: ${secondRequestTime.toFixed(2)}ms`);

      const cacheImprovement = ((firstRequestTime - secondRequestTime) / firstRequestTime * 100);
      const result = {
        endpoint,
        description,
        firstRequestTime: firstRequestTime.toFixed(2),
        secondRequestTime: secondRequestTime.toFixed(2),
        improvement: cacheImprovement.toFixed(2),
        status: secondRequestTime <= CONFIG.performanceThresholds.cacheHit ? 'passed' : 'warning'
      };

      if (result.status === 'passed') {
        console.log(`✅ ${description} 缓存效果良好 - 改善: ${result.improvement}%`);
        this.results.overallResults.passed++;
      } else {
        console.log(`⚠️ ${description} 缓存效果一般 - 改善: ${result.improvement}%`);
        this.results.overallResults.warnings.push(`${description} 缓存效果可能需要优化`);
      }

      this.results.cacheTests.push(result);
      return result;

    } catch (error) {
      console.log(`❌ ${description} 缓存测试失败: ${error.message}`);
      this.results.overallResults.failed++;
      return { endpoint, description, status: 'failed', error: error.message };
    }
  }

  // 运行所有性能测试
  async runAllTests() {
    console.log('🚀 开始系统性能测试...\n');
    console.log(`配置信息:`);
    console.log(`- 基础URL: ${CONFIG.baseURL}`);
    console.log(`- 测试迭代次数: ${CONFIG.testIterations}`);
    console.log(`- API响应时间阈值: ${CONFIG.performanceThresholds.apiResponse}ms`);
    console.log(`- 缓存命中阈值: ${CONFIG.performanceThresholds.cacheHit}ms`);

    // API响应时间测试
    console.log('\n📊 API响应时间测试');
    console.log('='.repeat(50));

    const apiEndpoints = [
      { endpoint: '/api/production/plans', description: '生产计划API' },
      { endpoint: '/api/production/tasks', description: '生产任务API' },
      { endpoint: '/api/equipment', description: '设备管理API' },
      { endpoint: '/api/equipment/molds', description: '模具管理API' },
      { endpoint: '/api/quality/inspections', description: '质量检验API' },
      { endpoint: '/api/inventory', description: '库存管理API' },
      { endpoint: '/api/reports/production', description: '生产报表API' }
    ];

    for (const { endpoint, description } of apiEndpoints) {
      await this.testAPIResponseTime(endpoint, description);
    }

    // 缓存效果测试
    console.log('\n🔄 缓存效果测试');
    console.log('='.repeat(50));

    const cacheEndpoints = [
      { endpoint: '/api/production/plans', description: '生产计划缓存' },
      { endpoint: '/api/equipment', description: '设备管理缓存' },
      { endpoint: '/api/quality/inspections', description: '质量检验缓存' }
    ];

    for (const { endpoint, description } of cacheEndpoints) {
      await this.testCacheEffectiveness(endpoint, description);
    }

    // 生成测试报告
    this.generateReport();
  }

  // 生成测试报告
  generateReport() {
    console.log('\n📋 性能测试报告');
    console.log('='.repeat(50));

    const totalTests = this.results.overallResults.passed + this.results.overallResults.failed;
    const passRate = totalTests > 0 ? (this.results.overallResults.passed / totalTests * 100).toFixed(2) : 0;

    console.log(`总测试数: ${totalTests}`);
    console.log(`通过: ${this.results.overallResults.passed}`);
    console.log(`失败: ${this.results.overallResults.failed}`);
    console.log(`通过率: ${passRate}%`);

    if (this.results.overallResults.warnings.length > 0) {
      console.log(`\n⚠️ 警告信息:`);
      this.results.overallResults.warnings.forEach(warning => {
        console.log(`  - ${warning}`);
      });
    }

    // API测试详情
    if (this.results.apiTests.length > 0) {
      console.log('\n📊 API响应时间详情:');
      this.results.apiTests.forEach(test => {
        const status = test.status === 'passed' ? '✅' : '❌';
        console.log(`  ${status} ${test.description}: 平均 ${test.avgTime}ms (范围: ${test.minTime}-${test.maxTime}ms)`);
      });
    }

    // 缓存测试详情
    if (this.results.cacheTests.length > 0) {
      console.log('\n🔄 缓存效果详情:');
      this.results.cacheTests.forEach(test => {
        const status = test.status === 'passed' ? '✅' : test.status === 'warning' ? '⚠️' : '❌';
        console.log(`  ${status} ${test.description}: 改善 ${test.improvement}% (${test.firstRequestTime}ms → ${test.secondRequestTime}ms)`);
      });
    }

    // 性能建议
    console.log('\n💡 性能优化建议:');
    
    const slowAPIs = this.results.apiTests.filter(test => parseFloat(test.avgTime) > 1000);
    if (slowAPIs.length > 0) {
      console.log('  - 以下API响应较慢，建议优化:');
      slowAPIs.forEach(api => {
        console.log(`    * ${api.description}: ${api.avgTime}ms`);
      });
    }

    const poorCache = this.results.cacheTests.filter(test => parseFloat(test.improvement) < 20);
    if (poorCache.length > 0) {
      console.log('  - 以下缓存效果不佳，建议检查缓存配置:');
      poorCache.forEach(cache => {
        console.log(`    * ${cache.description}: 仅改善 ${cache.improvement}%`);
      });
    }

    if (slowAPIs.length === 0 && poorCache.length === 0) {
      console.log('  - 系统性能表现良好，无需特别优化');
    }

    // 保存报告到文件
    const reportData = {
      timestamp: new Date().toISOString(),
      config: CONFIG,
      results: this.results,
      summary: {
        totalTests,
        passed: this.results.overallResults.passed,
        failed: this.results.overallResults.failed,
        passRate: parseFloat(passRate)
      }
    };

    require('fs').writeFileSync(
      'logs/performance-test-report.json',
      JSON.stringify(reportData, null, 2)
    );

    console.log('\n📄 详细报告已保存到: logs/performance-test-report.json');

    // 返回测试结果
    return {
      success: this.results.overallResults.failed === 0,
      summary: reportData.summary,
      hasWarnings: this.results.overallResults.warnings.length > 0
    };
  }
}

// 主函数
async function main() {
  const tester = new PerformanceTestRunner();
  
  try {
    const result = await tester.runAllTests();
    
    if (result.success) {
      console.log('\n🎉 所有性能测试通过！');
      process.exit(0);
    } else {
      console.log('\n❌ 部分性能测试失败，请检查系统配置');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 性能测试执行失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { PerformanceTestRunner, CONFIG };