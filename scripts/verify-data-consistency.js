/**
 * 数据一致性检查工具
 * 
 * 功能：
 * 1. 比较数据库数据和前端显示数据
 * 2. 检查数据完整性和准确性
 * 3. 生成一致性检查报告
 * 
 * 使用方法：
 * node scripts/verify-data-consistency.js [--module=production|equipment|quality|inventory|all] [--detailed]
 */

const axios = require('axios');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// 配置
const config = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'mes_system'
  },
  api: {
    baseURL: process.env.API_URL || 'http://localhost:5002',
    timeout: 10000
  }
};

// 数据一致性检查器
class DataConsistencyChecker {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      modules: {},
      summary: {
        totalChecks: 0,
        passedChecks: 0,
        failedChecks: 0,
        inconsistencies: []
      }
    };
    this.connection = null;
  }

  /**
   * 初始化数据库连接
   */
  async initialize() {
    try {
      this.connection = await mysql.createConnection(config.database);
      console.log(chalk.green('✓ 数据库连接成功'));
    } catch (error) {
      console.error(chalk.red('✗ 数据库连接失败:'), error.message);
      throw error;
    }
  }

  /**
   * 关闭数据库连接
   */
  async close() {
    if (this.connection) {
      await this.connection.end();
    }
  }

  /**
   * 检查生产模块数据一致性
   */
  async checkProductionModule() {
    console.log(chalk.blue('\n检查生产模块数据一致性...'));
    
    const moduleResults = {
      name: '生产模块',
      checks: []
    };

    try {
      // 检查生产计划数据
      await this.checkProductionPlans(moduleResults);
      
      // 检查生产任务数据
      await this.checkProductionTasks(moduleResults);
      
      // 检查生产订单数据
      await this.checkProductionOrders(moduleResults);

    } catch (error) {
      console.error(chalk.red('生产模块检查失败:'), error.message);
      moduleResults.error = error.message;
    }

    this.results.modules.production = moduleResults;
    return moduleResults;
  }

  /**
   * 检查生产计划数据
   */
  async checkProductionPlans(moduleResults) {
    const checkName = '生产计划数据';
    console.log(chalk.gray(`  检查 ${checkName}...`));

    try {
      // 从数据库获取数据
      const [dbPlans] = await this.connection.query(
        'SELECT id, plan_number, status, planned_quantity FROM production_plans LIMIT 100'
      );

      // 从API获取数据
      const apiResponse = await axios.get(`${config.api.baseURL}/api/scheduling/plans`, {
        params: { page: 1, limit: 100 },
        timeout: config.api.timeout
      });

      const apiPlans = apiResponse.data.data || [];

      // 比较数据
      const check = {
        name: checkName,
        dbCount: dbPlans.length,
        apiCount: apiPlans.length,
        passed: true,
        issues: []
      };

      // 检查数据数量
      if (dbPlans.length !== apiPlans.length) {
        check.passed = false;
        check.issues.push(`数据数量不一致: 数据库 ${dbPlans.length} 条, API ${apiPlans.length} 条`);
      }

      // 检查数据字段完整性
      for (const dbPlan of dbPlans.slice(0, 10)) {
        const apiPlan = apiPlans.find(p => p.id === dbPlan.id);
        if (!apiPlan) {
          check.passed = false;
          check.issues.push(`API缺少ID为 ${dbPlan.id} 的生产计划`);
          continue;
        }

        // 检查关键字段
        if (dbPlan.plan_number !== apiPlan.plan_number) {
          check.passed = false;
          check.issues.push(`生产计划 ${dbPlan.id} 的 plan_number 不一致`);
        }
        if (dbPlan.status !== apiPlan.status) {
          check.passed = false;
          check.issues.push(`生产计划 ${dbPlan.id} 的 status 不一致`);
        }
      }

      moduleResults.checks.push(check);
      this.recordCheckResult(check);

    } catch (error) {
      const check = {
        name: checkName,
        passed: false,
        error: error.message
      };
      moduleResults.checks.push(check);
      this.recordCheckResult(check);
    }
  }

  /**
   * 检查生产任务数据
   */
  async checkProductionTasks(moduleResults) {
    const checkName = '生产任务数据';
    console.log(chalk.gray(`  检查 ${checkName}...`));

    try {
      // 从数据库获取数据
      const [dbTasks] = await this.connection.query(
        'SELECT id, task_number, status, task_quantity FROM production_tasks LIMIT 100'
      );

      // 从API获取数据
      const apiResponse = await axios.get(`${config.api.baseURL}/api/scheduling/tasks`, {
        params: { page: 1, limit: 100 },
        timeout: config.api.timeout
      });

      const apiTasks = apiResponse.data.data || [];

      const check = {
        name: checkName,
        dbCount: dbTasks.length,
        apiCount: apiTasks.length,
        passed: true,
        issues: []
      };

      if (dbTasks.length !== apiTasks.length) {
        check.passed = false;
        check.issues.push(`数据数量不一致: 数据库 ${dbTasks.length} 条, API ${apiTasks.length} 条`);
      }

      moduleResults.checks.push(check);
      this.recordCheckResult(check);

    } catch (error) {
      const check = {
        name: checkName,
        passed: false,
        error: error.message
      };
      moduleResults.checks.push(check);
      this.recordCheckResult(check);
    }
  }

  /**
   * 检查生产订单数据
   */
  async checkProductionOrders(moduleResults) {
    const checkName = '生产订单数据';
    console.log(chalk.gray(`  检查 ${checkName}...`));

    try {
      // 从数据库获取数据
      const [dbOrders] = await this.connection.query(
        'SELECT id, order_number, status, planned_quantity, produced_quantity FROM production_orders LIMIT 100'
      );

      // 从API获取数据
      const apiResponse = await axios.get(`${config.api.baseURL}/api/production/orders`, {
        params: { page: 1, limit: 100 },
        timeout: config.api.timeout
      });

      const apiOrders = apiResponse.data.data?.orders || [];

      const check = {
        name: checkName,
        dbCount: dbOrders.length,
        apiCount: apiOrders.length,
        passed: true,
        issues: []
      };

      if (dbOrders.length !== apiOrders.length) {
        check.passed = false;
        check.issues.push(`数据数量不一致: 数据库 ${dbOrders.length} 条, API ${apiOrders.length} 条`);
      }

      moduleResults.checks.push(check);
      this.recordCheckResult(check);

    } catch (error) {
      const check = {
        name: checkName,
        passed: false,
        error: error.message
      };
      moduleResults.checks.push(check);
      this.recordCheckResult(check);
    }
  }

  /**
   * 检查设备模块数据一致性
   */
  async checkEquipmentModule() {
    console.log(chalk.blue('\n检查设备模块数据一致性...'));
    
    const moduleResults = {
      name: '设备模块',
      checks: []
    };

    try {
      // 检查设备数据
      await this.checkEquipmentData(moduleResults);
      
      // 检查模具数据
      await this.checkMoldData(moduleResults);
      
      // 检查设备维护数据
      await this.checkEquipmentMaintenance(moduleResults);

    } catch (error) {
      console.error(chalk.red('设备模块检查失败:'), error.message);
      moduleResults.error = error.message;
    }

    this.results.modules.equipment = moduleResults;
    return moduleResults;
  }

  /**
   * 检查设备数据
   */
  async checkEquipmentData(moduleResults) {
    const checkName = '设备数据';
    console.log(chalk.gray(`  检查 ${checkName}...`));

    try {
      const [dbEquipment] = await this.connection.query(
        'SELECT id, equipment_code, equipment_name, status FROM equipment LIMIT 100'
      );

      const apiResponse = await axios.get(`${config.api.baseURL}/api/equipment`, {
        params: { page: 1, limit: 100 },
        timeout: config.api.timeout
      });

      const apiEquipment = apiResponse.data.data?.equipment || [];

      const check = {
        name: checkName,
        dbCount: dbEquipment.length,
        apiCount: apiEquipment.length,
        passed: dbEquipment.length === apiEquipment.length,
        issues: []
      };

      if (!check.passed) {
        check.issues.push(`数据数量不一致: 数据库 ${dbEquipment.length} 条, API ${apiEquipment.length} 条`);
      }

      moduleResults.checks.push(check);
      this.recordCheckResult(check);

    } catch (error) {
      const check = {
        name: checkName,
        passed: false,
        error: error.message
      };
      moduleResults.checks.push(check);
      this.recordCheckResult(check);
    }
  }

  /**
   * 检查模具数据
   */
  async checkMoldData(moduleResults) {
    const checkName = '模具数据';
    console.log(chalk.gray(`  检查 ${checkName}...`));

    try {
      const [dbMolds] = await this.connection.query(
        'SELECT id, mold_code, mold_name, status FROM molds LIMIT 100'
      );

      const apiResponse = await axios.get(`${config.api.baseURL}/api/equipment/molds`, {
        params: { page: 1, limit: 100 },
        timeout: config.api.timeout
      });

      const apiMolds = apiResponse.data.data?.molds || [];

      const check = {
        name: checkName,
        dbCount: dbMolds.length,
        apiCount: apiMolds.length,
        passed: dbMolds.length === apiMolds.length,
        issues: []
      };

      if (!check.passed) {
        check.issues.push(`数据数量不一致: 数据库 ${dbMolds.length} 条, API ${apiMolds.length} 条`);
      }

      moduleResults.checks.push(check);
      this.recordCheckResult(check);

    } catch (error) {
      const check = {
        name: checkName,
        passed: false,
        error: error.message
      };
      moduleResults.checks.push(check);
      this.recordCheckResult(check);
    }
  }

  /**
   * 检查设备维护数据
   */
  async checkEquipmentMaintenance(moduleResults) {
    const checkName = '设备维护数据';
    console.log(chalk.gray(`  检查 ${checkName}...`));

    try {
      const [dbMaintenance] = await this.connection.query(
        'SELECT id, device_id, maintenance_type, status FROM equipment_maintenance LIMIT 100'
      );

      const apiResponse = await axios.get(`${config.api.baseURL}/api/equipment/maintenance`, {
        params: { page: 1, limit: 100 },
        timeout: config.api.timeout
      });

      const apiMaintenance = apiResponse.data.data?.maintenance || [];

      const check = {
        name: checkName,
        dbCount: dbMaintenance.length,
        apiCount: apiMaintenance.length,
        passed: dbMaintenance.length === apiMaintenance.length,
        issues: []
      };

      if (!check.passed) {
        check.issues.push(`数据数量不一致: 数据库 ${dbMaintenance.length} 条, API ${apiMaintenance.length} 条`);
      }

      moduleResults.checks.push(check);
      this.recordCheckResult(check);

    } catch (error) {
      const check = {
        name: checkName,
        passed: false,
        error: error.message
      };
      moduleResults.checks.push(check);
      this.recordCheckResult(check);
    }
  }

  /**
   * 检查质量模块数据一致性
   */
  async checkQualityModule() {
    console.log(chalk.blue('\n检查质量模块数据一致性...'));
    
    const moduleResults = {
      name: '质量模块',
      checks: []
    };

    try {
      // 检查质量检验数据
      await this.checkQualityInspections(moduleResults);
      
      // 检查缺陷记录数据
      await this.checkDefectRecords(moduleResults);

    } catch (error) {
      console.error(chalk.red('质量模块检查失败:'), error.message);
      moduleResults.error = error.message;
    }

    this.results.modules.quality = moduleResults;
    return moduleResults;
  }

  /**
   * 检查质量检验数据
   */
  async checkQualityInspections(moduleResults) {
    const checkName = '质量检验数据';
    console.log(chalk.gray(`  检查 ${checkName}...`));

    try {
      const [dbInspections] = await this.connection.query(
        'SELECT id, inspection_type, inspected_quantity, qualified_quantity FROM quality_inspections LIMIT 100'
      );

      const apiResponse = await axios.get(`${config.api.baseURL}/api/quality/inspections`, {
        params: { page: 1, limit: 100 },
        timeout: config.api.timeout
      });

      const apiInspections = apiResponse.data.data?.inspections || [];

      const check = {
        name: checkName,
        dbCount: dbInspections.length,
        apiCount: apiInspections.length,
        passed: dbInspections.length === apiInspections.length,
        issues: []
      };

      if (!check.passed) {
        check.issues.push(`数据数量不一致: 数据库 ${dbInspections.length} 条, API ${apiInspections.length} 条`);
      }

      moduleResults.checks.push(check);
      this.recordCheckResult(check);

    } catch (error) {
      const check = {
        name: checkName,
        passed: false,
        error: error.message
      };
      moduleResults.checks.push(check);
      this.recordCheckResult(check);
    }
  }

  /**
   * 检查缺陷记录数据
   */
  async checkDefectRecords(moduleResults) {
    const checkName = '缺陷记录数据';
    console.log(chalk.gray(`  检查 ${checkName}...`));

    try {
      const [dbDefects] = await this.connection.query(
        'SELECT id, defect_code, defect_name, severity FROM defect_records LIMIT 100'
      );

      const apiResponse = await axios.get(`${config.api.baseURL}/api/quality/defects`, {
        params: { page: 1, limit: 100 },
        timeout: config.api.timeout
      });

      const apiDefects = apiResponse.data.data?.defects || [];

      const check = {
        name: checkName,
        dbCount: dbDefects.length,
        apiCount: apiDefects.length,
        passed: dbDefects.length === apiDefects.length,
        issues: []
      };

      if (!check.passed) {
        check.issues.push(`数据数量不一致: 数据库 ${dbDefects.length} 条, API ${apiDefects.length} 条`);
      }

      moduleResults.checks.push(check);
      this.recordCheckResult(check);

    } catch (error) {
      const check = {
        name: checkName,
        passed: false,
        error: error.message
      };
      moduleResults.checks.push(check);
      this.recordCheckResult(check);
    }
  }

  /**
   * 检查库存模块数据一致性
   */
  async checkInventoryModule() {
    console.log(chalk.blue('\n检查库存模块数据一致性...'));
    
    const moduleResults = {
      name: '库存模块',
      checks: []
    };

    try {
      // 检查库存数据
      await this.checkInventoryData(moduleResults);
      
      // 检查出入库记录数据
      await this.checkInventoryTransactions(moduleResults);

    } catch (error) {
      console.error(chalk.red('库存模块检查失败:'), error.message);
      moduleResults.error = error.message;
    }

    this.results.modules.inventory = moduleResults;
    return moduleResults;
  }

  /**
   * 检查库存数据
   */
  async checkInventoryData(moduleResults) {
    const checkName = '库存数据';
    console.log(chalk.gray(`  检查 ${checkName}...`));

    try {
      const [dbInventory] = await this.connection.query(
        'SELECT id, material_id, current_stock, warehouse_location FROM inventory LIMIT 100'
      );

      const apiResponse = await axios.get(`${config.api.baseURL}/api/inventory`, {
        params: { page: 1, limit: 100 },
        timeout: config.api.timeout
      });

      const apiInventory = apiResponse.data.data?.inventory || [];

      const check = {
        name: checkName,
        dbCount: dbInventory.length,
        apiCount: apiInventory.length,
        passed: dbInventory.length === apiInventory.length,
        issues: []
      };

      if (!check.passed) {
        check.issues.push(`数据数量不一致: 数据库 ${dbInventory.length} 条, API ${apiInventory.length} 条`);
      }

      moduleResults.checks.push(check);
      this.recordCheckResult(check);

    } catch (error) {
      const check = {
        name: checkName,
        passed: false,
        error: error.message
      };
      moduleResults.checks.push(check);
      this.recordCheckResult(check);
    }
  }

  /**
   * 检查出入库记录数据
   */
  async checkInventoryTransactions(moduleResults) {
    const checkName = '出入库记录数据';
    console.log(chalk.gray(`  检查 ${checkName}...`));

    try {
      const [dbTransactions] = await this.connection.query(
        'SELECT id, transaction_type, quantity FROM inventory_transactions LIMIT 100'
      );

      const apiResponse = await axios.get(`${config.api.baseURL}/api/inventory/transactions`, {
        params: { page: 1, limit: 100 },
        timeout: config.api.timeout
      });

      const apiTransactions = apiResponse.data.data?.transactions || [];

      const check = {
        name: checkName,
        dbCount: dbTransactions.length,
        apiCount: apiTransactions.length,
        passed: dbTransactions.length === apiTransactions.length,
        issues: []
      };

      if (!check.passed) {
        check.issues.push(`数据数量不一致: 数据库 ${dbTransactions.length} 条, API ${apiTransactions.length} 条`);
      }

      moduleResults.checks.push(check);
      this.recordCheckResult(check);

    } catch (error) {
      const check = {
        name: checkName,
        passed: false,
        error: error.message
      };
      moduleResults.checks.push(check);
      this.recordCheckResult(check);
    }
  }

  /**
   * 记录检查结果
   */
  recordCheckResult(check) {
    this.results.summary.totalChecks++;
    if (check.passed) {
      this.results.summary.passedChecks++;
      console.log(chalk.green(`    ✓ ${check.name} 通过`));
    } else {
      this.results.summary.failedChecks++;
      console.log(chalk.red(`    ✗ ${check.name} 失败`));
      if (check.issues && check.issues.length > 0) {
        check.issues.forEach(issue => {
          console.log(chalk.yellow(`      - ${issue}`));
          this.results.summary.inconsistencies.push({
            check: check.name,
            issue
          });
        });
      }
      if (check.error) {
        console.log(chalk.yellow(`      - 错误: ${check.error}`));
        this.results.summary.inconsistencies.push({
          check: check.name,
          error: check.error
        });
      }
    }
  }

  /**
   * 生成报告
   */
  generateReport() {
    console.log(chalk.blue('\n' + '='.repeat(60)));
    console.log(chalk.blue('数据一致性检查报告'));
    console.log(chalk.blue('='.repeat(60)));
    
    console.log(chalk.gray(`\n检查时间: ${this.results.timestamp}`));
    console.log(chalk.gray(`总检查数: ${this.results.summary.totalChecks}`));
    console.log(chalk.green(`通过: ${this.results.summary.passedChecks}`));
    console.log(chalk.red(`失败: ${this.results.summary.failedChecks}`));
    
    if (this.results.summary.inconsistencies.length > 0) {
      console.log(chalk.yellow(`\n发现 ${this.results.summary.inconsistencies.length} 个不一致问题:`));
      this.results.summary.inconsistencies.forEach((item, index) => {
        console.log(chalk.yellow(`\n${index + 1}. ${item.check}`));
        if (item.issue) {
          console.log(chalk.yellow(`   问题: ${item.issue}`));
        }
        if (item.error) {
          console.log(chalk.yellow(`   错误: ${item.error}`));
        }
      });
    } else {
      console.log(chalk.green('\n✓ 所有检查都通过了！'));
    }
    
    console.log(chalk.blue('\n' + '='.repeat(60)));
  }

  /**
   * 保存报告到文件
   */
  saveReport(filename = 'data-consistency-report.json') {
    const reportPath = path.join(__dirname, '..', 'logs', filename);
    const logsDir = path.dirname(reportPath);
    
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(chalk.green(`\n报告已保存到: ${reportPath}`));
  }

  /**
   * 执行所有检查
   */
  async runAllChecks(modules = ['production', 'equipment', 'quality', 'inventory']) {
    try {
      await this.initialize();

      if (modules.includes('production') || modules.includes('all')) {
        await this.checkProductionModule();
      }

      if (modules.includes('equipment') || modules.includes('all')) {
        await this.checkEquipmentModule();
      }

      if (modules.includes('quality') || modules.includes('all')) {
        await this.checkQualityModule();
      }

      if (modules.includes('inventory') || modules.includes('all')) {
        await this.checkInventoryModule();
      }

      this.generateReport();
      this.saveReport();

      return this.results;

    } catch (error) {
      console.error(chalk.red('检查过程中出错:'), error);
      throw error;
    } finally {
      await this.close();
    }
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  let module = 'all';
  let detailed = false;

  // 解析命令行参数
  for (const arg of args) {
    if (arg.startsWith('--module=')) {
      module = arg.split('=')[1];
    }
    if (arg === '--detailed') {
      detailed = true;
    }
  }

  const modules = module === 'all' ? ['production', 'equipment', 'quality', 'inventory'] : [module];

  const checker = new DataConsistencyChecker();
  await checker.runAllChecks(modules);
}

// 运行
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('致命错误:'), error);
    process.exit(1);
  });
}

module.exports = DataConsistencyChecker;
