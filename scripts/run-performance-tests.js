#!/usr/bin/env node

/**
 * 综合性能测试脚本
 * 运行后端API和前端性能测试，生成综合报告
 */

const { PerformanceTestRunner } = require('./test-system-performance');
const { FrontendPerformanceTestRunner } = require('./test-frontend-performance');
const fs = require('fs');
const path = require('path');

class ComprehensivePerformanceTestRunner {
  constructor() {
    this.results = {
      backend: null,
      frontend: null,
      overall: {
        startTime: new Date(),
        endTime: null,
        duration: 0,
        totalTests: 0,
        totalPassed: 0,
        totalFailed: 0,
        passRate: 0
      }
    };
  }

  // 检查系统状态
  async checkSystemStatus() {
    console.log('🔍 检查系统状态...');
    
    const axios = require('axios');
    
    try {
      // 检查后端服务
      const backendResponse = await axios.get('http://localhost:3001/api/health', { timeout: 5000 });
      console.log('✅ 后端服务运行正常');
    } catch (error) {
      console.log('❌ 后端服务不可用，请先启动后端服务');
      throw new Error('后端服务不可用');
    }

    try {
      // 检查前端服务
      const frontendResponse = await axios.get('http://localhost:3000', { timeout: 5000 });
      console.log('✅ 前端服务运行正常');
    } catch (error) {
      console.log('❌ 前端服务不可用，请先启动前端服务');
      throw new Error('前端服务不可用');
    }

    console.log('✅ 系统状态检查完成\n');
  }

  // 运行后端性能测试
  async runBackendTests() {
    console.log('🔧 开始后端性能测试...');
    console.log('='.repeat(60));
    
    const backendTester = new PerformanceTestRunner();
    const result = await backendTester.runAllTests();
    
    this.results.backend = result;
    return result;
  }

  // 运行前端性能测试
  async runFrontendTests() {
    console.log('\n🌐 开始前端性能测试...');
    console.log('='.repeat(60));
    
    const frontendTester = new FrontendPerformanceTestRunner();
    const result = await frontendTester.runAllTests();
    
    this.results.frontend = result;
    return result;
  }

  // 生成综合报告
  generateComprehensiveReport() {
    this.results.overall.endTime = new Date();
    this.results.overall.duration = this.results.overall.endTime - this.results.overall.startTime;

    // 计算总体统计
    const backendSummary = this.results.backend?.summary || { totalTests: 0, passed: 0, failed: 0 };
    const frontendSummary = this.results.frontend?.summary || { totalTests: 0, passed: 0, failed: 0 };

    this.results.overall.totalTests = backendSummary.totalTests + frontendSummary.totalTests;
    this.results.overall.totalPassed = backendSummary.passed + frontendSummary.passed;
    this.results.overall.totalFailed = backendSummary.failed + frontendSummary.failed;
    this.results.overall.passRate = this.results.overall.totalTests > 0 
      ? (this.results.overall.totalPassed / this.results.overall.totalTests * 100).toFixed(2)
      : 0;

    console.log('\n📋 综合性能测试报告');
    console.log('='.repeat(60));
    console.log(`测试开始时间: ${this.results.overall.startTime.toLocaleString()}`);
    console.log(`测试结束时间: ${this.results.overall.endTime.toLocaleString()}`);
    console.log(`总测试时长: ${(this.results.overall.duration / 1000).toFixed(2)}秒`);
    console.log(`总测试数: ${this.results.overall.totalTests}`);
    console.log(`总通过数: ${this.results.overall.totalPassed}`);
    console.log(`总失败数: ${this.results.overall.totalFailed}`);
    console.log(`总通过率: ${this.results.overall.passRate}%`);

    // 后端测试摘要
    if (this.results.backend) {
      console.log('\n🔧 后端性能测试摘要:');
      console.log(`  - 测试数: ${backendSummary.totalTests}`);
      console.log(`  - 通过: ${backendSummary.passed}`);
      console.log(`  - 失败: ${backendSummary.failed}`);
      console.log(`  - 通过率: ${backendSummary.passRate}%`);
      console.log(`  - 状态: ${this.results.backend.success ? '✅ 通过' : '❌ 失败'}`);
    }

    // 前端测试摘要
    if (this.results.frontend) {
      console.log('\n🌐 前端性能测试摘要:');
      console.log(`  - 测试数: ${frontendSummary.totalTests}`);
      console.log(`  - 通过: ${frontendSummary.passed}`);
      console.log(`  - 失败: ${frontendSummary.failed}`);
      console.log(`  - 通过率: ${frontendSummary.passRate}%`);
      console.log(`  - 状态: ${this.results.frontend.success ? '✅ 通过' : '❌ 失败'}`);
    }

    // 性能评估
    console.log('\n📊 性能评估:');
    const overallSuccess = this.results.backend?.success && this.results.frontend?.success;
    
    if (overallSuccess) {
      console.log('🎉 系统性能表现优秀！');
      console.log('  - 所有API响应时间在可接受范围内');
      console.log('  - 前端页面加载速度良好');
      console.log('  - 缓存机制工作正常');
    } else {
      console.log('⚠️ 系统性能需要优化：');
      
      if (!this.results.backend?.success) {
        console.log('  - 后端API响应时间过长或缓存效果不佳');
      }
      
      if (!this.results.frontend?.success) {
        console.log('  - 前端页面加载时间过长或组件渲染缓慢');
      }
    }

    // 优化建议
    console.log('\n💡 优化建议:');
    if (this.results.backend?.hasWarnings) {
      console.log('  - 检查数据库查询性能，考虑添加索引');
      console.log('  - 优化API缓存策略，增加缓存命中率');
    }
    
    if (!this.results.frontend?.success) {
      console.log('  - 考虑实现代码分割和懒加载');
      console.log('  - 优化图片和静态资源加载');
      console.log('  - 使用虚拟滚动处理大量数据');
    }

    if (overallSuccess) {
      console.log('  - 系统性能良好，继续保持当前优化策略');
    }

    // 保存综合报告
    const reportData = {
      timestamp: new Date().toISOString(),
      overall: this.results.overall,
      backend: this.results.backend,
      frontend: this.results.frontend,
      recommendations: this.generateRecommendations()
    };

    // 确保logs目录存在
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs', { recursive: true });
    }

