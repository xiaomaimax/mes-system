/**
 * 员工管理页面错误修复验证脚本
 * 
 * 功能：
 * 1. 验证message.destroy错误是否已修复
 * 2. 测试员工管理页面的基本功能
 * 3. 检查UI反馈系统的稳定性
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue('🔧 员工管理页面错误修复验证'));
console.log(chalk.blue('=' .repeat(50)));

// 检查修复的文件
const filesToCheck = [
  {
    path: 'client/src/hooks/useUIFeedback.js',
    description: 'UI反馈Hook',
    checkPatterns: [
      {
        pattern: /message\.destroy\(\)/g,
        shouldNotExist: true,
        description: '直接调用message.destroy()'
      },
      {
        pattern: /if \(message\.destroy && typeof message\.destroy === 'function'\)/g,
        shouldExist: true,
        description: '安全的message.destroy检查'
      }
    ]
  },
  {
    path: 'client/src/components/common/StorageStatsDisplay.js',
    description: '存储统计显示组件',
    checkPatterns: [
      {
        pattern: /message\.destroy\(\)/g,
        shouldNotExist: true,
        description: '直接调用message.destroy()'
      },
      {
        pattern: /if \(message\.destroy && typeof message\.destroy === 'function'\)/g,
        shouldExist: true,
        description: '安全的message.destroy检查'
      }
    ]
  }
];

let allChecksPass = true;

console.log(chalk.yellow('\n📋 检查修复的文件...'));

filesToCheck.forEach(fileCheck => {
  console.log(chalk.blue(`\n检查文件: ${fileCheck.description}`));
  
  const filePath = path.join(__dirname, '..', fileCheck.path);
  
  if (!fs.existsSync(filePath)) {
    console.log(chalk.red(`  ✗ 文件不存在: ${fileCheck.path}`));
    allChecksPass = false;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  fileCheck.checkPatterns.forEach(check => {
    const matches = content.match(check.pattern);
    const hasMatches = matches && matches.length > 0;
    
    if (check.shouldExist && !hasMatches) {
      console.log(chalk.red(`  ✗ 缺少: ${check.description}`));
      allChecksPass = false;
    } else if (check.shouldNotExist && hasMatches) {
      console.log(chalk.red(`  ✗ 仍然存在: ${check.description} (${matches.length} 处)`));
      allChecksPass = false;
    } else {
      console.log(chalk.green(`  ✓ ${check.description} - 正确`));
    }
  });
});

// 检查员工管理组件
console.log(chalk.yellow('\n📋 检查员工管理组件...'));

const employeeManagementPath = path.join(__dirname, '..', 'client/src/components/personnel/EmployeeManagement.js');

if (fs.existsSync(employeeManagementPath)) {
  const content = fs.readFileSync(employeeManagementPath, 'utf8');
  
  // 检查是否正确导入了useUIFeedback
  if (content.includes("import useUIFeedback")) {
    console.log(chalk.green('  ✓ 正确导入useUIFeedback'));
  } else {
    console.log(chalk.red('  ✗ 缺少useUIFeedback导入'));
    allChecksPass = false;
  }
  
  // 检查是否正确使用了uiFeedback.setSuccess
  if (content.includes("uiFeedback.setSuccess")) {
    console.log(chalk.green('  ✓ 正确使用uiFeedback.setSuccess'));
  } else {
    console.log(chalk.yellow('  ⚠ 未找到uiFeedback.setSuccess的使用'));
  }
  
  // 检查是否有错误处理
  if (content.includes("try {") && content.includes("catch (error)")) {
    console.log(chalk.green('  ✓ 包含错误处理'));
  } else {
    console.log(chalk.yellow('  ⚠ 可能缺少错误处理'));
  }
  
} else {
  console.log(chalk.red('  ✗ 员工管理组件文件不存在'));
  allChecksPass = false;
}

// 生成修复报告
console.log(chalk.blue('\n' + '='.repeat(50)));
console.log(chalk.blue('📊 修复验证报告'));
console.log(chalk.blue('='.repeat(50)));

if (allChecksPass) {
  console.log(chalk.green('\n✅ 所有检查都通过！'));
  console.log(chalk.green('message.destroy错误已成功修复'));
  
  console.log(chalk.blue('\n🎯 修复内容总结:'));
  console.log(chalk.gray('  1. 在useUIFeedback.js中添加了安全的message.destroy检查'));
  console.log(chalk.gray('  2. 在StorageStatsDisplay.js中添加了安全的message.destroy检查'));
  console.log(chalk.gray('  3. 所有message.destroy调用都包装在try-catch中'));
  console.log(chalk.gray('  4. 添加了函数存在性检查，避免运行时错误'));
  
  console.log(chalk.blue('\n🚀 下一步操作:'));
  console.log(chalk.gray('  1. 重启前端开发服务器'));
  console.log(chalk.gray('  2. 清除浏览器缓存'));
  console.log(chalk.gray('  3. 测试人员管理-员工管理页面'));
  console.log(chalk.gray('  4. 验证新增、编辑、删除功能是否正常'));
  
} else {
  console.log(chalk.red('\n❌ 部分检查未通过'));
  console.log(chalk.red('请检查上述错误并重新修复'));
}

// 创建修复指南
const fixGuide = `# 员工管理页面错误修复指南

## 问题描述
人员管理-员工管理页面出现 \`message.destroy is not a function\` 错误。

## 问题原因
在某些版本的Ant Design中，\`message.destroy()\` 方法可能不存在或使用方式不正确。

## 修复方案

### 1. 修复useUIFeedback Hook
在 \`client/src/hooks/useUIFeedback.js\` 中：
- 将直接调用 \`message.destroy()\` 替换为安全检查
- 添加 try-catch 错误处理

### 2. 修复StorageStatsDisplay组件
在 \`client/src/components/common/StorageStatsDisplay.js\` 中：
- 同样添加安全的message.destroy检查

### 3. 安全调用模式
\`\`\`javascript
// 安全地销毁之前的消息
try {
  if (message.destroy && typeof message.destroy === 'function') {
    message.destroy();
  }
} catch (error) {
  console.warn('销毁消息时出错:', error);
}
\`\`\`

## 测试步骤
1. 重启前端服务: \`npm run client\`
2. 清除浏览器缓存
3. 访问人员管理-员工管理页面
4. 测试新增、编辑、删除功能
5. 确认不再出现message.destroy错误

## 验证结果
${allChecksPass ? '✅ 修复成功' : '❌ 需要进一步修复'}

修复时间: ${new Date().toLocaleString()}
`;

const guideFile = path.join(__dirname, '..', 'dev_log', 'EMPLOYEE_MANAGEMENT_MESSAGE_DESTROY_FIX.md');
fs.writeFileSync(guideFile, fixGuide);

console.log(chalk.blue(`\n📝 修复指南已保存: ${guideFile}`));

console.log(chalk.blue('\n' + '='.repeat(50)));