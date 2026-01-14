#!/usr/bin/env node

/**
 * 性能测试指南脚本
 * 提供性能测试的详细指导和检查清单
 */

const fs = require('fs');
const path = require('path');

class PerformanceTestGuide {
  constructor() {
    this.testResults = {
      serverStatus: false,
      clientStatus: false,
      performanceChecks: []
    };
  }

  // 检查服务器状态
  async checkServerStatus() {
    console.log('🔍 检查服务器状态...');
    
    const axios = require('axios');
    
    try {
      const response = await axios.get('http://localhost:3001/api/health', { timeout: 5000 });
      console.log('✅ 后端服务器运行正常');
      console.log(`   - 状态: ${response.data.status}`);
      console.log(`   - 运行时间: ${Math.floor(response.data.uptime)}秒`);
      console.log(`   - 环境: ${response.data.environment}`);
      this.testResults.serverStatus = true;
      return true;
    } catch (error) {
      console.log('❌ 后端服务器未运行');
      console.log('   请运行: npm run server 或 node server/app.js');
      this.testResults.serverStatus = false;
      return false;
    }
  }

  // 检查客户端状态
  async checkClientStatus() {
    console.log('\n🌐 检查前端服务状态...');
    
    const axios = require('axios');
    
    try {
      const response = await axios.get('http://localhost:3000', { timeout: 5000 });
      console.log('✅ 前端服务器运行正常');
      this.testResults.clientStatus = true;
      return true;
    } catch (error) {
      console.log('❌ 前端服务器未运行');
      console.log('   请运行: npm run client 或 cd client && npm start');
      this.testResults.clientStatus = false;
      return false;
    }
  }

  // 执行基本性能检查
  async performBasicChecks() {
    console.log('\n📊 执行基本性能检查...');
    
    if (!this.testResults.serverStatus) {
      console.log('⚠️ 跳过API性能测试 - 服务器未运行');
      return;
    }

    const axios = require('axios');
    const { performance } = require('perf_hooks');

    const apiEndpoints = [
      { url: '/api/health', name: '健康检查' },
      { url: '/api/production/plans', name: '生产计划' },
      { url: '/api/equipment', name: '设备管理' },
      { url: '/api/quality/inspections', name: '质量检验' },
      { url: '/api/inventory', name: '库存管理' }
    ];

    for (const endpoint of apiEndpoints) {
      try {
        const startTime = performance.now();
        const response = await axios.get(`http://localhost:3001${endpoint.url}`, { timeout: 10000 });
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        const status = responseTime < 2000 ? '✅' : responseTime < 5000 ? '⚠️' : '❌';
        console.log(`${status} ${endpoint.name}: ${responseTime.toFixed(2)}ms (状态: ${response.status})`);
        
        this.testResults.performanceChecks.push({
          endpoint: endpoint.name,
          responseTime: responseTime.toFixed(2),
          status: response.status,
          success: responseTime < 5000
        });
      } catch (error) {
        console.log(`❌ ${endpoint.name}: 请求失败 - ${error.message}`);
        this.testResults.performanceChecks.push({
          endpoint: endpoint.name,
          error: error.message,
          success: false
        });
      }
    }
  }

