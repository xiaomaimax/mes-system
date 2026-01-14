/**
 * 修复 ButtonActions 导入位置问题
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

    // 修复错误的导入位置
    // 模式: import { \nimport ButtonActions
    content = content.replace(
      /import \{ \s*\nimport ButtonActions from '\.\.\/\.\.\/utils\/buttonActions';\s*\n/g,
      "import { "
    );
    
    // 模式: import {\nimport ButtonActions
    content = content.replace(
      /import \{\s*\nimport ButtonActions from '\.\.\/\.\.\/utils\/buttonActions';\s*\n/g,
      "import { "
    );

    // 如果文件中没有正确的 ButtonActions 导入，添加到文件开头
    if (!content.includes("import ButtonActions from '../../utils/buttonActions'")) {
      // 找到第一个 import 语句
      const firstImportMatch = content.match(/^import .+$/m);
      if (firstImportMatch) {
        const insertPos = content.indexOf(firstImportMatch[0]) + firstImportMatch[0].length;
        // 检查下一行是否已经是 ButtonActions 导入
        const nextLine = content.slice(insertPos, insertPos + 100);
        if (!nextLine.includes('ButtonActions')) {
          content = content.slice(0, insertPos) + 
                    "\nimport ButtonActions from '../../utils/buttonActions';" + 
                    content.slice(insertPos);
        }
      }
    }

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

console.log('🔧 修复导入位置问题...\n');
for (const dir of directories) {
  processDirectory(dir);
}
console.log(`\n✅ 完成! 修复了 ${totalFixed} 个文件`);
