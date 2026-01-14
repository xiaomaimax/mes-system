#!/usr/bin/env node

/**
 * 清除缓存并重启开发服务器
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 清除缓存并重启开发服务器...\n');

try {
  // 1. 检查并删除node_modules/.cache目录
  const cacheDir = path.join(__dirname, '../node_modules/.cache');
  if (fs.existsSync(cacheDir)) {
    console.log('🗑️  删除 node_modules/.cache...');
    execSync('rmdir /s /q node_modules\\.cache', { stdio: 'inherit', shell: true });
    console.log('✅ node_modules/.cache 已删除');
  }

  // 2. 检查并删除client/node_modules/.cache目录
  const clientCacheDir = path.join(__dirname, '../client/node_modules/.cache');
  if (fs.existsSync(clientCacheDir)) {
    console.log('🗑️  删除 client/node_modules/.cache...');
    execSync('rmdir /s /q client\\node_modules\\.cache', { stdio: 'inherit', shell: true });
    console.log('✅ client/node_modules/.cache 已删除');
  }

  // 3. 验证mockData.js语法
  console.log('🔍 验证 mockData.js 语法...');
  execSync('node -c client/src/data/mockData.js', { stdio: 'inherit' });
  console.log('✅ mockData.js 语法正确');

  // 4. 验证关键组件语法
  const componentsToCheck = [
    'client/src/components/process/ProcessRouting.js',
    'client/src/components/production/WorkshopPlanManagement.js'
  ];

  for (const component of componentsToCheck) {
    console.log(`🔍 验证 ${component} 语法...`);
    execSync(`node -c ${component}`, { stdio: 'inherit' });
    console.log(`✅ ${component} 语法正确`);
  }

  console.log('\n🎉 所有检查通过！');
  console.log('\n💡 建议操作：');
  console.log('1. 停止当前开发服务器 (Ctrl+C)');
  console.log('2. 重新启动: npm start');
  console.log('3. 清除浏览器缓存 (Ctrl+Shift+R 或 F12 → Network → Disable cache)');
  console.log('4. 重新访问页面');

} catch (error) {
  console.error('❌ 操作失败:', error.message);
  console.log('\n🔧 手动操作建议：');
  console.log('1. 停止开发服务器');
  console.log('2. 删除 node_modules/.cache 目录');
  console.log('3. 重启开发服务器: npm start');
  console.log('4. 清除浏览器缓存');
}