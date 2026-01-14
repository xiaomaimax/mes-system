/**
 * Ant Design Message API 兼容性修复脚本
 * 
 * 功能：
 * 1. 修复所有组件中的 message API 调用
 * 2. 添加安全包装器确保兼容性
 * 3. 提供降级处理方案
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue('🔧 Ant Design Message API 兼容性修复'));
console.log(chalk.blue('=' .repeat(50)));

// 安全的 message API 包装器代码
const safeMessageWrapper = `
// 确保message API可用的安全包装器
const safeMessage = {
  success: (content, duration) => {
    try {
      if (message && typeof message.success === 'function') {
        return message.success(content, duration);
      } else {
        console.log('✅', content);
      }
    } catch (error) {
      console.warn('调用message.success时出错:', error);
      console.log('✅', content);
    }
  },
  error: (content, duration) => {
    try {
      if (message && typeof message.error === 'function') {
        return message.error(content, duration);
      } else {
        console.error('❌', content);
      }
    } catch (error) {
      console.warn('调用message.error时出错:', error);
      console.error('❌', content);
    }
  },
  warning: (content, duration) => {
    try {
      if (message && typeof message.warning === 'function') {
        return message.warning(content, duration);
      } else {
        console.warn('⚠️', content);
      }
    } catch (error) {
      console.warn('调用message.warning时出错:', error);
      console.warn('⚠️', content);
    }
  },
  loading: (content, duration) => {
    try {
      if (message && typeof message.loading === 'function') {
        return message.loading(content, duration);
      } else {
        console.log('⏳', content);
      }
    } catch (error) {
      console.warn('调用message.loading时出错:', error);
      console.log('⏳', content);
    }
  }
};
`;

// 需要修复的文件列表
const filesToFix = [
  'client/src/hooks/useQualityData.js',
  'client/src/components/common/StorageStatsDisplay.js'
];

let totalFixed = 0;

// 修复单个文件
function fixFile(filePath) {
  console.log(chalk.blue(`\n修复文件: ${filePath}`));
  
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(chalk.red(`  ✗ 文件不存在`));
    return false;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // 检查是否已经有安全包装器
  if (content.includes('const safeMessage = {')) {
    console.log(chalk.yellow(`  ⚠ 文件已包含安全包装器`));
    
    // 只替换直接的 message 调用
    const replacements = [
      { from: /message\.success\(/g, to: 'safeMessage.success(' },
      { from: /message\.error\(/g, to: 'safeMessage.error(' },
      { from: /message\.warning\(/g, to: 'safeMessage.warning(' },
      { from: /message\.loading\(/g, to: 'safeMessage.loading(' }
    ];
    
    replacements.forEach(replacement => {
      const matches = content.match(replacement.from);
      if (matches && matches.length > 0) {
        content = content.replace(replacement.from, replacement.to);
        console.log(chalk.green(`    ✓ 替换了 ${matches.length} 处 ${replacement.from.source}`));
        modified = true;
      }
    });
    
  } else {
    // 添加安全包装器
    const importMatch = content.match(/import.*from\s+['"]antd['"];?\s*\n/);
    if (importMatch) {
      const insertPos = importMatch.index + importMatch[0].length;
      content = content.slice(0, insertPos) + safeMessageWrapper + content.slice(insertPos);
      console.log(chalk.green(`    ✓ 添加了安全包装器`));
      modified = true;
    }
    
    // 替换 message 调用
    const replacements = [
      { from: /message\.success\(/g, to: 'safeMessage.success(' },
      { from: /message\.error\(/g, to: 'safeMessage.error(' },
      { from: /message\.warning\(/g, to: 'safeMessage.warning(' },
      { from: /message\.loading\(/g, to: 'safeMessage.loading(' }
    ];
    
    replacements.forEach(replacement => {
      const matches = content.match(replacement.from);
      if (matches && matches.length > 0) {
        content = content.replace(replacement.from, replacement.to);
        console.log(chalk.green(`    ✓ 替换了 ${matches.length} 处 ${replacement.from.source}`));
        modified = true;
      }
    });
  }
  
  if (modified) {
    fs.writeFileSync(fullPath, content);
    console.log(chalk.green(`  ✓ 文件修复完成`));
    totalFixed++;
    return true;
  } else {
    console.log(chalk.gray(`  - 无需修复`));
    return false;
  }
}

// 修复所有文件
console.log(chalk.yellow('\n📋 开始修复文件...'));

filesToFix.forEach(filePath => {
  fixFile(filePath);
});

// 检查其他可能需要修复的文件
console.log(chalk.yellow('\n🔍 搜索其他需要修复的文件...'));

const searchDirs = [
  'client/src/components',
  'client/src/hooks',
  'client/src/utils'
];

function searchForMessageUsage(dir) {
  const fullDir = path.join(__dirname, '..', dir);
  
  if (!fs.existsSync(fullDir)) {
    return [];
  }
  
  const files = [];
  
  function scanDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scanDirectory(itemPath);
      } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
        const content = fs.readFileSync(itemPath, 'utf8');
        
        // 检查是否使用了 message API 但没有安全包装器
        const hasMessageUsage = /message\.(success|error|warning|loading)\(/.test(content);
        const hasSafeWrapper = content.includes('const safeMessage = {') || content.includes('safeMessage.');
        
        if (hasMessageUsage && !hasSafeWrapper) {
          const relativePath = path.relative(path.join(__dirname, '..'), itemPath);
          files.push(relativePath);
        }
      }
    });
  }
  
  scanDirectory(fullDir);
  return files;
}

const additionalFiles = [];
searchDirs.forEach(dir => {
  const foundFiles = searchForMessageUsage(dir);
  additionalFiles.push(...foundFiles);
});

if (additionalFiles.length > 0) {
  console.log(chalk.yellow(`\n发现 ${additionalFiles.length} 个额外需要修复的文件:`));
  additionalFiles.forEach(file => {
    console.log(chalk.gray(`  - ${file}`));
    fixFile(file);
  });
}

// 生成修复报告
console.log(chalk.blue('\n' + '='.repeat(50)));
console.log(chalk.blue('📊 修复完成报告'));
console.log(chalk.blue('='.repeat(50)));

console.log(chalk.green(`\n✅ 修复完成！`));
console.log(chalk.gray(`总共修复了 ${totalFixed} 个文件`));

console.log(chalk.blue('\n🎯 修复内容:'));
console.log(chalk.gray('  1. 添加了安全的 message API 包装器'));
console.log(chalk.gray('  2. 替换了所有不安全的 message 调用'));
console.log(chalk.gray('  3. 提供了降级处理方案'));
console.log(chalk.gray('  4. 确保了跨版本兼容性'));

console.log(chalk.blue('\n🚀 下一步操作:'));
console.log(chalk.gray('  1. 重启前端服务: npm run client'));
console.log(chalk.gray('  2. 清除浏览器缓存'));
console.log(chalk.gray('  3. 测试人员管理页面'));
console.log(chalk.gray('  4. 验证消息提示是否正常显示'));

console.log(chalk.blue('\n' + '='.repeat(50)));

// 创建修复日志
const fixLog = {
  timestamp: new Date().toISOString(),
  totalFilesFixed: totalFixed,
  fixedFiles: [...filesToFix, ...additionalFiles].slice(0, totalFixed),
  summary: {
    addedSafeWrapper: true,
    replacedMessageCalls: true,
    providedFallback: true,
    ensuredCompatibility: true
  }
};

const logFile = path.join(__dirname, '..', 'dev_log', 'MESSAGE_API_COMPATIBILITY_FIX.json');
fs.writeFileSync(logFile, JSON.stringify(fixLog, null, 2));

console.log(chalk.blue(`📝 修复日志已保存: ${logFile}`));