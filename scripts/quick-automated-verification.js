/**
 * 快速自动化验证脚本
 * 
 * 不需要额外依赖，使用现有工具进行API级别的验证
 * 
 * 使用方法：
 * node scripts/quick-automated-verification.js [--stage=1]
 */

const chalk = require('chalk');
const http = require('http');
const fs = require('fs');

class QuickAutomatedVerifier {
  constructor() {
    this.baseUrl = 'http://localhost:3001'; // 后端API地址
    this.results = {
      timestamp: new Date().toISOString(),
      stage: null,
      components: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        successRate: 0
      }
    };
  }

  parseArgs() {
    const args = process.argv.slice(2);
    const stageArg = args.find(arg => arg.startsWith('--stage='));
    if (stageArg) {
      this.results.stage = parseInt(stageArg.split('=')[1]);
    }
  }

  async makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (data) {
        options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
      }

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const result = {
              statusCode: res.statusCode,
              data: body ? JSON.parse(body) : null
            };
            resolve(result);
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              data: body,
              parseError: true
            });
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  async testApiEndpoint(endpoint, method = 'GET', testData = null, expectedStatus = 200) {
    try {
      console.log(chalk.blue(`🧪 测试 ${method} ${endpoint}`));
      
      const response = await this.makeRequest(endpoint, method, testData);
      
      const success = response.statusCode === expectedStatus;
      
      if (success) {
        console.log(chalk.green(`✅ ${method} ${endpoint} - 成功 (${response.statusCode})`));
      } else {
        console.log(chalk.red(`❌ ${method} ${endpoint} - 失败 (${response.statusCode})`));
      }
      
      return {
        success,
        statusCode: response.statusCode,
        data: response.data,
        endpoint,
        method
      };
    } catch (error) {
      console.log(chalk.red(`❌ ${method} ${endpoint} - 错误: ${error.message}`));
      return {
        success: false,
        error: error.message,
        endpoint,
        method
      };
    }
  }

  async testComponentApis(componentConfig) {
    console.log(chalk.blue(`\n🔧 测试组件: ${componentConfig.name}`));
    
    const results = {
      componentName: componentConfig.name,
      tests: [],
      passed: 0,
      total: 0
    };
    
    // 测试获取数据API
    if (componentConfig.getEndpoint) {
      const getResult = await this.testApiEndpoint(componentConfig.getEndpoint, 'GET');
      results.tests.push({ name: '获取数据', ...getResult });
      results.total++;
      if (getResult.success) results.passed++;
    }
    
    // 测试添加数据API
    if (componentConfig.addEndpoint && componentConfig.testData) {
      const addResult = await this.testApiEndpoint(
        componentConfig.addEndpoint, 
        'POST', 
        componentConfig.testData,
        201
      );
      results.tests.push({ name: '添加数据', ...addResult });
      results.total++;
      if (addResult.success) results.passed++;
    }
    
    // 测试删除数据API (如果有ID)
    if (componentConfig.deleteEndpoint) {
      const deleteResult = await this.testApiEndpoint(
        componentConfig.deleteEndpoint.replace(':id', '1'), 
        'DELETE',
        null,
        200
      );
      results.tests.push({ name: '删除数据', ...deleteResult });
      results.total++;
      if (deleteResult.success) results.passed++;
    }
    
    results.successRate = results.total > 0 ? (results.passed / results.total * 100).toFixed(1) : 0;
    
    console.log(chalk.gray(`  成功率: ${results.successRate}% (${results.passed}/${results.total})`));
    
    return results;
  }

  async runStage1() {
    console.log(chalk.blue('\n🎯 阶段1: 已修复组件API验证'));
    
    const components = [
      {
        name: '工艺管理-主数据',
        getEndpoint: '/api/process/products',
        addEndpoint: '/api/process/products',
        deleteEndpoint: '/api/process/products/:id',
        testData: {
          productCode: 'TEST-P001',
          productName: '验证测试产品A',
          category: '注塑件',
          specification: '100×50×20mm',
          material: 'ABS塑料',
          version: 'V1.0'
        }
      },
      {
        name: '库存管理-主数据',
        getEndpoint: '/api/inventory',
        addEndpoint: '/api/inventory',
        deleteEndpoint: '/api/inventory/:id',
        testData: {
          materialCode: 'MAT-TEST001',
          materialName: '验证测试物料',
          category: '原材料',
          specification: '测试规格',
          unit: 'kg'
        }
      }
    ];
    
    for (const component of components) {
      const result = await this.testComponentApis(component);
      this.results.components.push(result);
      this.results.summary.total += result.total;
      this.results.summary.passed += result.passed;
      this.results.summary.failed += (result.total - result.passed);
    }
  }

  async runStage2() {
    console.log(chalk.blue('\n🎯 阶段2: 良好组件API验证'));
    
    const components = [
      {
        name: '生产管理-工作报告管理',
        getEndpoint: '/api/production/work-reports',
        addEndpoint: '/api/production/work-reports',
        testData: {
          reportCode: 'RPT-TEST001',
          reportTitle: '验证测试报告'
        }
      },
      {
        name: '设备管理-设备主数据',
        getEndpoint: '/api/equipment/master-data',
        addEndpoint: '/api/equipment/master-data',
        testData: {
          equipmentCode: 'EQ-TEST001',
          equipmentName: '验证测试设备'
        }
      }
    ];
    
    for (const component of components) {
      const result = await this.testComponentApis(component);
      this.results.components.push(result);
      this.results.summary.total += result.total;
      this.results.summary.passed += result.passed;
      this.results.summary.failed += (result.total - result.passed);
    }
  }

  async checkServerStatus() {
    console.log(chalk.blue('🔍 检查服务器状态...'));
    
    try {
      const response = await this.makeRequest('/api/health', 'GET');
      if (response.statusCode === 200) {
        console.log(chalk.green('✅ 后端服务器运行正常'));
        return true;
      } else {
        console.log(chalk.yellow(`⚠️ 服务器响应异常: ${response.statusCode}`));
        return false;
      }
    } catch (error) {
      console.log(chalk.red(`❌ 无法连接到服务器: ${error.message}`));
      console.log(chalk.yellow('💡 请确保后端服务已启动: npm run dev'));
      return false;
    }
  }

  generateReport() {
    this.results.summary.successRate = this.results.summary.total > 0 ? 
      (this.results.summary.passed / this.results.summary.total * 100).toFixed(1) : 0;
    
    console.log(chalk.blue('\n' + '='.repeat(60)));
    console.log(chalk.blue('📊 快速自动化验证报告'));
    console.log(chalk.blue('='.repeat(60)));
    
    console.log(chalk.blue('\n📈 总体统计:'));
    console.log(chalk.gray(`验证时间: ${this.results.timestamp}`));
    console.log(chalk.gray(`验证阶段: ${this.results.stage || '全部'}`));
    console.log(chalk.gray(`总测试数: ${this.results.summary.total}`));
    console.log(chalk.green(`通过测试: ${this.results.summary.passed}`));
    console.log(chalk.red(`失败测试: ${this.results.summary.failed}`));
    console.log(chalk.blue(`成功率: ${this.results.summary.successRate}%`));
    
    console.log(chalk.blue('\n📋 组件详情:'));
    for (const component of this.results.components) {
      const status = component.passed === component.total ? '✅' : 
                    component.passed > 0 ? '⚠️' : '❌';
      console.log(`${status} ${component.componentName} (${component.successRate}%)`);
      
      for (const test of component.tests) {
        const testStatus = test.success ? '✅' : '❌';
        console.log(`  ${testStatus} ${test.name} - ${test.method} ${test.endpoint}`);
        if (!test.success && test.error) {
          console.log(chalk.red(`    错误: ${test.error}`));
        }
      }
    }
    
    // 保存报告
    const reportPath = `quick-verification-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(chalk.blue(`\n📄 详细报告已保存到: ${reportPath}`));
    
    return this.results;
  }

  async run() {
    try {
      this.parseArgs();
      
      console.log(chalk.blue('🚀 开始快速自动化验证...'));
      
      // 检查服务器状态
      const serverOk = await this.checkServerStatus();
      if (!serverOk) {
        throw new Error('服务器未运行，无法进行API验证');
      }
      
      // 根据阶段运行测试
      if (this.results.stage === 1) {
        await this.runStage1();
      } else if (this.results.stage === 2) {
        await this.runStage2();
      } else {
        await this.runStage1();
        await this.runStage2();
      }
      
      const report = this.generateReport();
      
      console.log(chalk.green('\n🎉 快速自动化验证完成！'));
      
      if (report.summary.successRate >= 80) {
        console.log(chalk.green('✅ 系统状态良好'));
      } else if (report.summary.successRate >= 50) {
        console.log(chalk.yellow('⚠️ 系统有部分问题'));
      } else {
        console.log(chalk.red('❌ 系统存在严重问题'));
      }
      
      return report;
      
    } catch (error) {
      console.error(chalk.red(`❌ 验证失败: ${error.message}`));
      throw error;
    }
  }
}

// 主函数
async function main() {
  const verifier = new QuickAutomatedVerifier();
  try {
    await verifier.run();
  } catch (error) {
    console.error(chalk.red('快速自动化验证失败:'), error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = QuickAutomatedVerifier;