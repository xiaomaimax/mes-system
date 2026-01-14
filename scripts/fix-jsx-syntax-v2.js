/**
 * 修复 JSX 语法错误 - 第二轮
 * 主要问题: </Space>}\n      , 应该是 </Space>}\n      >
 */

const fs = require('fs');
const path = require('path');

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
    
    // 修复: </Space>}\n      , 应该是 </Space>}>\n
    // 这是 Card extra={...} 属性结束后的问题
    content = content.replace(/(<\/\w+>})\s*\n\s*,\s*\n/g, '$1>\n');
    
    // 修复: }}\n      , 应该是 }}>\n
    content = content.replace(/(}}\s*)\n\s*,\s*\n/g, '$1>\n');
    
    // 修复: ]\n      , 应该是 ]>\n (数组属性结束)
    content = content.replace(/(\])\s*\n\s*,\s*\n/g, '$1>\n');
    
    // 修复单独一行的逗号 (在 JSX 属性后)
    content = content.replace(/\n(\s*),\s*\n(\s*<)/g, '\n$1>\n$2');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 修复: ${path.basename(filePath)}`);
      totalFixed++;
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ 错误: ${filePath}: ${error.message}`);
    return false;
  }
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    if (file.endsWith('.js')) {
      fixFile(path.join(dirPath, file));
    }
  }
}

console.log('🔧 开始第二轮修复...\n');
for (const dir of directories) {
  processDirectory(dir);
}
console.log(`\n✅ 完成! 修复了 ${totalFixed} 个文件`);
