/**
 * 正确修复所有语法错误
 * 问题: } > 应该是 },
 * 以及 JSX 标签属性后面的逗号应该是 >
 */

const fs = require('fs');
const path = require('path');

// 需要修复的目录
const directories = [
  'client/src/components/equipment',
  'client/src/components/integration',
  'client/src/components/inventory',
  'client/src/components/personnel',
  'client/src/components/process',
  'client/src/components/production',
  'client/src/components/quality',
  'client/src/components/settings'
];

let totalFixed = 0;

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fixes = 0;

    // 修复1: 数组中的 } > 应该是 },
    // 匹配模式: 在数组定义中，对象结束后跟着 >
    const arrayPattern = /(\s*})\s*>\s*\n(\s*\];)/g;
    if (arrayPattern.test(content)) {
      content = content.replace(arrayPattern, '$1,\n$2');
      fixes++;
    }

    // 修复2: JSX 标签属性后的逗号应该是 >
    // 例如: <Tag color={...}, 应该是 <Tag color={...}>
    const jsxPattern = /(<\w+[^>]*\{[^}]+\})\s*,\s*\n(\s*\{)/g;
    if (jsxPattern.test(content)) {
      content = content.replace(jsxPattern, '$1>\n$2');
      fixes++;
    }

    // 修复3: 更通用的 JSX 修复
    // <Tag color={...}, 应该是 <Tag color={...}>
    content = content.replace(/(<(?:Tag|Button|div|span)[^>]*\{[^}]+\})\s*,\s*$/gm, '$1>');

    // 修复4: 修复 } > 在数组末尾
    content = content.replace(/}\s*>\s*\n(\s*\];)/g, '},\n$1');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 修复: ${path.basename(filePath)}`);
      totalFixed++;
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ 错误处理 ${filePath}: ${error.message}`);
    return false;
  }
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`目录不存在: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    if (file.endsWith('.js')) {
      const filePath = path.join(dirPath, file);
      fixFile(filePath);
    }
  }
}

console.log('🔧 开始修复语法错误...\n');

for (const dir of directories) {
  console.log(`\n📁 处理目录: ${dir}`);
  processDirectory(dir);
}

console.log(`\n✅ 完成! 共修复 ${totalFixed} 个文件`);
