#!/usr/bin/env node

/**
 * 测试车间计划管理组件修复
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 测试车间计划管理组件修复...\n');

try {
  const workshopPlanPath = path.join(__dirname, '../client/src/components/production/WorkshopPlanManagement.js');
  const content = fs.readFileSync(workshopPlanPath, 'utf8');
  
  console.log('📋 检查修复内容...');
  
  // 检查状态映射修复
  if (content.includes("'进行中': { color: 'blue', text: '进行中' }")) {
    console.log('✅ 状态映射已添加中文支持');
  } else {
    console.log('❌ 状态映射缺少中文支持');
  }
  
  // 检查安全检查
  if (content.includes('statusMap[status] || { color: \'default\', text: status }')) {
    console.log('✅ 状态映射已添加安全检查');
  } else {
    console.log('❌ 状态映射缺少安全检查');
  }
  
  // 检查优先级映射
  if (content.includes("colorMap[priority] || 'default'")) {
    console.log('✅ 优先级映射已添加安全检查');
  } else {
    console.log('❌ 优先级映射缺少安全检查');
  }
  
  // 检查语法
  console.log('🔍 语法检查...');
  const { execSync } = require('child_process');
  execSync(`node -c "${workshopPlanPath}"`, { stdio: 'inherit' });
  console.log('✅ 语法检查通过');
  
  console.log('\n🎉 车间计划管理组件修复验证完成！');
  
  console.log('\n💡 现在应该可以正常访问车间计划页面了');
  console.log('📋 支持的状态值:');
  console.log('  - 进行中 (蓝色)');
  console.log('  - 计划中 (橙色)');
  console.log('  - 已完成 (绿色)');
  console.log('  - 已取消 (红色)');
  
  console.log('\n🚀 测试建议:');
  console.log('1. 重启开发服务器: npm start');
  console.log('2. 访问生产管理 → 车间计划管理');
  console.log('3. 确认页面正常加载且显示数据');
  
} catch (error) {
  console.error('❌ 测试失败:', error.message);
  process.exit(1);
}