  // 生成性能测试报告
  generatePerformanceReport() {
    console.log('\n📋 性能测试报告');
    console.log('='.repeat(50));

    const timestamp = new Date().toISOString();
    
    // 系统状态
    console.log('🖥️ 系统状态:');
    console.log(`   后端服务: ${this.testResults.serverStatus ? '✅ 运行中' : '❌ 未运行'}`);
    console.log(`   前端服务: ${this.testResults.clientStatus ? '✅ 运行中' : '❌ 未运行'}`);

    // 性能检查结果
    if (this.testResults.performanceChecks.length > 0) {
      console.log('\n📊 API性能检查:');
      const successfulChecks = this.testResults.performanceChecks.filter(check => check.success);
      const totalChecks = this.testResults.performanceChecks.length;
      
      console.log(`   成功率: ${successfulChecks.length}/${totalChecks} (${(successfulChecks.length/totalChecks*100).toFixed(1)}%)`);
      
      const avgResponseTime = successfulChecks.length > 0 
        ? successfulChecks.reduce((sum, check) => sum + parseFloat(check.responseTime || 0), 0) / successfulChecks.length
        : 0;
      
      console.log(`   平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
    }

    // 性能优化建议
    console.log('\n💡 性能优化建议:');
    
    if (!this.testResults.serverStatus || !this.testResults.clientStatus) {
      console.log('   1. 确保所有服务都在运行');
      console.log('      - 后端: npm run server');
      console.log('      - 前端: npm run client');
    }

    const slowAPIs = this.testResults.performanceChecks.filter(check => 
      check.responseTime && parseFloat(check.responseTime) > 2000
    );
    
    if (slowAPIs.length > 0) {
      console.log('   2. 以下API响应较慢，建议优化:');
      slowAPIs.forEach(api => {
        console.log(`      - ${api.endpoint}: ${api.responseTime}ms`);
      });
    }

    const failedAPIs = this.testResults.performanceChecks.filter(check => !check.success);
    if (failedAPIs.length > 0) {
      console.log('   3. 以下API调用失败，需要检查:');
      failedAPIs.forEach(api => {
        console.log(`      - ${api.endpoint}: ${api.error || '未知错误'}`);
      });
    }

    if (this.testResults.serverStatus && this.testResults.clientStatus && slowAPIs.length === 0 && failedAPIs.length === 0) {
      console.log('   ✅ 系统性能表现良好，无需特别优化');
    }

    // 下一步建议
    console.log('\n🚀 下一步建议:');
    console.log('   1. 如果服务未运行，请先启动服务');
    console.log('   2. 运行完整的性能测试: node scripts/test-system-performance.js');
    console.log('   3. 检查数据库连接和数据完整性');
    console.log('   4. 测试前端组件的加载性能');
    console.log('   5. 验证缓存机制是否正常工作');

    // 保存报告
    const reportData = {
      timestamp,
      systemStatus: {
        server: this.testResults.serverStatus,
        client: this.testResults.clientStatus
      },
      performanceChecks: this.testResults.performanceChecks,
      summary: {
        totalChecks: this.testResults.performanceChecks.length,
        successfulChecks: this.testResults.performanceChecks.filter(c => c.success).length,
        averageResponseTime: this.testResults.performanceChecks.length > 0 
          ? this.testResults.performanceChecks
              .filter(c => c.responseTime)
              .reduce((sum, c) => sum + parseFloat(c.responseTime), 0) / 
            this.testResults.performanceChecks.filter(c => c.responseTime).length
          : 0
      }
    };

    // 确保logs目录存在
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs', { recursive: true });
    }

    fs.writeFileSync(
      'logs/performance-check-report.json',
      JSON.stringify(reportData, null, 2)
    );

    console.log('\n📄 报告已保存到: logs/performance-check-report.json');

    return reportData;
  }

  // 显示性能测试清单
  showPerformanceChecklist() {
    console.log('\n📋 性能测试清单');
    console.log('='.repeat(50));
    
    const checklist = [
      {
        category: '🖥️ 系统准备',
        items: [
          '启动后端服务器 (npm run server)',
          '启动前端服务器 (npm run client)',
          '确保数据库连接正常',
          '初始化演示数据 (node scripts/init-demo-data.js)'
        ]
      },
      {
        category: '🔧 后端性能测试',
        items: [
          'API响应时间测试 (< 2秒)',
          '数据库查询性能测试',
          '缓存机制效果测试',
          '并发请求处理测试',
          '内存使用情况监控'
        ]
      },
      {
        category: '🌐 前端性能测试',
        items: [
          '页面加载时间测试 (< 3秒)',
          '组件渲染性能测试',
          '大数据列表渲染测试',
          '路由切换性能测试',
          '静态资源加载测试'
        ]
      },
      {
        category: '📊 数据一致性测试',
        items: [
          '前后端数据同步测试',
          '缓存数据一致性测试',
          '实时数据更新测试',
          '错误处理机制测试'
        ]
      },
      {
        category: '🚀 用户体验测试',
        items: [
          '加载状态显示测试',
          '错误提示友好性测试',
          '操作响应及时性测试',
          '界面流畅度测试'
        ]
      }
    ];

    checklist.forEach(section => {
      console.log(`\n${section.category}:`);
      section.items.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item}`);
      });
    });

    console.log('\n💡 测试建议:');
    console.log('   - 在不同网络条件下测试');
    console.log('   - 测试不同数据量的性能表现');
    console.log('   - 监控长时间运行的稳定性');
    console.log('   - 记录性能基准数据');
  }

  // 运行性能检查
  async runPerformanceCheck() {
    console.log('🚀 开始性能检查...\n');
    
    await this.checkServerStatus();
    await this.checkClientStatus();
    await this.performBasicChecks();
    
    const report = this.generatePerformanceReport();
    this.showPerformanceChecklist();
    
    return report;
  }
}

// 主函数
async function main() {
  const guide = new PerformanceTestGuide();
  
  try {
    const report = await guide.runPerformanceCheck();
    
    const allServicesRunning = report.systemStatus.server && report.systemStatus.client;
    const performanceGood = report.summary.successfulChecks === report.summary.totalChecks;
    
    if (allServicesRunning && performanceGood) {
      console.log('\n🎉 系统性能检查通过！');
      console.log('可以继续进行更详细的性能测试。');
    } else {
      console.log('\n⚠️ 系统需要调整后再进行完整的性能测试。');
      console.log('请按照上述建议进行优化。');
    }
    
  } catch (error) {
    console.error('\n💥 性能检查执行失败:', error.message);
    console.error('请检查系统状态并重试。');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { PerformanceTestGuide };