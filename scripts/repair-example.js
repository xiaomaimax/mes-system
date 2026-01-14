/**
 * 数据修复工具使用示例
 * 
 * 演示如何使用数据修复工具进行数据一致性修复
 */

const chalk = require('chalk');
const DataConsistencyChecker = require('./verify-data-consistency');
const DataConsistencyRepairer = require('./repair-data-consistency');
const RepairSuggestionGenerator = require('./generate-repair-suggestions');
const RepairLogger = require('./repair-logger');

async function demonstrateRepairWorkflow() {
  console.log(chalk.blue('='.repeat(60)));
  console.log(chalk.blue('数据修复工具使用示例'));
  console.log(chalk.blue('='.repeat(60)));

  try {
    // 步骤1: 运行数据一致性检查
    console.log(chalk.yellow('\n步骤1: 运行数据一致性检查'));
    console.log(chalk.gray('这将检查数据库和API之间的数据一致性...'));
    
    const checker = new DataConsistencyChecker();
    const report = await checker.runAllChecks();
    
    if (report.summary.failedChecks === 0) {
      console.log(chalk.green('✓ 没有发现数据一致性问题'));
      return;
    }

    // 步骤2: 生成修复建议
    console.log(chalk.yellow('\n步骤2: 生成修复建议'));
    console.log(chalk.gray('基于检查结果生成具体的修复建议...'));
    
    const suggestionGenerator = new RepairSuggestionGenerator();
    const suggestions = suggestionGenerator.generateSuggestions(report);
    suggestionGenerator.displaySummary();
    const suggestionsDir = suggestionGenerator.saveSuggestions();

    // 步骤3: 执行数据修复（预览模式）
    console.log(chalk.yellow('\n步骤3: 预览修复操作'));
    console.log(chalk.gray('在预览模式下查看将要执行的修复操作...'));
    
    const repairer = new DataConsistencyRepairer();
    await repairer.runRepair({
      strategy: 'preview',
      backup: false,
      preview: true
    });

    // 步骤4: 实际执行修复（手动模式）
    console.log(chalk.yellow('\n步骤4: 执行实际修复'));
    console.log(chalk.gray('在手动模式下执行修复操作...'));
    console.log(chalk.red('注意: 这是演示，实际使用时请谨慎操作'));
    
    // 在实际使用中，这里会执行真正的修复
    // await repairer.runRepair({
    //   strategy: 'manual',
    //   backup: true,
    //   preview: false
    // });

    console.log(chalk.blue('\n修复工作流程演示完成'));
    console.log(chalk.gray(`修复建议已保存到: ${suggestionsDir}`));

  } catch (error) {
    console.error(chalk.red('演示过程中出错:'), error.message);
  }
}

async function demonstrateRepairLogger() {
  console.log(chalk.blue('\n='.repeat(60)));
  console.log(chalk.blue('修复日志记录器演示'));
  console.log(chalk.blue('='.repeat(60)));

  const logger = new RepairLogger();

  // 模拟修复操作
  const operationId1 = logger.logOperationStart({
    module: 'production',
    checkName: '生产计划数据',
    action: 'sync_field_values',
    description: '同步生产计划状态字段'
  });

  // 模拟SQL执行
  logger.logSqlExecution(operationId1, 
    'UPDATE production_plans SET status = "active" WHERE status IS NULL', 
    { success: true, affectedRows: 5 }
  );

  // 模拟操作完成
  logger.logOperationComplete(operationId1, {
    success: true,
    result: '成功同步5条记录的状态字段',
    duration: 150,
    affectedRecords: 5
  });

  // 模拟另一个操作
  const operationId2 = logger.logOperationStart({
    module: 'inventory',
    checkName: '库存数据',
    action: 'fix_api_query',
    description: '修复库存API查询逻辑'
  });

  // 模拟操作失败
  logger.logOperationComplete(operationId2, {
    success: false,
    error: 'API端点不存在',
    duration: 50
  });

  // 记录警告
  logger.logWarning('发现API配置问题', { endpoint: '/api/inventory', status: 404 });

  // 记录备份操作
  logger.logBackupOperation(
    '/path/to/backup.sql',
    ['production_plans', 'inventory'],
    true
  );

  // 显示实时摘要
  logger.displayLiveSummary();

  // 完成会话
  logger.completeSession();

  console.log(chalk.green('\n日志记录器演示完成'));
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--logger-demo')) {
    await demonstrateRepairLogger();
  } else {
    await demonstrateRepairWorkflow();
  }
}

// 显示使用说明
function showUsage() {
  console.log(chalk.blue('数据修复工具使用说明'));
  console.log(chalk.blue('='.repeat(40)));
  console.log('');
  console.log(chalk.yellow('1. 数据一致性检查:'));
  console.log('   node scripts/verify-data-consistency.js');
  console.log('');
  console.log(chalk.yellow('2. 生成修复建议:'));
  console.log('   node scripts/generate-repair-suggestions.js --report=logs/report.json');
  console.log('');
  console.log(chalk.yellow('3. 执行数据修复:'));
  console.log('   # 预览模式');
  console.log('   node scripts/repair-data-consistency.js --strategy=preview');
  console.log('   # 手动模式');
  console.log('   node scripts/repair-data-consistency.js --strategy=manual --backup');
  console.log('   # 自动模式');
  console.log('   node scripts/repair-data-consistency.js --strategy=auto --backup');
  console.log('');
  console.log(chalk.yellow('4. 运行演示:'));
  console.log('   node scripts/repair-example.js');
  console.log('   node scripts/repair-example.js --logger-demo');
  console.log('');
  console.log(chalk.gray('注意: 在生产环境中使用前，请先在测试环境中验证修复操作'));
}

// 运行
if (require.main === module) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showUsage();
  } else {
    main().catch(error => {
      console.error(chalk.red('演示失败:'), error);
      process.exit(1);
    });
  }
}

module.exports = {
  demonstrateRepairWorkflow,
  demonstrateRepairLogger,
  showUsage
};