#!/usr/bin/env node

/**
 * 测试车间计划管理组件
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 测试车间计划管理组件...\n');

try {
  // 1. 检查WorkshopPlanManagement组件语法
  const workshopPlanPath = path.join(__dirname, '../client/src/components/production/WorkshopPlanManagement.js');
  console.log('📁 检查文件:', workshopPlanPath);
  
  if (!fs.existsSync(workshopPlanPath)) {
    console.log('❌ 文件不存在');
    process.exit(1);
  }
  
  console.log('✅ 文件存在');
  
  // 2. 语法检查
  const { execSync } = require('child_process');
  console.log('🔍 语法检查...');
  execSync(`node -c "${workshopPlanPath}"`, { stdio: 'inherit' });
  console.log('✅ 语法检查通过');
  
  // 3. 检查依赖导入
  const content = fs.readFileSync(workshopPlanPath, 'utf8');
  
  console.log('🔍 检查依赖导入...');
  
  // 检查mockData导入
  if (content.includes("import mockData from '../../data/mockData'")) {
    console.log('✅ mockData 导入正确');
  } else {
    console.log('❌ mockData 导入有问题');
  }
  
  // 检查React导入
  if (content.includes("import React")) {
    console.log('✅ React 导入正确');
  } else {
    console.log('❌ React 导入有问题');
  }
  
  // 检查Ant Design导入
  if (content.includes("from 'antd'")) {
    console.log('✅ Ant Design 导入正确');
  } else {
    console.log('❌ Ant Design 导入有问题');
  }
  
  // 4. 检查数据使用
  console.log('🔍 检查数据使用...');
  
  if (content.includes('mockData.productionData.productionPlans')) {
    console.log('✅ 使用了 productionPlans 数据');
  } else {
    console.log('⚠️  未使用 productionPlans 数据');
  }
  
  // 5. 检查可能的问题代码
  console.log('🔍 检查潜在问题...');
  
  // 检查是否有未定义的变量使用
  const lines = content.split('\n');
  let hasIssues = false;
  
  lines.forEach((line, index) => {
    if (line.includes('.toString()') && !line.includes('//')) {
      console.log(`⚠️  第${index + 1}行可能有toString()问题: ${line.trim()}`);
      hasIssues = true;
    }
    if (line.includes('.map(') && line.includes('step.stepNo')) {
      console.log(`⚠️  第${index + 1}行可能有stepNo问题: ${line.trim()}`);
      hasIssues = true;
    }
  });
  
  if (!hasIssues) {
    console.log('✅ 未发现明显问题');
  }
  
  console.log('\n🎉 车间计划管理组件检查完成！');
  
  console.log('\n💡 如果仍有问题，建议：');
  console.log('1. 清除浏览器缓存 (Ctrl+Shift+R)');
  console.log('2. 重启开发服务器');
  console.log('3. 检查浏览器控制台的完整错误信息');
  console.log('4. 确认访问的是正确的页面路径');
  
} catch (error) {
  console.error('❌ 测试失败:', error.message);
  process.exit(1);
}