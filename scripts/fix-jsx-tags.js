/**
 * 修复 JSX 标签语法错误
 * 问题: <Row gutter={16}, 应该是 <Row gutter={16}>
 *       <Col span={12}, 应该是 <Col span={12}>
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
    
    // 修复: <Row gutter={16}, 应该是 <Row gutter={16}>
    content = content.replace(/<Row\s+gutter=\{(\d+)\}\s*,\s*\n/g, '<Row gutter={$1}>\n');
    
    // 修复: <Col span={12}, 应该是 <Col span={12}>
    content = content.replace(/<Col\s+span=\{(\d+)\}\s*,\s*\n/g, '<Col span={$1}>\n');
    
    // 修复: <Form.Item ...>, 应该是 <Form.Item ...>
    content = content.replace(/(<Form\.Item[^>]*})\s*,\s*\n/g, '$1>\n');
    
    // 修复: <Descriptions ...>, 应该是 <Descriptions ...>
    content = content.replace(/(<Descriptions[^>]*})\s*,\s*\n/g, '$1>\n');
    
    // 修复: <Descriptions.Item ...>, 应该是 <Descriptions.Item ...>
    content = content.replace(/(<Descriptions\.Item[^>]*})\s*,\s*\n/g, '$1>\n');
    content = content.replace(/(<Descriptions\.Item[^>]*")\s*,\s*\n/g, '$1>\n');
    
    // 修复: }}>\n  , 应该是 }}>
    content = content.replace(/}}\s*>\s*\n\s*,\s*\n/g, '}}>\n');
    
    // 修复: >\n  , 应该是 >
    content = content.replace(/>\s*\n\s*,\s*\n(\s*<)/g, '>\n$1');
    
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

console.log('🔧 开始修复 JSX 标签语法...\n');
for (const dir of directories) {
  processDirectory(dir);
}
console.log(`\n✅ 完成! 修复了 ${totalFixed} 个文件`);
