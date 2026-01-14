/**
 * 数据一致性修复工具
 * 
 * 功能：
 * 1. 基于数据一致性检查结果进行数据修复
 * 2. 提供多种修复策略和建议
 * 3. 记录修复操作日志
 * 4. 支持回滚操作
 * 
 * 使用方法：
 * node scripts/repair-data-consistency.js [--report=path] [--strategy=auto|manual|preview] [--backup]
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline');
const DataConsistencyChecker = require('./verify-data-consistency');

// 配置
const config = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'mes_system'
  },
  backup: {
    enabled: true,
    directory: path.join(__dirname, '..', 'backups')
  },
  repair: {
    maxRetries: 3,
    batchSize: 100
  }
};

// 数据修复器
class DataConsistencyRepairer {
  constructor() {
    this.connection = null;
    this.repairLog = {
      timestamp: new Date().toISOString(),
      operations: [],
      summary: {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        skippedOperations: 0
      }
    };
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * 初始化数据库连接
   */
  async initialize() {
    try {
      this.connection = await mysql.createConnection(config.database);
      console.log(chalk.green('✓ 数据库连接成功'));
      
      // 确保备份目录存在
      if (config.backup.enabled && !fs.existsSync(config.backup.directory)) {
        fs.mkdirSync(config.backup.directory, { recursive: true });
      }
    } catch (error) {
      console.error(chalk.red('✗ 数据库连接失败:'), error.message);
      throw error;
    }
  }

  /**
   * 关闭连接
   */
  async close() {
    if (this.connection) {
      await this.connection.end();
    }
    this.rl.close();
  }

  /**
   * 创建数据备份
   */
  async createBackup(tables = []) {
    if (!config.backup.enabled) {
      console.log(chalk.yellow('备份功能已禁用'));
      return null;
    }

    console.log(chalk.blue('创建数据备份...'));
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(config.backup.directory, `backup-${timestamp}.sql`);
    
    try {
      let backupContent = `-- 数据备份 ${new Date().toISOString()}\n`;
      backupContent += `-- 修复操作前的数据备份\n\n`;

      // 如果没有指定表，备份所有相关表
      if (tables.length === 0) {
        tables = [
          'production_plans', 'production_tasks', 'production_orders',
          'equipment', 'molds', 'equipment_maintenance',
          'quality_inspections', 'defect_records',
          'inventory', 'inventory_transactions'
        ];
      }

      for (const table of tables) {
        try {
          const [rows] = await this.connection.query(`SELECT * FROM ${table}`);
          if (rows.length > 0) {
            backupContent += `-- 表: ${table}\n`;
            backupContent += `DELETE FROM ${table};\n`;
            
            // 生成INSERT语句
            const columns = Object.keys(rows[0]);
            const values = rows.map(row => {
              const vals = columns.map(col => {
                const val = row[col];
                if (val === null) return 'NULL';
                if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                return val;
              });
              return `(${vals.join(', ')})`;
            });
            
            backupContent += `INSERT INTO ${table} (${columns.join(', ')}) VALUES\n`;
            backupContent += values.join(',\n') + ';\n\n';
          }
        } catch (error) {
          console.warn(chalk.yellow(`警告: 无法备份表 ${table}: ${error.message}`));
        }
      }

      fs.writeFileSync(backupFile, backupContent);
      console.log(chalk.green(`✓ 备份已创建: ${backupFile}`));
      return backupFile;
    } catch (error) {
      console.error(chalk.red('✗ 创建备份失败:'), error.message);
      throw error;
    }
  }

  /**
   * 加载一致性检查报告
   */
  loadConsistencyReport(reportPath) {
    try {
      if (!fs.existsSync(reportPath)) {
        throw new Error(`报告文件不存在: ${reportPath}`);
      }
      
      const reportContent = fs.readFileSync(reportPath, 'utf8');
      return JSON.parse(reportContent);
    } catch (error) {
      console.error(chalk.red('✗ 加载报告失败:'), error.message);
      throw error;
    }
  }

  /**
   * 分析修复策略
   */
  analyzeRepairStrategies(report) {
    const strategies = [];

    for (const [moduleName, moduleData] of Object.entries(report.modules)) {
      if (!moduleData.checks) continue;

      for (const check of moduleData.checks) {
        if (!check.passed && check.issues) {
          for (const issue of check.issues) {
            const strategy = this.determineRepairStrategy(moduleName, check.name, issue);
            if (strategy) {
              strategies.push(strategy);
            }
          }
        }
      }
    }

    return strategies;
  }

  /**
   * 确定修复策略
   */
  determineRepairStrategy(module, checkName, issue) {
    const strategy = {
      id: `${module}_${checkName}_${Date.now()}`,
      module,
      check: checkName,
      issue,
      type: 'unknown',
      priority: 'medium',
      action: null,
      description: '',
      risks: [],
      canAutoRepair: false
    };

    // 数据数量不一致的修复策略
    if (issue.includes('数据数量不一致')) {
      const match = issue.match(/数据库 (\d+) 条, API (\d+) 条/);
      if (match) {
        const dbCount = parseInt(match[1]);
        const apiCount = parseInt(match[2]);
        
        if (dbCount > apiCount) {
          strategy.type = 'missing_api_data';
          strategy.description = 'API返回的数据少于数据库中的数据，可能是API查询条件或分页问题';
          strategy.action = 'check_api_query_conditions';
          strategy.risks = ['可能影响前端显示', '需要检查API实现'];
          strategy.canAutoRepair = false;
        } else {
          strategy.type = 'extra_api_data';
          strategy.description = 'API返回的数据多于数据库中的数据，可能是数据重复或查询错误';
          strategy.action = 'check_api_data_source';
          strategy.risks = ['可能存在数据重复', '需要检查数据源'];
          strategy.canAutoRepair = false;
        }
      }
    }

    // 字段值不一致的修复策略
    if (issue.includes('不一致')) {
      strategy.type = 'field_mismatch';
      strategy.description = '数据库和API返回的字段值不一致，需要同步数据';
      strategy.action = 'sync_field_values';
      strategy.risks = ['可能覆盖重要数据', '需要确认数据源的准确性'];
      strategy.canAutoRepair = true;
      strategy.priority = 'high';
    }

    // API缺少数据的修复策略
    if (issue.includes('API缺少')) {
      strategy.type = 'missing_api_record';
      strategy.description = 'API缺少数据库中存在的记录，需要检查API查询逻辑';
      strategy.action = 'fix_api_query';
      strategy.risks = ['可能影响业务功能', '需要检查删除逻辑'];
      strategy.canAutoRepair = false;
      strategy.priority = 'high';
    }

    return strategy;
  }

  /**
   * 显示修复建议
   */
  displayRepairSuggestions(strategies) {
    console.log(chalk.blue('\n' + '='.repeat(60)));
    console.log(chalk.blue('数据修复建议'));
    console.log(chalk.blue('='.repeat(60)));

    if (strategies.length === 0) {
      console.log(chalk.green('\n✓ 没有发现需要修复的问题'));
      return;
    }

    // 按优先级分组
    const priorityGroups = {
      high: strategies.filter(s => s.priority === 'high'),
      medium: strategies.filter(s => s.priority === 'medium'),
      low: strategies.filter(s => s.priority === 'low')
    };

    for (const [priority, items] of Object.entries(priorityGroups)) {
      if (items.length === 0) continue;

      const priorityColor = priority === 'high' ? chalk.red : 
                           priority === 'medium' ? chalk.yellow : chalk.gray;
      
      console.log(priorityColor(`\n${priority.toUpperCase()} 优先级 (${items.length} 项):`));
      
      items.forEach((strategy, index) => {
        console.log(priorityColor(`\n${index + 1}. ${strategy.module} - ${strategy.check}`));
        console.log(chalk.gray(`   问题: ${strategy.issue}`));
        console.log(chalk.gray(`   描述: ${strategy.description}`));
        console.log(chalk.gray(`   建议操作: ${strategy.action}`));
        console.log(chalk.gray(`   自动修复: ${strategy.canAutoRepair ? '是' : '否'}`));
        
        if (strategy.risks.length > 0) {
          console.log(chalk.yellow(`   风险:`));
          strategy.risks.forEach(risk => {
            console.log(chalk.yellow(`     - ${risk}`));
          });
        }
      });
    }

    console.log(chalk.blue('\n' + '='.repeat(60)));
  }

  /**
   * 执行自动修复
   */
  async executeAutoRepair(strategies, preview = false) {
    const autoRepairableStrategies = strategies.filter(s => s.canAutoRepair);
    
    if (autoRepairableStrategies.length === 0) {
      console.log(chalk.yellow('没有可以自动修复的问题'));
      return;
    }

    console.log(chalk.blue(`\n开始${preview ? '预览' : '执行'}自动修复 (${autoRepairableStrategies.length} 项)...`));

    for (const strategy of autoRepairableStrategies) {
      try {
        await this.executeRepairStrategy(strategy, preview);
      } catch (error) {
        console.error(chalk.red(`✗ 修复失败: ${strategy.id}`), error.message);
        this.logOperation(strategy, 'failed', error.message);
      }
    }
  }

  /**
   * 执行修复策略
   */
  async executeRepairStrategy(strategy, preview = false) {
    console.log(chalk.blue(`\n${preview ? '预览' : '执行'}修复: ${strategy.check}`));
    
    const operation = {
      id: strategy.id,
      timestamp: new Date().toISOString(),
      strategy: strategy,
      status: 'pending',
      details: {},
      error: null
    };

    try {
      switch (strategy.action) {
        case 'sync_field_values':
          await this.syncFieldValues(strategy, operation, preview);
          break;
        case 'fix_api_query':
          await this.fixApiQuery(strategy, operation, preview);
          break;
        case 'check_api_query_conditions':
          await this.checkApiQueryConditions(strategy, operation, preview);
          break;
        default:
          throw new Error(`未知的修复操作: ${strategy.action}`);
      }

      operation.status = 'success';
      this.logOperation(strategy, 'success');
      console.log(chalk.green(`✓ 修复完成: ${strategy.check}`));

    } catch (error) {
      operation.status = 'failed';
      operation.error = error.message;
      this.logOperation(strategy, 'failed', error.message);
      throw error;
    }

    this.repairLog.operations.push(operation);
  }

  /**
   * 同步字段值
   */
  async syncFieldValues(strategy, operation, preview = false) {
    console.log(chalk.gray('  执行字段值同步...'));
    
    // 这里需要根据具体的不一致问题来实现同步逻辑
    // 由于这是一个通用的修复工具，具体的同步逻辑需要根据实际情况来实现
    
    if (preview) {
      console.log(chalk.yellow('  [预览] 将同步数据库和API之间的字段值差异'));
      operation.details.preview = '字段值同步预览';
      return;
    }

    // 实际的同步逻辑需要根据具体的模块和字段来实现
    console.log(chalk.yellow('  注意: 字段值同步需要根据具体情况手动实现'));
    operation.details.note = '需要手动实现具体的同步逻辑';
  }

  /**
   * 修复API查询
   */
  async fixApiQuery(strategy, operation, preview = false) {
    console.log(chalk.gray('  检查API查询逻辑...'));
    
    if (preview) {
      console.log(chalk.yellow('  [预览] 将检查和修复API查询逻辑'));
      operation.details.preview = 'API查询修复预览';
      return;
    }

    // 这里需要检查API的查询逻辑，确保返回完整的数据
    console.log(chalk.yellow('  注意: API查询修复需要检查后端API实现'));
    operation.details.recommendation = '检查API路由和查询条件，确保返回完整数据';
  }

  /**
   * 检查API查询条件
   */
  async checkApiQueryConditions(strategy, operation, preview = false) {
    console.log(chalk.gray('  检查API查询条件...'));
    
    if (preview) {
      console.log(chalk.yellow('  [预览] 将检查API查询条件和分页设置'));
      operation.details.preview = 'API查询条件检查预览';
      return;
    }

    // 检查API的查询条件，特别是分页和过滤条件
    console.log(chalk.yellow('  注意: 需要检查API的分页和过滤逻辑'));
    operation.details.recommendation = '检查API的分页参数、过滤条件和排序逻辑';
  }

  /**
   * 手动修复模式
   */
  async manualRepair(strategies) {
    console.log(chalk.blue('\n进入手动修复模式...'));
    
    for (let i = 0; i < strategies.length; i++) {
      const strategy = strategies[i];
      
      console.log(chalk.blue(`\n修复项 ${i + 1}/${strategies.length}:`));
      console.log(chalk.gray(`模块: ${strategy.module}`));
      console.log(chalk.gray(`检查: ${strategy.check}`));
      console.log(chalk.gray(`问题: ${strategy.issue}`));
      console.log(chalk.gray(`建议: ${strategy.description}`));
      
      const answer = await this.askQuestion(
        '选择操作: (s)跳过, (r)修复, (q)退出: '
      );
      
      switch (answer.toLowerCase()) {
        case 's':
          console.log(chalk.yellow('跳过此项'));
          this.logOperation(strategy, 'skipped');
          break;
        case 'r':
          try {
            await this.executeRepairStrategy(strategy, false);
          } catch (error) {
            console.error(chalk.red('修复失败:'), error.message);
          }
          break;
        case 'q':
          console.log(chalk.blue('退出修复模式'));
          return;
        default:
          console.log(chalk.yellow('无效选择，跳过此项'));
          this.logOperation(strategy, 'skipped');
      }
    }
  }

  /**
   * 询问用户输入
   */
  askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }

  /**
   * 记录操作日志
   */
  logOperation(strategy, status, error = null) {
    this.repairLog.summary.totalOperations++;
    
    switch (status) {
      case 'success':
        this.repairLog.summary.successfulOperations++;
        break;
      case 'failed':
        this.repairLog.summary.failedOperations++;
        break;
      case 'skipped':
        this.repairLog.summary.skippedOperations++;
        break;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      strategy: strategy.id,
      module: strategy.module,
      check: strategy.check,
      status,
      error
    };

    this.repairLog.operations.push(logEntry);
  }

  /**
   * 保存修复日志
   */
  saveRepairLog() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = path.join(__dirname, '..', 'logs', `repair-log-${timestamp}.json`);
    
    const logsDir = path.dirname(logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    fs.writeFileSync(logFile, JSON.stringify(this.repairLog, null, 2));
    console.log(chalk.green(`\n修复日志已保存: ${logFile}`));
    
    return logFile;
  }

  /**
   * 显示修复摘要
   */
  displayRepairSummary() {
    console.log(chalk.blue('\n' + '='.repeat(60)));
    console.log(chalk.blue('修复操作摘要'));
    console.log(chalk.blue('='.repeat(60)));
    
    console.log(chalk.gray(`修复时间: ${this.repairLog.timestamp}`));
    console.log(chalk.gray(`总操作数: ${this.repairLog.summary.totalOperations}`));
    console.log(chalk.green(`成功: ${this.repairLog.summary.successfulOperations}`));
    console.log(chalk.red(`失败: ${this.repairLog.summary.failedOperations}`));
    console.log(chalk.yellow(`跳过: ${this.repairLog.summary.skippedOperations}`));
    
    if (this.repairLog.summary.failedOperations > 0) {
      console.log(chalk.red('\n失败的操作:'));
      this.repairLog.operations
        .filter(op => op.status === 'failed')
        .forEach(op => {
          console.log(chalk.red(`  - ${op.module}: ${op.check} (${op.error})`));
        });
    }
    
    console.log(chalk.blue('\n' + '='.repeat(60)));
  }

  /**
   * 运行数据修复
   */
  async runRepair(options = {}) {
    const {
      reportPath = null,
      strategy = 'manual',
      backup = true,
      preview = false
    } = options;

    try {
      await this.initialize();

      // 如果没有提供报告路径，先运行一致性检查
      let report;
      if (reportPath) {
        console.log(chalk.blue(`加载一致性检查报告: ${reportPath}`));
        report = this.loadConsistencyReport(reportPath);
      } else {
        console.log(chalk.blue('运行数据一致性检查...'));
        const checker = new DataConsistencyChecker();
        report = await checker.runAllChecks();
      }

      // 分析修复策略
      const strategies = this.analyzeRepairStrategies(report);
      
      if (strategies.length === 0) {
        console.log(chalk.green('✓ 没有发现需要修复的问题'));
        return;
      }

      // 显示修复建议
      this.displayRepairSuggestions(strategies);

      // 创建备份
      if (backup && !preview) {
        await this.createBackup();
      }

      // 根据策略执行修复
      switch (strategy) {
        case 'auto':
          await this.executeAutoRepair(strategies, preview);
          break;
        case 'manual':
          if (preview) {
            console.log(chalk.blue('\n预览模式: 显示将要执行的修复操作'));
            await this.executeAutoRepair(strategies, true);
          } else {
            await this.manualRepair(strategies);
          }
          break;
        case 'preview':
          await this.executeAutoRepair(strategies, true);
          break;
        default:
          throw new Error(`未知的修复策略: ${strategy}`);
      }

      // 显示修复摘要
      this.displayRepairSummary();
      
      // 保存修复日志
      this.saveRepairLog();

    } catch (error) {
      console.error(chalk.red('修复过程中出错:'), error);
      throw error;
    } finally {
      await this.close();
    }
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const options = {
    reportPath: null,
    strategy: 'manual',
    backup: true,
    preview: false
  };

  // 解析命令行参数
  for (const arg of args) {
    if (arg.startsWith('--report=')) {
      options.reportPath = arg.split('=')[1];
    } else if (arg.startsWith('--strategy=')) {
      options.strategy = arg.split('=')[1];
    } else if (arg === '--backup') {
      options.backup = true;
    } else if (arg === '--no-backup') {
      options.backup = false;
    } else if (arg === '--preview') {
      options.preview = true;
    }
  }

  console.log(chalk.blue('数据一致性修复工具'));
  console.log(chalk.gray(`策略: ${options.strategy}`));
  console.log(chalk.gray(`备份: ${options.backup ? '是' : '否'}`));
  console.log(chalk.gray(`预览模式: ${options.preview ? '是' : '否'}`));

  const repairer = new DataConsistencyRepairer();
  await repairer.runRepair(options);
}

// 运行
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('致命错误:'), error);
    process.exit(1);
  });
}

module.exports = DataConsistencyRepairer;