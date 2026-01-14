#!/usr/bin/env node

/**
 * 测试车间计划编辑功能
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 测试车间计划编辑功能...\n');

try {
  const workshopPlanPath = path.join(__dirname, '../client/src/components/production/WorkshopPlanManagement.js');
  const content = fs.readFileSync(workshopPlanPath, 'utf8');
  
  console.log('📋 检查编辑功能实现...');
  
  // 检查状态管理
  if (content.includes('const [planData, setPlanData] = useState')) {
    console.log('✅ 使用状态管理planData');
  } else {
    console.log('❌ 未使用状态管理planData');
  }
  
  // 检查编辑状态
  if (content.includes('const [editingRecord, setEditingRecord] = useState')) {
    console.log('✅ 添加了编辑状态管理');
  } else {
    console.log('❌ 缺少编辑状态管理');
  }
  
  // 检查编辑模式判断
  if (content.includes('if (editingRecord)')) {
    console.log('✅ 添加了编辑模式判断');
  } else {
    console.log('❌ 缺少编辑模式判断');
  }
  
  // 检查数据更新逻辑
  if (content.includes('setPlanData(prevData =>')) {
    console.log('✅ 添加了数据更新逻辑');
  } else {
    console.log('❌ 缺少数据更新逻辑');
  }
  
  // 检查编辑按钮事件
  if (content.includes('onClick={() => handleEdit(record)}')) {
    console.log('✅ 编辑按钮事件已绑定');
  } else {
    console.log('❌ 编辑按钮事件未绑定');
  }
  
  // 检查模态框标题动态化
  if (content.includes('editingRecord ? "编辑车间计划" : "车间计划新增"')) {
    console.log('✅ 模态框标题支持动态切换');
  } else {
    console.log('❌ 模态框标题未动态化');
  }
  
  // 检查删除功能
  if (content.includes('setPlanData(prevData => prevData.filter')) {
    console.log('✅ 删除功能已实现数据更新');
  } else {
    console.log('❌ 删除功能未实现数据更新');
  }
  
  // 检查表单重置
  if (content.includes('setEditingRecord(null)')) {
    console.log('✅ 添加了编辑状态重置');
  } else {
    console.log('❌ 缺少编辑状态重置');
  }
  
  // 检查语法
  console.log('\n🔍 语法检查...');
  const { execSync } = require('child_process');
  execSync(`node -c "${workshopPlanPath}"`, { stdio: 'inherit' });
  console.log('✅ 语法检查通过');
  
  console.log('\n🎉 车间计划编辑功能检查完成！');
  
  console.log('\n💡 功能说明:');
  console.log('📋 编辑功能:');
  console.log('  - 点击表格中的"编辑"按钮');
  console.log('  - 表单自动填充当前数据');
  console.log('  - 修改后点击"保存"');
  console.log('  - 数据实时更新到表格中');
  
  console.log('\n📋 新增功能:');
  console.log('  - 点击"新增计划"按钮');
  console.log('  - 填写表单数据');
  console.log('  - 点击"保存"');
  console.log('  - 新数据添加到表格中');
  
  console.log('\n📋 删除功能:');
  console.log('  - 点击表格中的"删除"按钮');
  console.log('  - 确认删除');
  console.log('  - 数据从表格中移除');
  
  console.log('\n🚀 测试建议:');
  console.log('1. 重启开发服务器: npm start');
  console.log('2. 访问生产管理 → 车间计划管理');
  console.log('3. 测试编辑功能:');
  console.log('   - 点击某行的"编辑"按钮');
  console.log('   - 修改计划数量或其他字段');
  console.log('   - 点击"保存"');
  console.log('   - 确认表格数据已更新');
  console.log('4. 测试新增功能:');
  console.log('   - 点击"新增计划"按钮');
  console.log('   - 使用"自动生成"和"选择"功能');
  console.log('   - 保存后确认新数据出现在表格中');
  console.log('5. 测试删除功能:');
  console.log('   - 点击某行的"删除"按钮');
  console.log('   - 确认删除后数据从表格消失');
  
} catch (error) {
  console.error('❌ 测试失败:', error.message);
  process.exit(1);
}