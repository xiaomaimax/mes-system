/**
 * Message API 修复完成验证脚本
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue('🔧 Message API 修复完成验证'));
console.log(chalk.blue('=' .repeat(50)));

// 检查修复日志
const logFile = path.join(__dirname, '..', 'dev_log', 'MESSAGE_API_COMPATIBILITY_FIX.json');
let fixLog = null;

if (fs.existsSync(logFile)) {
  fixLog = JSON.parse(fs.readFileSync(logFile, 'utf8'));
  console.log(chalk.green(`✅ 修复日志存在: ${fixLog.totalFilesFixed} 个文件已修复`));
} else {
  console.log(chalk.yellow('⚠ 修复日志不存在'));
}

// 随机检查几个重要文件
const keyFilesToCheck = [
  'client/src/hooks/useUIFeedback.js',
  'client/src/utils/buttonActions.js',
  'client/src/components/personnel/EmployeeManagement.js',
  'client/src/components/common/StorageStatsDisplay.js'
];

let allGood = true;

console.log(chalk.yellow('\n📋 检查关键文件...'));

keyFilesToCheck.forEach(filePath => {
  console.log(chalk.blue(`\n检查: ${filePath}`));
  
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(chalk.red(`  ✗ 文件不存在`));
    allGood = false;
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // 检查是否有安全包装器
  const hasSafeWrapper = content.includes('const safeMessage = {');
  if (hasSafeWrapper) {
    console.log(chalk.green(`  ✓ 包含安全包装器`));
  } else {
    console.log(chalk.red(`  ✗ 缺少安全包装器`));
    allGood = false;
  }
  
  // 检查是否还有不安全的调用
  const unsafeCalls = content.match(/(?<!safe)message\.(success|error|warning|loading)\(/g);
  if (unsafeCalls && unsafeCalls.length > 0) {
    console.log(chalk.red(`  ✗ 仍有 ${unsafeCalls.length} 处不安全调用:`));
    unsafeCalls.forEach(call => {
      console.log(chalk.red(`    - ${call}`));
    });
    allGood = false;
  } else {
    console.log(chalk.green(`  ✓ 所有 message 调用都是安全的`));
  }
  
  // 检查是否有 safeMessage 调用
  const safeCalls = content.match(/safeMessage\.(success|error|warning|loading)\(/g);
  if (safeCalls && safeCalls.length > 0) {
    console.log(chalk.green(`  ✓ 包含 ${safeCalls.length} 处安全调用`));
  }
});

console.log(chalk.blue('\n' + '='.repeat(50)));

if (allGood) {
  console.log(chalk.green('🎉 所有检查都通过！'));
  console.log(chalk.green('Message API 兼容性修复已完成'));
  
  console.log(chalk.blue('\n📊 修复统计:'));
  if (fixLog) {
    console.log(chalk.gray(`  修复时间: ${new Date(fixLog.timestamp).toLocaleString()}`));
    console.log(chalk.gray(`  修复文件数: ${fixLog.totalFilesFixed}`));
    console.log(chalk.gray(`  添加安全包装器: ${fixLog.summary.addedSafeWrapper ? '是' : '否'}`));
    console.log(chalk.gray(`  替换不安全调用: ${fixLog.summary.replacedMessageCalls ? '是' : '否'}`));
    console.log(chalk.gray(`  提供降级方案: ${fixLog.summary.providedFallback ? '是' : '否'}`));
  }
  
  console.log(chalk.blue('\n🚀 现在可以测试:'));
  console.log(chalk.gray('1. 重启前端服务: npm run client'));
  console.log(chalk.gray('2. 访问 http://localhost:3000/personnel'));
  console.log(chalk.gray('3. 确认页面正常加载，无错误'));
  console.log(chalk.gray('4. 测试员工管理功能'));
  
} else {
  console.log(chalk.red('❌ 部分检查未通过'));
  console.log(chalk.red('请检查上述问题并重新修复'));
}

console.log(chalk.blue('\n' + '='.repeat(50)));