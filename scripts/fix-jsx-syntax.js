/**
 * 全面修复 JSX 语法错误
 * 错误模式:
 * 1. <Button ...>, 应该是 <Button ...>
 * 2. </Space\n  } 应该是 </Space>}
 * 3. <Tag color={...}, 应该是 <Tag color={...}>
 * 4. <div style={{...}}, 应该是 <div style={{...}}>
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
let totalErrors = 0;

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // 修复1: </Tag>\n  } 或 </Space>\n  } 等 - 闭合标签后换行再跟 }
    content = content.replace(/<\/(Tag|Space|Button|div|span|Card|Modal|Form|Row|Col|Select|Descriptions|Table)>\s*\n\s*}/g, '</$1>}');
    
    // 修复2: >, 在行尾 - JSX 标签结束符后多了逗号
    content = content.replace(/>,\s*$/gm, '>');
    
    // 修复3: <Tag color={...}, 应该是 <Tag color={...}>
    content = content.replace(/(<(?:Tag|Button|div|span|Avatar|Space|Card|Modal|Form|Input|Select|DatePicker|Switch)[^>]*})\s*,\s*\n/g, '$1>\n');
    
    // 修复4: </Space\n  } 应该是 </Space>}
    content = content.replace(/<\/(\w+)\s*\n\s*}/g, '</$1>}');
    
    // 修复5: 修复 Button onClick 后面的逗号
    content = content.replace(/(onClick=\{[^}]+\})\s*,\s*\n/g, '$1>\n');
    
    // 修复6: 修复 icon={...}, 后面的逗号
    content = content.replace(/(icon=\{[^}]+\})\s*,\s*\n/g, '$1>\n');
    
    // 修复7: 修复 type="..." 后面的逗号
    content = content.replace(/(type="[^"]*")\s*,\s*\n/g, '$1>\n');
    
    // 修复8: 修复 size="..." 后面的逗号
    content = content.replace(/(size="[^"]*")\s*,\s*\n/g, '$1>\n');
    
    // 修复9: 修复 danger 后面的逗号
    content = content.replace(/(\s+danger)\s*,\s*\n/g, '$1>\n');
    
    // 修复10: 修复 style={{...}}, 后面的逗号
    content = content.replace(/(style=\{\{[^}]+\}\})\s*,\s*\n/g, '$1>\n');
    
    // 修复11: 修复 placeholder="..." 后面的逗号
    content = content.replace(/(placeholder="[^"]*")\s*,\s*\n/g, '$1>\n');
    
    // 修复12: 修复 color={...}, 后面的逗号
    content = content.replace(/(color=\{[^}]+\})\s*,\s*\n/g, '$1>\n');
    
    // 修复13: 修复 </Button\n  } 等
    content = content.replace(/<\/(Button|Tag|Space|Card|Modal|Form|Select|div|span)\s*\n\s*}/g, '</$1>}');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 修复: ${path.basename(filePath)}`);
      totalFixed++;
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ 错误: ${filePath}: ${error.message}`);
    totalErrors++;
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

console.log('🔧 开始修复 JSX 语法错误...\n');

for (const dir of directories) {
  console.log(`\n📁 处理目录: ${dir}`);
  processDirectory(dir);
}

console.log(`\n✅ 完成! 修复了 ${totalFixed} 个文件`);
if (totalErrors > 0) {
  console.log(`⚠️ ${totalErrors} 个文件处理出错`);
}
