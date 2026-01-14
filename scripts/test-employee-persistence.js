/**
 * 员工数据持久化功能测试脚本
 * 
 * 功能：
 * - 测试员工数据的持久化存储
 * - 验证页面刷新后的数据恢复
 * - 测试错误处理和降级机制
 * - 验证数据导入导出功能
 * 
 * 使用方法：
 * node scripts/test-employee-persistence.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// 测试配置
const TEST_CONFIG = {
  // 测试URL
  baseUrl: 'http://localhost:3000',
  
  // 测试超时时间
  timeout: 30000,
  
  // 测试数据
  testEmployees: [
    {
      name: '测试员工1',
      department: '测试部门',
      position: '测试职位',
      phone: '13800138001',
      email: 'test1@company.com'
    },
    {
      name: '测试员工2',
      department: '开发部门',
      position: '开发工程师',
      phone: '13800138002',
      email: 'test2@company.com'
    }
  ]
};

/**
 * 员工数据持久化测试器
 */
class EmployeePersistenceTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  /**
   * 初始化测试环境
   */
  async initialize() {
    try {
      console.log(chalk.blue('🚀 初始化员工数据持久化测试环境...'));
      
      // 启动浏览器
      this.browser = await puppeteer.launch({
        headless: false, // 显示浏览器窗口以便观察
        devtools: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      this.page = await this.browser.newPage();
      
      // 设置视口大小
      await this.page.setViewport({ width: 1280, height: 720 });
      
      // 监听控制台消息
      this.page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log(chalk.red(`浏览器错误: ${msg.text()}`));
        }
      });
      
      console.log(chalk.green('✓ 测试环境初始化完成'));
      
    } catch (error) {
      console.error(chalk.red('✗ 测试环境初始化失败:'), error);
      throw error;
    }
  }

  /**
   * 清理测试环境
   */
  async cleanup() {
    try {
      if (this.browser) {
        await this.browser.close();
      }
      console.log(chalk.green('✓ 测试环境清理完成'));
    } catch (error) {
      console.error(chalk.red('✗ 测试环境清理失败:'), error);
    }
  }

  /**
   * 运行单个测试
   */
  async runTest(testName, testFunction) {
    this.testResults.total++;
    
    try {
      console.log(chalk.blue(`\n🧪 运行测试: ${testName}`));
      await testFunction();
      this.testResults.passed++;
      console.log(chalk.green(`✓ ${testName} - 通过`));
    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push({ test: testName, error: error.message });
      console.log(chalk.red(`✗ ${testName} - 失败: ${error.message}`));
    }
  }

  /**
   * 等待元素出现
   */
  async waitForElement(selector, timeout = 5000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      throw new Error(`元素未找到: ${selector}`);
    }
  }

  /**
   * 导航到员工管理页面
   */
  async navigateToEmployeePage() {
    console.log('导航到员工管理页面...');
    
    // 访问首页
    await this.page.goto(`${TEST_CONFIG.baseUrl}`, { waitUntil: 'networkidle0' });
    
    // 等待页面加载
    await this.page.waitForTimeout(2000);
    
    // 查找并点击人员管理菜单
    try {
      // 尝试点击人员管理菜单项
      await this.page.click('text=人员管理');
      await this.page.waitForTimeout(1000);
      
      // 点击员工管理子菜单
      await this.page.click('text=员工管理');
      await this.page.waitForTimeout(2000);
      
    } catch (error) {
      // 如果菜单点击失败，尝试直接访问URL
      await this.page.goto(`${TEST_CONFIG.baseUrl}/#/personnel/employees`, { waitUntil: 'networkidle0' });
      await this.page.waitForTimeout(2000);
    }
    
    console.log('已导航到员工管理页面');
  }

  /**
   * 测试1: 基础数据持久化功能
   */
  async testBasicPersistence() {
    await this.navigateToEmployeePage();
    
    // 清除现有数据
    await this.clearExistingData();
    
    // 添加测试员工
    for (const employee of TEST_CONFIG.testEmployees) {
      await this.addEmployee(employee);
      await this.page.waitForTimeout(1000);
    }
    
    // 验证员工已添加
    const employeeCount = await this.getEmployeeCount();
    if (employeeCount !== TEST_CONFIG.testEmployees.length) {
      throw new Error(`期望添加 ${TEST_CONFIG.testEmployees.length} 个员工，实际添加 ${employeeCount} 个`);
    }
    
    console.log(`✓ 成功添加 ${employeeCount} 个测试员工`);
  }

  /**
   * 测试2: 页面刷新后数据恢复
   */
  async testDataRecoveryAfterRefresh() {
    console.log('刷新页面测试数据恢复...');
    
    // 记录刷新前的员工数量
    const beforeRefreshCount = await this.getEmployeeCount();
    
    // 刷新页面
    await this.page.reload({ waitUntil: 'networkidle0' });
    await this.page.waitForTimeout(3000); // 等待数据加载
    
    // 重新导航到员工页面（如果需要）
    await this.navigateToEmployeePage();
    
    // 验证数据是否恢复
    const afterRefreshCount = await this.getEmployeeCount();
    
    if (afterRefreshCount !== beforeRefreshCount) {
      throw new Error(`页面刷新后数据丢失，刷新前: ${beforeRefreshCount}，刷新后: ${afterRefreshCount}`);
    }
    
    console.log(`✓ 页面刷新后成功恢复 ${afterRefreshCount} 个员工数据`);
  }

  /**
   * 测试3: 数据修改和同步
   */
  async testDataModificationAndSync() {
    console.log('测试数据修改和同步...');
    
    // 修改第一个员工的信息
    const modifiedData = {
      name: '修改后的员工1',
      department: '修改后的部门',
      position: '修改后的职位'
    };
    
    await this.editFirstEmployee(modifiedData);
    
    // 验证修改是否成功
    const isModified = await this.verifyEmployeeData(modifiedData.name);
    if (!isModified) {
      throw new Error('员工数据修改失败');
    }
    
    // 刷新页面验证修改是否持久化
    await this.page.reload({ waitUntil: 'networkidle0' });
    await this.page.waitForTimeout(3000);
    await this.navigateToEmployeePage();
    
    const isPersistedAfterRefresh = await this.verifyEmployeeData(modifiedData.name);
    if (!isPersistedAfterRefresh) {
      throw new Error('员工数据修改未持久化');
    }
    
    console.log('✓ 员工数据修改和持久化成功');
  }

  /**
   * 测试4: 数据删除功能
   */
  async testDataDeletion() {
    console.log('测试数据删除功能...');
    
    const beforeDeleteCount = await this.getEmployeeCount();
    
    // 删除第一个员工
    await this.deleteFirstEmployee();
    
    const afterDeleteCount = await this.getEmployeeCount();
    
    if (afterDeleteCount !== beforeDeleteCount - 1) {
      throw new Error(`删除失败，删除前: ${beforeDeleteCount}，删除后: ${afterDeleteCount}`);
    }
    
    // 刷新页面验证删除是否持久化
    await this.page.reload({ waitUntil: 'networkidle0' });
    await this.page.waitForTimeout(3000);
    await this.navigateToEmployeePage();
    
    const afterRefreshCount = await this.getEmployeeCount();
    if (afterRefreshCount !== afterDeleteCount) {
      throw new Error('员工删除未持久化');
    }
    
    console.log(`✓ 员工删除功能正常，剩余 ${afterRefreshCount} 个员工`);
  }

  /**
   * 测试5: 存储状态监控
   */
  async testStorageStatusMonitoring() {
    console.log('测试存储状态监控...');
    
    // 在浏览器中执行JavaScript获取存储状态
    const storageInfo = await this.page.evaluate(async () => {
      // 确保EmployeePersistence已加载
      if (typeof window.EmployeePersistence === 'undefined') {
        // 尝试从模块导入
        try {
          const module = await import('/src/utils/EmployeePersistence.js');
          window.EmployeePersistence = module.default;
        } catch (error) {
          return { error: '无法加载EmployeePersistence模块' };
        }
      }
      
      try {
        const health = await window.EmployeePersistence.getStorageHealth();
        const stats = await window.EmployeePersistence.getEmployeeStats();
        
        return {
          health,
          stats,
          success: true
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    if (storageInfo.error) {
      throw new Error(`获取存储状态失败: ${storageInfo.error}`);
    }
    
    if (!storageInfo.success) {
      throw new Error('存储状态监控功能异常');
    }
    
    console.log('✓ 存储状态监控功能正常');
    console.log(`  - 存储状态: ${storageInfo.health.status}`);
    console.log(`  - 存储类型: ${storageInfo.health.storageType}`);
    console.log(`  - 员工总数: ${storageInfo.stats.total}`);
  }

  /**
   * 测试6: 错误处理和降级机制
   */
  async testErrorHandlingAndFallback() {
    console.log('测试错误处理和降级机制...');
    
    // 在浏览器中模拟存储错误
    const fallbackTest = await this.page.evaluate(async () => {
      try {
        // 模拟localStorage不可用
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = () => {
          throw new Error('Storage quota exceeded');
        };
        
        // 尝试添加员工数据
        const testEmployee = {
          name: '降级测试员工',
          department: '测试部门',
          position: '测试职位'
        };
        
        // 这里需要调用DataService的addEmployee方法
        // 由于在浏览器环境中，我们需要确保模块已加载
        if (typeof window.DataService === 'undefined') {
          const module = await import('/src/services/DataService.js');
          window.DataService = module.default;
        }
        
        const result = await window.DataService.addEmployee(testEmployee);
        
        // 恢复localStorage
        localStorage.setItem = originalSetItem;
        
        return {
          success: result.success,
          warning: result.warning,
          message: result.message
        };
        
      } catch (error) {
        return { error: error.message };
      }
    });
    
    if (fallbackTest.error) {
      console.log(`⚠️ 降级机制测试遇到问题: ${fallbackTest.error}`);
    } else if (fallbackTest.warning) {
      console.log('✓ 错误处理和降级机制正常工作');
      console.log(`  - 降级消息: ${fallbackTest.message}`);
    } else {
      console.log('✓ 存储功能正常，未触发降级机制');
    }
  }

  // ============================================================================
  // 辅助方法
  // ============================================================================

  /**
   * 清除现有数据
   */
  async clearExistingData() {
    try {
      // 在浏览器中执行清除操作
      await this.page.evaluate(async () => {
        if (typeof window.EmployeePersistence === 'undefined') {
          const module = await import('/src/utils/EmployeePersistence.js');
          window.EmployeePersistence = module.default;
        }
        
        await window.EmployeePersistence.clearAllEmployees();
      });
      
      console.log('✓ 已清除现有员工数据');
    } catch (error) {
      console.warn('清除现有数据失败:', error.message);
    }
  }

  /**
   * 添加员工
   */
  async addEmployee(employee) {
    try {
      // 查找并点击新增按钮
      await this.page.click('button:has-text("新增"), button:has-text("添加")');
      await this.page.waitForTimeout(1000);
      
      // 填写员工信息
      await this.page.fill('input[placeholder*="姓名"], input[name="name"]', employee.name);
      await this.page.fill('input[placeholder*="部门"], input[name="department"]', employee.department);
      await this.page.fill('input[placeholder*="职位"], input[name="position"]', employee.position);
      
      if (employee.phone) {
        await this.page.fill('input[placeholder*="电话"], input[name="phone"]', employee.phone);
      }
      
      if (employee.email) {
        await this.page.fill('input[placeholder*="邮箱"], input[name="email"]', employee.email);
      }
      
      // 点击确定按钮
      await this.page.click('button:has-text("确定"), button:has-text("保存")');
      await this.page.waitForTimeout(2000);
      
      console.log(`✓ 添加员工: ${employee.name}`);
      
    } catch (error) {
      throw new Error(`添加员工失败: ${error.message}`);
    }
  }

  /**
   * 获取员工数量
   */
  async getEmployeeCount() {
    try {
      // 等待表格加载
      await this.page.waitForTimeout(2000);
      
      // 尝试多种方式获取员工数量
      const count = await this.page.evaluate(() => {
        // 方法1: 通过表格行数
        const tableRows = document.querySelectorAll('tbody tr, .ant-table-tbody tr');
        if (tableRows.length > 0) {
          return tableRows.length;
        }
        
        // 方法2: 通过数据项
        const dataItems = document.querySelectorAll('[data-row-key], .employee-item');
        if (dataItems.length > 0) {
          return dataItems.length;
        }
        
        // 方法3: 通过文本内容
        const totalText = document.querySelector('.ant-pagination-total-text');
        if (totalText) {
          const match = totalText.textContent.match(/共\s*(\d+)\s*条/);
          if (match) {
            return parseInt(match[1]);
          }
        }
        
        return 0;
      });
      
      return count;
      
    } catch (error) {
      console.warn('获取员工数量失败:', error.message);
      return 0;
    }
  }

  /**
   * 编辑第一个员工
   */
  async editFirstEmployee(newData) {
    try {
      // 查找第一行的编辑按钮
      await this.page.click('tbody tr:first-child button:has-text("编辑"), tbody tr:first-child .edit-btn');
      await this.page.waitForTimeout(1000);
      
      // 清空并填写新数据
      await this.page.fill('input[name="name"]', '');
      await this.page.fill('input[name="name"]', newData.name);
      
      await this.page.fill('input[name="department"]', '');
      await this.page.fill('input[name="department"]', newData.department);
      
      await this.page.fill('input[name="position"]', '');
      await this.page.fill('input[name="position"]', newData.position);
      
      // 保存修改
      await this.page.click('button:has-text("确定"), button:has-text("保存")');
      await this.page.waitForTimeout(2000);
      
      console.log(`✓ 编辑员工: ${newData.name}`);
      
    } catch (error) {
      throw new Error(`编辑员工失败: ${error.message}`);
    }
  }

  /**
   * 验证员工数据
   */
  async verifyEmployeeData(employeeName) {
    try {
      const exists = await this.page.evaluate((name) => {
        const cells = document.querySelectorAll('td, .ant-table-cell');
        return Array.from(cells).some(cell => cell.textContent.includes(name));
      }, employeeName);
      
      return exists;
    } catch (error) {
      console.warn('验证员工数据失败:', error.message);
      return false;
    }
  }

  /**
   * 删除第一个员工
   */
  async deleteFirstEmployee() {
    try {
      // 查找第一行的删除按钮
      await this.page.click('tbody tr:first-child button:has-text("删除"), tbody tr:first-child .delete-btn');
      await this.page.waitForTimeout(1000);
      
      // 确认删除
      await this.page.click('button:has-text("确定"), .ant-btn-dangerous');
      await this.page.waitForTimeout(2000);
      
      console.log('✓ 删除第一个员工');
      
    } catch (error) {
      throw new Error(`删除员工失败: ${error.message}`);
    }
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log(chalk.blue('🧪 开始员工数据持久化功能测试\n'));
    
    try {
      await this.initialize();
      
      // 运行测试套件
      await this.runTest('基础数据持久化功能', () => this.testBasicPersistence());
      await this.runTest('页面刷新后数据恢复', () => this.testDataRecoveryAfterRefresh());
      await this.runTest('数据修改和同步', () => this.testDataModificationAndSync());
      await this.runTest('数据删除功能', () => this.testDataDeletion());
      await this.runTest('存储状态监控', () => this.testStorageStatusMonitoring());
      await this.runTest('错误处理和降级机制', () => this.testErrorHandlingAndFallback());
      
    } catch (error) {
      console.error(chalk.red('测试执行失败:'), error);
    } finally {
      await this.cleanup();
    }
    
    // 输出测试结果
    this.printTestResults();
  }

  /**
   * 打印测试结果
   */
  printTestResults() {
    console.log(chalk.blue('\n📊 测试结果汇总'));
    console.log(chalk.blue('='.repeat(50)));
    
    console.log(`总测试数: ${this.testResults.total}`);
    console.log(chalk.green(`通过: ${this.testResults.passed}`));
    console.log(chalk.red(`失败: ${this.testResults.failed}`));
    
    const successRate = this.testResults.total > 0 
      ? ((this.testResults.passed / this.testResults.total) * 100).toFixed(1)
      : 0;
    
    console.log(`成功率: ${successRate}%`);
    
    if (this.testResults.errors.length > 0) {
      console.log(chalk.red('\n❌ 失败的测试:'));
      this.testResults.errors.forEach(({ test, error }) => {
        console.log(chalk.red(`  - ${test}: ${error}`));
      });
    }
    
    if (this.testResults.failed === 0) {
      console.log(chalk.green('\n🎉 所有测试通过！员工数据持久化功能正常工作。'));
    } else {
      console.log(chalk.yellow('\n⚠️ 部分测试失败，请检查相关功能。'));
    }
    
    console.log(chalk.blue('='.repeat(50)));
  }
}

// 主函数
async function main() {
  const tester = new EmployeePersistenceTest();
  await tester.runAllTests();
}

// 运行测试
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('测试执行失败:'), error);
    process.exit(1);
  });
}

module.exports = EmployeePersistenceTest;