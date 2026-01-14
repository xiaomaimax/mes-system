/**
 * 修复剩余的 message 调用
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue('🔧 修复剩余的 message 调用'));
console.log(chalk.blue('=' .repeat(50)));

// 需要修复的文件
const filesToFix = [
  'client/src/utils/buttonActions.js'
];

function fixFile(filePath) {
  console.log(chalk.blue(`\n修复文件: ${filePath}`));
  
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(chalk.red(`  ✗ 文件不存在`));
    return false;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // 替换所有在安全包装器外部的 message 调用
  const replacements = [
    // 替换 message.loading 调用（不在安全包装器内部）
    {
      from: /const loading = message\.loading\(/g,
      to: 'const loading = safeMessage.loading(',
      description: 'message.loading 调用'
    },
    {
      from: /message\.warning\('请输入搜索关键词！'\)/g,
      to: 'safeMessage.warning(\'请输入搜索关键词！\')',
      description: 'message.warning 调用'
    }
  ];
  
  replacements.forEach(replacement => {
    const matches = content.match(replacement.from);
    if (matches && matches.length > 0) {
      content = content.replace(replacement.from, replacement.to);
      console.log(chalk.green(`    ✓ 替换了 ${matches.length} 处 ${replacement.description}`));
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(fullPath, content);
    console.log(chalk.green(`  ✓ 文件修复完成`));
    return true;
  } else {
    console.log(chalk.gray(`  - 无需修复`));
    return false;
  }
}

// 修复所有文件
let totalFixed = 0;
filesToFix.forEach(filePath => {
  if (fixFile(filePath)) {
    totalFixed++;
  }
});

console.log(chalk.blue('\n' + '='.repeat(50)));
console.log(chalk.green(`✅ 修复完成！总共修复了 ${totalFixed} 个文件`));
console.log(chalk.blue('=' .repeat(50)));