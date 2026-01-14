/**
 * 修复数组语法错误
 * 问题: 普通数组被错误地改成了 ]); 应该是 ];
 * 只有 useState([...]) 才需要 ]);
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
    
    // 修复: const xxx = [...]);  应该是 const xxx = [...];
    // 但是 useState([...]); 是正确的
    
    // 找到所有 const xxx = [ 开头的数组定义
    // 如果不是 useState，则 ]); 应该改为 ];
    
    // 模式: const varName = [\n ... \n  ]); 
    // 如果前面没有 useState(，则改为 ];
    content = content.replace(/(const\s+\w+\s*=\s*\[[\s\S]*?\n\s*)\]\);(\s*\n)/g, (match, before, after) => {
      // 检查是否是 useState
      if (before.includes('useState(')) {
        return match; // 保持不变
      }
      return before + '];' + after;
    });
    
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

console.log('🔧 开始修复数组语法...\n');
for (const dir of directories) {
  processDirectory(dir);
}
console.log(`\n✅ 完成! 修复了 ${totalFixed} 个文件`);
