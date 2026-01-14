/**
 * 自动化按钮功能验证脚本
 * 
 * 使用Puppeteer进行端到端测试，自动验证所有组件的按钮功能
 * 
 * 使用方法：
 * npm install puppeteer
 * node scripts/automated-button-verification.js [--headless] [--stage=1]
 */

const puppeteer = require('puppeteer');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

class AutomatedButtonVerifier {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      components: []
    };
    this.headless = true;
    this.stage = null;
    this.baseUrl = 'http://localhost:3000';
  }

  parseArgs() {
    const args = process.argv.slice(2);
    this.headless = !args.includes('--headless=false');
    
    const stageArg = args.find(arg => arg.startsWith('--stage='));
    if (stageArg) {
      this.stage = parseInt(stageArg.split('=')[1]);
    }
  }

  async init() {
    console.log(chalk.blue('🚀 启动自动化验证...'));
    
    this.browser = await puppeteer.launch({
      headless: this.headless,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // 设置超时时间
    this.page.setDefaultTimeout(30000);
    
    // 监听控制台错误
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(chalk.red(`浏览器控制台错误: ${msg.text()}`));
      }
    });
    
    // 监听页面错误
    this.page.on('pageerror', error => {
      console.log(chalk.red(`页面错误: ${error.message}`));
    });
  }

  async login() {
    console.log(chalk.blue('🔐 登录系统...'));
    
    try {
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
      
      // 检查是否已经登录
      const isLoggedIn = await this.page.$('.ant-layout-sider');
      if (isLoggedIn) {
        console.log(chalk.green('✅ 已经登录'));
        return true;
      }
      
      // 尝试登录
      await this.page.waitForSelector('input[placeholder*="用户名"], input[type="text"]', { timeout: 5000 });
      await this.page.type('input[placeholder*="用户名"], input[type="text"]', 'admin');
      await this.page.type('input[placeholder*="密码"], input[type="password"]', 'admin123');
      
      await this.page.click('button[type="submit"], .ant-btn-primary');
      await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      console.log(chalk.green('✅ 登录成功'));
      return true;
    } catch (error) {
      console.log(chalk.red(`❌ 登录失败: ${error.message}`));
      return false;
    }
  }

  async navigateToComponent(moduleName, componentName) {
    console.log(chalk.blue(`📍 导航到: ${moduleName} → ${componentName}`));
    
    try {
      // 等待侧边栏加载
      await this.page.waitForSelector('.ant-menu', { timeout: 10000 });
      
      // 点击模块菜单
      const moduleSelector = `.ant-menu-item, .ant-menu-submenu`;
      const moduleElements = await this.page.$$(moduleSelector);
      
      for (let element of moduleElements) {
        const text = await this.page.evaluate(el => el.textContent, element);
        if (text.includes(moduleName)) {
          await element.click();
          await this.page.waitForTimeout(1000);
          break;
        }
      }
      
      // 点击组件菜单
      const componentElements = await this.page.$$(moduleSelector);
      for (let element of componentElements) {
        const text = await this.page.evaluate(el => el.textContent, element);
        if (text.includes(componentName)) {
          await element.click();
          await this.page.waitForTimeout(2000);
          break;
        }
      }
      
      // 等待页面加载
      await this.page.waitForSelector('.ant-card, .ant-table', { timeout: 10000 });
      
      console.log(chalk.green(`✅ 成功导航到 ${moduleName} → ${componentName}`));
      return true;
    } catch (error) {
      console.log(chalk.red(`❌ 导航失败: ${error.message}`));
      return false;
    }
  }

  async testAddFunction(testData) {
    console.log(chalk.blue('🧪 测试新增功能...'));
    
    try {
      // 查找新增按钮
      const addButton = await this.page.$('button:has-text("新增"), .ant-btn:has-text("新增"), [aria-label*="新增"]');
      if (!addButton) {
        return { success: false, error: '未找到新增按钮' };
      }
      
      // 点击新增按钮
      await addButton.click();
      await this.page.waitForTimeout(1000);
      
      // 等待对话框出现
      await this.page.waitForSelector('.ant-modal', { timeout: 5000 });
      
      // 填写表单
      for (const [field, value] of Object.entries(testData)) {
        try {
          const input = await this.page.$(`input[placeholder*="${field}"], input[name="${field}"], textarea[name="${field}"]`);
          if (input) {
            await input.clear();
            await input.type(value);
          } else {
            // 尝试选择框
            const select = await this.page.$(`[title="${field}"] + .ant-select, .ant-select:has([title*="${field}"])`);
            if (select) {
              await select.click();
              await this.page.waitForTimeout(500);
              await this.page.click(`.ant-select-dropdown .ant-select-item:has-text("${value}")`);
            }
          }
        } catch (e) {
          console.log(chalk.yellow(`⚠️ 字段 ${field} 填写失败: ${e.message}`));
        }
      }
      
      // 点击确定按钮
      await this.page.click('.ant-modal .ant-btn-primary');
      await this.page.waitForTimeout(2000);
      
      // 检查成功消息
      const successMessage = await this.page.$('.ant-message-success, .ant-notification-notice-success');
      if (!successMessage) {
        return { success: false, error: '未显示成功消息' };
      }
      
      // 检查数据是否显示在表格中
      await this.page.waitForTimeout(1000);
      const tableRows = await this.page.$$('.ant-table-tbody tr');
      const hasNewData = tableRows.length > 0;
      
      return { 
        success: true, 
        hasSuccessMessage: true, 
        dataDisplayed: hasNewData,
        rowCount: tableRows.length
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testDeleteFunction() {
    console.log(chalk.blue('🗑️ 测试删除功能...'));
    
    try {
      // 查找删除按钮
      const deleteButton = await this.page.$('button:has-text("删除"), .ant-btn:has-text("删除"), [aria-label*="删除"]');
      if (!deleteButton) {
        return { success: false, error: '未找到删除按钮' };
      }
      
      // 记录删除前的行数
      const beforeRows = await this.page.$$('.ant-table-tbody tr');
      const beforeCount = beforeRows.length;
      
      // 点击删除按钮
      await deleteButton.click();
      await this.page.waitForTimeout(1000);
      
      // 处理确认对话框
      try {
        await this.page.waitForSelector('.ant-popconfirm, .ant-modal', { timeout: 2000 });
        await this.page.click('.ant-popconfirm .ant-btn-primary, .ant-modal .ant-btn-primary');
        await this.page.waitForTimeout(2000);
      } catch (e) {
        // 可能没有确认对话框
      }
      
      // 检查删除后的行数
      const afterRows = await this.page.$$('.ant-table-tbody tr');
      const afterCount = afterRows.length;
      
      return { 
        success: true, 
        beforeCount, 
        afterCount,
        deleted: afterCount < beforeCount
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testComponent(config) {
    console.log(chalk.blue(`\n🧪 测试组件: ${config.moduleName} → ${config.componentName}`));
    
    const result = {
      moduleName: config.moduleName,
      componentName: config.componentName,
      tests: {
        navigation: { success: false },
        pageLoad: { success: false },
        addFunction: { success: false },
        deleteFunction: { success: false }
      },
      overall: 'failed'
    };
    
    try {
      // 导航测试
      result.tests.navigation.success = await this.navigateToComponent(config.moduleName, config.componentName);
      if (!result.tests.navigation.success) {
        return result;
      }
      
      // 页面加载测试
      await this.page.waitForTimeout(2000);
      const hasContent = await this.page.$('.ant-card, .ant-table, .ant-tabs');
      result.tests.pageLoad.success = !!hasContent;
      
      if (result.tests.pageLoad.success) {
        // 新增功能测试
        if (config.testData) {
          const addResult = await this.testAddFunction(config.testData);
          result.tests.addFunction = addResult;
        }
        
        // 删除功能测试
        const deleteResult = await this.testDeleteFunction();
        result.tests.deleteFunction = deleteResult;
      }
      
      // 计算总体结果
      const passedTests = Object.values(result.tests).filter(test => test.success).length;
      const totalTests = Object.keys(result.tests).length;
      
      if (passedTests === totalTests) {
        result.overall = 'passed';
      } else if (passedTests > totalTests / 2) {
        result.overall = 'partial';
      } else {
        result.overall = 'failed';
      }
      
      this.results.totalTests += totalTests;
      this.results.passedTests += passedTests;
      this.results.failedTests += (totalTests - passedTests);
      
    } catch (error) {
      result.error = error.message;
      console.log(chalk.red(`❌ 组件测试失败: ${error.message}`));
    }
    
    this.results.components.push(result);
    return result;
  }

  async runStage1() {
    console.log(chalk.blue('\n🎯 阶段1: 已修复组件验证'));
    
    const components = [
      {
        moduleName: '工艺管理',
        componentName: '主数据',
        testData: {
          '产品编码': 'TEST-P001',
          '产品名称': '验证测试产品A',
          '产品类别': '注塑件',
          '规格型号': '100×50×20mm',
          '主要材料': 'ABS塑料',
          '版本号': 'V1.0'
        }
      },
      {
        moduleName: '库存管理',
        componentName: '主数据',
        testData: {
          '物料编码': 'MAT-TEST001',
          '物料名称': '验证测试物料',
          '物料类别': '原材料',
          '规格': '测试规格',
          '单位': 'kg'
        }
      }
    ];
    
    for (const component of components) {
      await this.testComponent(component);
    }
  }

  async runStage2() {
    console.log(chalk.blue('\n🎯 阶段2: 良好组件验证'));
    
    const components = [
      {
        moduleName: '生产管理',
        componentName: '工作报告管理',
        testData: {
          '报告编号': 'RPT-TEST001',
          '报告标题': '验证测试报告'
        }
      },
      {
        moduleName: '设备管理',
        componentName: '设备主数据',
        testData: {
          '设备编码': 'EQ-TEST001',
          '设备名称': '验证测试设备'
        }
      },
      {
        moduleName: '质量管理',
        componentName: '检验标准',
        testData: {
          '标准编码': 'STD-TEST001',
          '标准名称': '验证测试标准'
        }
      }
    ];
    
    for (const component of components) {
      await this.testComponent(component);
    }
  }

  async runAllStages() {
    await this.runStage1();
    await this.runStage2();
    // 可以继续添加其他阶段
  }

  generateReport() {
    console.log(chalk.blue('\n📊 生成验证报告...'));
    
    const report = {
      ...this.results,
      summary: {
        totalComponents: this.results.components.length,
        passedComponents: this.results.components.filter(c => c.overall === 'passed').length,
        partialComponents: this.results.components.filter(c => c.overall === 'partial').length,
        failedComponents: this.results.components.filter(c => c.overall === 'failed').length,
        successRate: ((this.results.passedTests / this.results.totalTests) * 100).toFixed(1)
      }
    };
    
    // 保存详细报告
    const reportPath = `automated-verification-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // 控制台输出
    console.log(chalk.blue('\n' + '='.repeat(60)));
    console.log(chalk.blue('📊 自动化验证报告'));
    console.log(chalk.blue('='.repeat(60)));
    
    console.log(chalk.blue('\n📈 总体统计:'));
    console.log(chalk.gray(`验证时间: ${report.timestamp}`));
    console.log(chalk.gray(`总组件数: ${report.summary.totalComponents}`));
    console.log(chalk.green(`通过组件: ${report.summary.passedComponents}`));
    console.log(chalk.yellow(`部分通过: ${report.summary.partialComponents}`));
    console.log(chalk.red(`失败组件: ${report.summary.failedComponents}`));
    console.log(chalk.blue(`成功率: ${report.summary.successRate}%`));
    
    console.log(chalk.blue('\n📋 组件详情:'));
    for (const component of this.results.components) {
      const status = component.overall === 'passed' ? '✅' : 
                    component.overall === 'partial' ? '⚠️' : '❌';
      console.log(`${status} ${component.moduleName} → ${component.componentName}`);
      
      for (const [testName, testResult] of Object.entries(component.tests)) {
        const testStatus = testResult.success ? '✅' : '❌';
        console.log(`  ${testStatus} ${testName}`);
        if (!testResult.success && testResult.error) {
          console.log(chalk.red(`    错误: ${testResult.error}`));
        }
      }
    }
    
    console.log(chalk.blue(`\n📄 详细报告已保存到: ${reportPath}`));
    
    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      this.parseArgs();
      await this.init();
      
      const loginSuccess = await this.login();
      if (!loginSuccess) {
        throw new Error('登录失败，无法继续验证');
      }
      
      if (this.stage === 1) {
        await this.runStage1();
      } else if (this.stage === 2) {
        await this.runStage2();
      } else {
        await this.runAllStages();
      }
      
      const report = this.generateReport();
      
      console.log(chalk.green('\n🎉 自动化验证完成！'));
      
      return report;
      
    } catch (error) {
      console.error(chalk.red(`❌ 验证失败: ${error.message}`));
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// 主函数
async function main() {
  const verifier = new AutomatedButtonVerifier();
  try {
    await verifier.run();
  } catch (error) {
    console.error(chalk.red('自动化验证失败:'), error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = AutomatedButtonVerifier;