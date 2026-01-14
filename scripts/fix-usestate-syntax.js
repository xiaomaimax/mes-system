/**
 * 修复 useState 数组缺少闭合括号的问题
 * 问题: useState([...]; 应该是 useState([...]);
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
    
    // 修复: }  ]; 后面如果是注释或 const/let/var，说明缺少 )
    // useState([...]; 应该是 useState([...]);
    
    // 查找 useState([ 开始的数组，确保以 ]); 结束
    // 模式: 找到 ]; 后面跟着换行和注释或变量声明的情况
    content = content.replace(/(\s*}\s*\n\s*)\];\s*\n(\s*\n\s*\/\/)/g, '$1]);\n$2');
    content = content.replace(/(\s*}\s*\n\s*)\];\s*\n(\s*\n\s*const\s)/g, '$1]);\n$2');
    content = content.replace(/(\s*}\s*\n\s*)\];\s*\n(\s*\n\s*let\s)/g, '$1]);\n$2');
    content = content.replace(/(\s*}\s*\n\s*)\];\s*\n(\s*\n\s*var\s)/g, '$1]);\n$2');
    
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

console.log('🔧 开始修复 useState 语法...\n');
for (const dir of directories) {
  processDirectory(dir);
}
console.log(`\n✅ 完成! 修复了 ${totalFixed} 个文件`);
