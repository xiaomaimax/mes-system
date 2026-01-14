#!/usr/bin/env node

/**
 * 测试车间计划管理功能
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 测试车间计划管理功能...\n');

try {
  const workshopPlanPath = path.join(__dirname, '../client/src/components/production/WorkshopPlanManagement.js');
  const content = fs.readFileSync(workshopPlanPath, 'utf8');
  
  console.log('📋 检查新增功能...');
  
  // 检查自动生成计划单号功能
  if (content.includes('generatePlanNumber')) {
    console.log('✅ 自动生成计划单号功能已添加');
  } else {
    console.log('❌ 自动生成计划单号功能缺失');
  }
  
  // 检查物料选择功能
  if (content.includes('handleMaterialSelect')) {
    console.log('✅ 物料选择功能已添加');
  } else {
    console.log('❌ 物料选择功能缺失');
  }
  
  // 检查物料选择模态框
  if (content.includes('MaterialSelectModal')) {
    console.log('✅ 物料选择模态框已添加');
  } else {
    console.log('❌ 物料选择模态框缺失');
  }
  
  // 检查按钮点击事件
  if (content.includes('onClick={generatePlanNumber}')) {
    console.log('✅ 自动生成按钮事件已绑定');
  } else {
    console.log('❌ 自动生成按钮事件未绑定');
  }
  
  if (content.includes('onClick={() => setMaterialModalVisible(true)}')) {
    console.log('✅ 物料选择按钮事件已绑定');
  } else {
    console.log('❌ 物料选择按钮事件未绑定');
  }
  
  // 检查物料描述自动填充
  if (content.includes('materialDescription: selectedMaterial.description')) {
    console.log('✅ 物料描述自动填充功能已添加');
  } else {
    console.log('❌ 物料描述自动填充功能缺失');
  }
  
  // 检查mockData使用
  if (content.includes('mockData.baseData.products')) {
    console.log('✅ 使用mockData中的产品数据');
  } else {
    console.log('❌ 未使用mockData中的产品数据');
  }
  
  // 检查语法
  console.log('\n🔍 语法检查...');
  const { execSync } = require('child_process');
  execSync(`node -c "${workshopPlanPath}"`, { stdio: 'inherit' });
  console.log('✅ 语法检查通过');
  
  console.log('\n🎉 车间计划管理功能检查完成！');
  
  console.log('\n💡 新增功能说明:');
  console.log('📋 自动生成计划单号:');
  console.log('  - 格式: PLAN-YYYYMMDDHHMM');
  console.log('  - 示例: PLAN-202412251430');
  console.log('  - 点击"自动生成"按钮即可生成');
  
  console.log('\n📋 物料选择功能:');
  console.log('  - 点击"选择"按钮打开物料选择窗口');
  console.log('  - 显示所有可用产品(五金+注塑)');
  console.log('  - 选择后自动填充物料编号和描述');
  
  console.log('\n📋 可选择的物料:');
  console.log('  五金产品:');
  console.log('    - HW001: 不锈钢门把手');
  console.log('    - HW002: 铝合金窗锁');
  console.log('    - HW003: 精密轴承座');
  console.log('  注塑产品:');
  console.log('    - INJ001: 汽车仪表盘外壳');
  console.log('    - INJ002: 家电控制面板');
  console.log('    - INJ003: 医疗器械外壳');
  
  console.log('\n🚀 测试建议:');
  console.log('1. 重启开发服务器: npm start');
  console.log('2. 访问生产管理 → 车间计划管理');
  console.log('3. 点击"新增计划"按钮');
  console.log('4. 测试"自动生成"按钮');
  console.log('5. 测试"选择"按钮');
  console.log('6. 确认物料描述自动填充');
  
} catch (error) {
  console.error('❌ 测试失败:', error.message);
  process.exit(1);
}