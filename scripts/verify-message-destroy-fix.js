/**
 * message.destroy 错误修复验证脚本
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue('🔧 message.destroy 错误修复验证'));
console.log(chalk.blue('=' .repeat(50)));

// 检查是否有不安全的message.destroy调用
function checkUnsafeMessageDestroy(filePath, content) {
  const lines = content.split('\n');
  const unsafeLines = [];
  
  lines.forEach((line, index) => {
    // 检查是否有直接调用message.destroy()但不在安全检查中的情况
    if (line.includes('message.destroy()')) {
      // 检查前几行是否有安全检查
      const contextStart = Math.max(0, index - 3);
      const contextLines = lines.slice(contextStart, index + 1);
      const hasTypeCheck = contextLines.some(l => 
        l.includes('typeof message.destroy === \'function\'')
      );
      
      if (!hasTypeCheck) {
        unsafeLines.push({
          line: index + 1,
          content: line.trim()
        });
      }
    }
  });
  
  return unsafeLines;
}

const filesToCheck = [
  'client/src/hooks/useUIFeedback.js',
  'client/src/components/common/StorageStatsDisplay.js'
];

let allSafe = true;

filesToCheck.forEach(filePath => {
  console.log(chalk.blue(`\n检查文件: ${filePath}`));
  
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(chalk.red(`  ✗ 文件不存在`));
    allSafe = false;
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const unsafeLines = checkUnsafeMessageDestroy(filePath, content);
  
  if (unsafeLines.length > 0) {
    console.log(chalk.red(`  ✗ 发现 ${unsafeLines.length} 处不安全的message.destroy调用:`));
    unsafeLines.forEach(item => {
      console.log(chalk.red(`    第${item.line}行: ${item.content}`));
    });
    allSafe = false;
  } else {
    console.log(chalk.green(`  ✓ 所有message.destroy调用都是安全的`));
  }
  
  // 检查是否有安全检查模式
  const hasSafePattern = content.includes('typeof message.destroy === \'function\'');
  if (hasSafePattern) {
    console.log(chalk.green(`  ✓ 包含安全检查模式`));
  } else {
    console.log(chalk.yellow(`  ⚠ 未找到安全检查模式`));
  }
});

console.log(chalk.blue('\n' + '='.repeat(50)));

if (allSafe) {
  console.log(chalk.green('✅ 修复验证通过！'));
  console.log(chalk.green('所有message.destroy调用都已安全处理'));
  
  console.log(chalk.blue('\n🎯 现在可以测试员工管理页面:'));
  console.log(chalk.gray('1. 重启前端服务: npm run client'));
  console.log(chalk.gray('2. 访问 人员管理 → 员工管理'));
  console.log(chalk.gray('3. 测试新增、编辑、删除功能'));
  console.log(chalk.gray('4. 确认不再出现message.destroy错误'));
  
} else {
  console.log(chalk.red('❌ 仍有不安全的message.destroy调用'));
  console.log(chalk.red('请修复上述问题后重新验证'));
}

console.log(chalk.blue('\n' + '='.repeat(50)));