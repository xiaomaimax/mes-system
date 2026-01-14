/**
 * 属性测试运行脚本
 * 
 * 运行所有属性测试并生成详细报告
 * 
 * 使用方法：
 * node scripts/run-property-tests.js [--property=1,2,3] [--verbose] [--coverage]
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

// 配置
const config = {
  testDir: path.join(__dirname, '..', 'client', 'src', 'tests', 'properties'),
  outputDir: path.join(__dirname, '..', 'logs', 'property-tests'),
  jestConfig: path.join(__dirname, '..', 'client', 'src', 'tests', 'properties', 'jest.config.js')
};

// 属性测试映射
const propertyTests = {
  1: {
    name: 'API数据完整性',
    file: 'ComponentDataSyncProperty.test.js',
    description: '验证API返回数据的完整性和一致性'
  },
  2: {
    name: '分页一致性',
    file: 'PaginationConsistencyProperty.test.js',
    description: '验证分页功能的一致性'
  },
  3: {
    name: '错误处理一致性',
    file: 'ErrorHandlingProperty.test.js',
    description: '验证错误处理的一致性'
  },
  4: {
    name: '数据缓存有效性',
    file: 'CacheValidityProperty.test.js',
    description: '验证数据缓存机制的有效性'
  },
  5: {
    name: '组件数据同步',
    file: 'ComponentDataSyncProperty.test.js',
    description: '验证组件与数据库数据的同步'
  },
  6: {
    name: '演示数据完整性',
    file: 'DemoDataIntegrityProperty.test.js',
    description: '验证演示数据的完整性'
  },
  7: {
    name: '加载状态管理',
    file: 'LoadingStateProperty.test.js',
    description: '验证加载状态的正确管理'
  }
};

class PropertyTestRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      properties: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      }
    };
  }

  /**
   * 解析命令行参数
   */
  parseArgs() {
    const args = process.argv.slice(2);
    const options = {
      properties: [],
      verbose: false,
      coverage: false,
      watch: false
    };

    for (const arg of args) {
      if (arg.startsWith('--property=')) {
        const propertyIds = arg.split('=')[1].split(',').map(id => parseInt(id.trim()));
        options.properties = propertyIds.filter(id => propertyTests[id]);
      } else if (arg === '--verbose') {
        options.verbose = true;
      } else if (arg === '--coverage') {
        options.coverage = true;
      } else if (arg === '--watch') {
        options.watch = true;
      }
    }

    // 如果没有指定属性，运行所有属性测试
    if (options.properties.length === 0) {
      options.properties = Object.keys(propertyTests).map(id => parseInt(id));
    }

    return options;
  }

  /**
   * 确保输出目录存在
   */
  ensureOutputDir() {
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }
  }

  /**
   * 运行单个属性测试
   */
  async runPropertyTest(propertyId, options) {
    const property = propertyTests[propertyId];
    if (!property) {
      throw new Error(`未知的属性测试ID: ${propertyId}`);
    }

    console.log(chalk.blue(`\n运行属性测试 ${propertyId}: ${property.name}`));
    console.log(chalk.gray(`描述: ${property.description}`));

    const testFile = path.join(config.testDir, property.file);
    
    // 检查测试文件是否存在
    if (!fs.existsSync(testFile)) {
      console.log(chalk.yellow(`⚠ 测试文件不存在: ${property.file}`));
      this.results.properties[propertyId] = {
        name: property.name,
        status: 'skipped',
        reason: '测试文件不存在'
      };
      this.results.summary.skipped++;
      return;
    }

    // 构建Jest命令
    const jestArgs = [
      '--config', config.jestConfig,
      '--testPathPattern', property.file,
      '--no-cache'
    ];

    if (options.verbose) {
      jestArgs.push('--verbose');
    }

    if (options.coverage) {
      jestArgs.push('--coverage');
    }

    if (options.watch) {
      jestArgs.push('--watch');
    }

    // 运行测试
    return new Promise((resolve) => {
      const jest = spawn('npx', ['jest', ...jestArgs], {
        cwd: path.join(__dirname, '..', 'client'),
        stdio: options.verbose ? 'inherit' : 'pipe'
      });

      let output = '';
      let errorOutput = '';

      if (!options.verbose) {
        jest.stdout.on('data', (data) => {
          output += data.toString();
        });

        jest.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });
      }

      jest.on('close', (code) => {
        const success = code === 0;
        
        this.results.properties[propertyId] = {
          name: property.name,
          status: success ? 'passed' : 'failed',
          exitCode: code,
          output: output,
          error: errorOutput
        };

        if (success) {
          console.log(chalk.green(`✓ 属性测试 ${propertyId} 通过`));
          this.results.summary.passed++;
        } else {
          console.log(chalk.red(`✗ 属性测试 ${propertyId} 失败`));
          if (!options.verbose && errorOutput) {
            console.log(chalk.red('错误输出:'));
            console.log(errorOutput);
          }
          this.results.summary.failed++;
        }

        this.results.summary.total++;
        resolve();
      });
    });
  }

  /**
   * 运行所有指定的属性测试
   */
  async runTests(options) {
    console.log(chalk.blue('开始运行属性测试'));
    console.log(chalk.gray(`测试属性: ${options.properties.join(', ')}`));
    console.log(chalk.gray(`详细输出: ${options.verbose ? '是' : '否'}`));
    console.log(chalk.gray(`代码覆盖率: ${options.coverage ? '是' : '否'}`));

    this.ensureOutputDir();

    // 按顺序运行每个属性测试
    for (const propertyId of options.properties) {
      await this.runPropertyTest(propertyId, options);
    }

    // 生成报告
    this.generateReport();
    this.saveReport();
  }

  /**
   * 生成测试报告
   */
  generateReport() {
    console.log(chalk.blue('\n' + '='.repeat(60)));
    console.log(chalk.blue('属性测试报告'));
    console.log(chalk.blue('='.repeat(60)));

    console.log(chalk.gray(`\n测试时间: ${this.results.timestamp}`));
    console.log(chalk.gray(`总测试数: ${this.results.summary.total}`));
    console.log(chalk.green(`通过: ${this.results.summary.passed}`));
    console.log(chalk.red(`失败: ${this.results.summary.failed}`));
    console.log(chalk.yellow(`跳过: ${this.results.summary.skipped}`));

    // 详细结果
    console.log(chalk.blue('\n详细结果:'));
    for (const [propertyId, result] of Object.entries(this.results.properties)) {
      const statusColor = result.status === 'passed' ? chalk.green : 
                         result.status === 'failed' ? chalk.red : chalk.yellow;
      
      console.log(statusColor(`\n属性 ${propertyId}: ${result.name}`));
      console.log(statusColor(`  状态: ${result.status}`));
      
      if (result.reason) {
        console.log(chalk.yellow(`  原因: ${result.reason}`));
      }
      
      if (result.exitCode !== undefined) {
        console.log(chalk.gray(`  退出码: ${result.exitCode}`));
      }
    }

    // 失败的测试
    const failedTests = Object.entries(this.results.properties)
      .filter(([_, result]) => result.status === 'failed');

    if (failedTests.length > 0) {
      console.log(chalk.red('\n失败的测试:'));
      failedTests.forEach(([propertyId, result]) => {
        console.log(chalk.red(`\n属性 ${propertyId}: ${result.name}`));
        if (result.error) {
          console.log(chalk.red('错误信息:'));
          console.log(result.error);
        }
      });
    }

    console.log(chalk.blue('\n' + '='.repeat(60)));

    // 总结
    const successRate = this.results.summary.total > 0 ? 
      (this.results.summary.passed / this.results.summary.total * 100).toFixed(1) : 0;
    
    console.log(chalk.blue(`\n测试成功率: ${successRate}%`));
    
    if (this.results.summary.failed === 0) {
      console.log(chalk.green('🎉 所有属性测试都通过了！'));
    } else {
      console.log(chalk.red(`❌ ${this.results.summary.failed} 个属性测试失败`));
    }
  }

  /**
   * 保存测试报告
   */
  saveReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(config.outputDir, `property-test-report-${timestamp}.json`);
    
    fs.writeFileSync(reportFile, JSON.stringify(this.results, null, 2));
    console.log(chalk.green(`\n测试报告已保存: ${reportFile}`));

    // 同时保存最新报告
    const latestReportFile = path.join(config.outputDir, 'latest-property-test-report.json');
    fs.writeFileSync(latestReportFile, JSON.stringify(this.results, null, 2));
  }

  /**
   * 显示帮助信息
   */
  static showHelp() {
    console.log(chalk.blue('属性测试运行器'));
    console.log(chalk.gray('运行MES系统的属性测试'));
    
    console.log(chalk.blue('\n使用方法:'));
    console.log('  node scripts/run-property-tests.js [选项]');
    
    console.log(chalk.blue('\n选项:'));
    console.log('  --property=1,2,3  运行指定的属性测试（默认：全部）');
    console.log('  --verbose         显示详细输出');
    console.log('  --coverage        生成代码覆盖率报告');
    console.log('  --watch           监视模式');
    console.log('  --help            显示帮助信息');
    
    console.log(chalk.blue('\n可用的属性测试:'));
    Object.entries(propertyTests).forEach(([id, property]) => {
      console.log(`  ${id}: ${property.name} - ${property.description}`);
    });
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    PropertyTestRunner.showHelp();
    return;
  }

  const runner = new PropertyTestRunner();
  const options = runner.parseArgs();
  
  try {
    await runner.runTests(options);
    
    // 根据测试结果设置退出码
    const exitCode = runner.results.summary.failed > 0 ? 1 : 0;
    process.exit(exitCode);
    
  } catch (error) {
    console.error(chalk.red('运行属性测试时出错:'), error);
    process.exit(1);
  }
}

// 运行
if (require.main === module) {
  main();
}

module.exports = PropertyTestRunner;