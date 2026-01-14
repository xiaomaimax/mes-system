#!/usr/bin/env node

/**
 * 前端性能测试脚本
 * 测试前端组件加载时间、缓存效果、用户体验
 */

const puppeteer = require('puppeteer');
const { performance } = require('perf_hooks');

// 配置
const CONFIG = {
  baseURL: 'http://localhost:3000',
  testTimeout: 30000,
  performanceThresholds: {
    pageLoad: 3000,      // 页面加载时间阈值 (ms)
    componentRender: 1000, // 组件渲染时间阈值 (ms)
    apiCall: 2000        // API调用时间阈值 (ms)
  }
};

class FrontendPerformanceTestRunner {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      pageTests: [],
      componentTests: [],
      overallResults: {
        passed: 0,
        failed: 0,
        warnings: []
      }
    };
  }

  // 初始化浏览器
  async initBrowser() {
    console.log('🌐 启动浏览器...');
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // 设置视口
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // 监听控制台日志
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ 浏览器错误: ${msg.text()}`);
      }
    });
  }

  // 测试页面加载性能
  async testPageLoadPerformance(path, description) {
    console.log(`\n🔍 测试 ${description} 页面加载性能...`);

    try {
      const startTime = performance.now();
      
      // 导航到页面
      await this.page.goto(`${CONFIG.baseURL}${path}`, {
        waitUntil: 'networkidle2',
        timeout: CONFIG.testTimeout
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // 获取页面性能指标
      const performanceMetrics = await this.page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
        };
      });

      const result = {
        path,
        description,
        loadTime: loadTime.toFixed(2),
        domContentLoaded: performanceMetrics.domContentLoaded.toFixed(2),
        loadComplete: performanceMetrics.loadComplete.toFixed(2),
        firstPaint: performanceMetrics.firstPaint.toFixed(2),
        firstContentfulPaint: performanceMetrics.firstContentfulPaint.toFixed(2),
        status: loadTime <= CONFIG.performanceThresholds.pageLoad ? 'passed' : 'failed'
      };

      if (result.status === 'passed') {
        console.log(`✅ ${description} - 加载时间: ${result.loadTime}ms`);
        this.results.overallResults.passed++;
      } else {
        console.log(`❌ ${description} - 加载时间: ${result.loadTime}ms (超过阈值 ${CONFIG.performanceThresholds.pageLoad}ms)`);
        this.results.overallResults.failed++;
      }

      console.log(`  - DOM内容加载: ${result.domContentLoaded}ms`);
      console.log(`  - 首次绘制: ${result.firstPaint}ms`);
      console.log(`  - 首次内容绘制: ${result.firstContentfulPaint}ms`);

      this.results.pageTests.push(result);
      return result;

    } catch (error) {
      console.log(`❌ ${description} 页面加载失败: ${error.message}`);
      this.results.overallResults.failed++;
      return { path, description, status: 'failed', error: error.message };
    }
  }

  // 测试组件渲染性能
  async testComponentRenderPerformance(selector, description) {
    console.log(`\n⚡ 测试 ${description} 组件渲染性能...`);

    try {
      const startTime = performance.now();
      
      // 等待组件出现
      await this.page.waitForSelector(selector, { timeout: CONFIG.testTimeout });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // 检查组件是否包含数据
      const hasData = await this.page.evaluate((sel) => {
        const element = document.querySelector(sel);
        return element && element.textContent.trim().length > 0;
      }, selector);

      const result = {
        selector,
        description,
        renderTime: renderTime.toFixed(2),
        hasData,
        status: renderTime <= CONFIG.performanceThresholds.componentRender ? 'passed' : 'failed'
      };

      if (result.status === 'passed') {
        console.log(`✅ ${description} - 渲染时间: ${result.renderTime}ms (有数据: ${hasData})`);
        this.results.overallResults.passed++;
      } else {
        console.log(`❌ ${description} - 渲染时间: ${result.renderTime}ms (超过阈值 ${CONFIG.performanceThresholds.componentRender}ms)`);
        this.results.overallResults.failed++;
      }

      this.results.componentTests.push(result);
      return result;

    } catch (error) {
      console.log(`❌ ${description} 组件渲染失败: ${error.message}`);
      this.results.overallResults.failed++;
      return { selector, description, status: 'failed', error: error.message };
    }
  }

  // 测试API调用性能
  async testAPICallPerformance() {
    console.log(`\n🔗 测试前端API调用性能...`);

    // 监听网络请求
    const apiCalls = [];
    
    this.page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiCalls.push({
          url: response.url(),
          status: response.status(),
          timing: response.timing()
        });
      }
    });

    // 导航到一个包含多个API调用的页面
    await this.page.goto(`${CONFIG.baseURL}/production`, {
      waitUntil: 'networkidle2',
      timeout: CONFIG.testTimeout
    });

    // 分析API调用
    const apiResults = apiCalls.map(call => {
      const responseTime = call.timing ? call.timing.receiveHeadersEnd - call.timing.requestTime : 0;
      return {
        url: call.url,
        status: call.status,
        responseTime: responseTime.toFixed(2),
        success: call.status >= 200 && call.status < 300
      };
    });

    console.log(`  检测到 ${apiResults.length} 个API调用:`);
    apiResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} ${result.url.split('/api/')[1]} - ${result.responseTime}ms (状态: ${result.status})`);
    });

    return apiResults;
  }

  // 运行所有前端性能测试
  async runAllTests() {
    console.log('🚀 开始前端性能测试...\n');
    console.log(`配置信息:`);
    console.log(`- 基础URL: ${CONFIG.baseURL}`);
    console.log(`- 页面加载阈值: ${CONFIG.performanceThresholds.pageLoad}ms`);
    console.log(`- 组件渲染阈值: ${CONFIG.performanceThresholds.componentRender}ms`);

    await this.initBrowser();

    try {
      // 页面加载性能测试
      console.log('\n📊 页面加载性能测试');
      console.log('='.repeat(50));

      const pageTests = [
        { path: '/', description: '首页' },
        { path: '/production', description: '生产管理页面' },
        { path: '/equipment', description: '设备管理页面' },
        { path: '/quality', description: '质量管理页面' },
        { path: '/inventory', description: '库存管理页面' },
        { path: '/reports', description: '报表页面' }
      ];

      for (const { path, description } of pageTests) {
        await this.testPageLoadPerformance(path, description);
      }

      // 组件渲染性能测试
      console.log('\n⚡ 组件渲染性能测试');
      console.log('='.repeat(50));

      // 导航到生产页面进行组件测试
      await this.page.goto(`${CONFIG.baseURL}/production`, {
        waitUntil: 'networkidle2',
        timeout: CONFIG.testTimeout
      });

      const componentTests = [
        { selector: '.ant-table', description: '数据表格组件' },
        { selector: '.ant-card', description: '卡片组件' },
        { selector: '.ant-spin', description: '加载组件' }
      ];

      for (const { selector, description } of componentTests) {
        await this.testComponentRenderPerformance(selector, description);
      }

      // API调用性能测试
      console.log('\n🔗 API调用性能测试');
      console.log('='.repeat(50));
      
      await this.testAPICallPerformance();

      // 生成测试报告
      this.generateReport();

    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  // 生成测试报告
  generateReport() {
    console.log('\n📋 前端性能测试报告');
    console.log('='.repeat(50));

    const totalTests = this.results.overallResults.passed + this.results.overallResults.failed;
    const passRate = totalTests > 0 ? (this.results.overallResults.passed / totalTests * 100).toFixed(2) : 0;

    console.log(`总测试数: ${totalTests}`);
    console.log(`通过: ${this.results.overallResults.passed}`);
    console.log(`失败: ${this.results.overallResults.failed}`);
    console.log(`通过率: ${passRate}%`);

    // 页面测试详情
    if (this.results.pageTests.length > 0) {
      console.log('\n📊 页面加载详情:');
      this.results.pageTests.forEach(test => {
        const status = test.status === 'passed' ? '✅' : '❌';
        console.log(`  ${status} ${test.description}: ${test.loadTime}ms`);
      });
    }

    // 组件测试详情
    if (this.results.componentTests.length > 0) {
      console.log('\n⚡ 组件渲染详情:');
      this.results.componentTests.forEach(test => {
        const status = test.status === 'passed' ? '✅' : '❌';
        console.log(`  ${status} ${test.description}: ${test.renderTime}ms`);
      });
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
      'logs/frontend-performance-test-report.json',
      JSON.stringify(reportData, null, 2)
    );

    console.log('\n📄 详细报告已保存到: logs/frontend-performance-test-report.json');

    return {
      success: this.results.overallResults.failed === 0,
      summary: reportData.summary
    };
  }
}

// 主函数
async function main() {
  const tester = new FrontendPerformanceTestRunner();
  
  try {
    const result = await tester.runAllTests();
    
    if (result.success) {
      console.log('\n🎉 所有前端性能测试通过！');
      process.exit(0);
    } else {
      console.log('\n❌ 部分前端性能测试失败，请检查系统配置');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 前端性能测试执行失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { FrontendPerformanceTestRunner, CONFIG };