    fs.writeFileSync(
      'logs/comprehensive-performance-report.json',
      JSON.stringify(reportData, null, 2)
    );

    console.log('\n📄 综合报告已保存到: logs/comprehensive-performance-report.json');

    return {
      success: overallSuccess,
      summary: this.results.overall,
      recommendations: reportData.recommendations
    };
  }

  // 生成优化建议
  generateRecommendations() {
    const recommendations = [];

    if (this.results.backend && !this.results.backend.success) {
      recommendations.push({
        category: '后端优化',
        items: [
          '检查数据库查询性能，添加必要的索引',
          '实现更有效的缓存策略',
          '考虑使用连接池优化数据库连接',
          '优化API响应数据结构，减少不必要的字段'
        ]
      });
    }

    if (this.results.frontend && !this.results.frontend.success) {
      recommendations.push({
        category: '前端优化',
        items: [
          '实现代码分割和懒加载',
          '优化图片和静态资源加载',
          '使用虚拟滚动处理大量数据',
          '实现更好的缓存策略',
          '考虑使用Web Workers处理复杂计算'
        ]
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        category: '维护建议',
        items: [
          '定期监控系统性能指标',
          '建立性能基准测试',
          '持续优化用户体验',
          '保持代码质量和架构清晰'
        ]
      });
    }

    return recommendations;
  }

  // 运行所有测试
  async runAllTests() {
    try {
      console.log('🚀 开始综合性能测试...\n');
      
      // 检查系统状态
      await this.checkSystemStatus();
      
      // 运行后端测试
      await this.runBackendTests();
      
      // 运行前端测试
      await this.runFrontendTests();
      
      // 生成综合报告
      const result = this.generateComprehensiveReport();
      
      return result;
      
    } catch (error) {
      console.error('\n💥 综合性能测试执行失败:', error.message);
      throw error;
    }
  }
}

// 主函数
async function main() {
  const tester = new ComprehensivePerformanceTestRunner();
  
  try {
    const result = await tester.runAllTests();
    
    if (result.success) {
      console.log('\n🎉 综合性能测试全部通过！');
      console.log('系统性能表现优秀，可以投入生产使用。');
      process.exit(0);
    } else {
      console.log('\n⚠️ 部分性能测试未达到预期，建议进行优化。');
      console.log('请查看详细报告了解具体问题和优化建议。');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 综合性能测试执行失败:', error.message);
    console.error('请检查系统状态并重试。');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { ComprehensivePerformanceTestRunner };