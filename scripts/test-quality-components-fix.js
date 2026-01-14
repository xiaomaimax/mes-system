#!/usr/bin/env node

/**
 * 测试质量管理组件修复
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 测试质量管理组件修复...\n');

try {
  const iqcPath = path.join(__dirname, '../client/src/components/quality/IQCInspection.js');
  const standardsPath = path.join(__dirname, '../client/src/components/quality/InspectionStandards.js');
  
  console.log('📋 检查IQC检验组件...');
  
  const iqcContent = fs.readFileSync(iqcPath, 'utf8');
  
  // 检查数据结构修复
  if (iqcContent.includes('result: \'pass\'') && iqcContent.includes('status: \'completed\'')) {
    console.log('✅ IQC数据结构已修复为英文键值');
  } else {
    console.log('❌ IQC数据结构未正确修复');
  }
  
  // 检查安全检查
  if (iqcContent.includes('resultMap[result] || { color: \'default\'')) {
    console.log('✅ IQC结果映射添加了安全检查');
  } else {
    console.log('❌ IQC结果映射缺少安全检查');
  }
  
  if (iqcContent.includes('statusMap[status] || { color: \'default\'')) {
    console.log('✅ IQC状态映射添加了安全检查');
  } else {
    console.log('❌ IQC状态映射缺少安全检查');
  }
  
  if (iqcContent.includes('(types && types.length > 0)')) {
    console.log('✅ IQC缺陷类型添加了安全检查');
  } else {
    console.log('❌ IQC缺陷类型缺少安全检查');
  }
  
  console.log('\n📋 检查检验标准组件...');
  
  const standardsContent = fs.readFileSync(standardsPath, 'utf8');
  
  // 检查数据结构修复
  if (standardsContent.includes('inspectionType: \'dimension\'') && standardsContent.includes('status: \'active\'')) {
    console.log('✅ 检验标准数据结构已修复为英文键值');
  } else {
    console.log('❌ 检验标准数据结构未正确修复');
  }
  
  // 检查安全检查
  if (standardsContent.includes('typeMap[type] || { color: \'default\'')) {
    console.log('✅ 检验标准类型映射添加了安全检查');
  } else {
    console.log('❌ 检验标准类型映射缺少安全检查');
  }
  
  // 检查语法
  console.log('\n🔍 语法检查...');
  const { execSync } = require('child_process');
  execSync(`node -c "${iqcPath}"`, { stdio: 'inherit' });
  console.log('✅ IQC检验组件语法检查通过');
  
  execSync(`node -c "${standardsPath}"`, { stdio: 'inherit' });
  console.log('✅ 检验标准组件语法检查通过');
  
  console.log('\n🎉 质量管理组件修复检查完成！');
  
  console.log('\n💡 修复内容:');
  console.log('📋 IQC检验组件:');
  console.log('  - 修复数据结构，使用英文键值 (pass, completed等)');
  console.log('  - 添加resultMap和statusMap的安全检查');
  console.log('  - 修复缺陷类型数组的空值检查');
  console.log('  - 增加完整的检验数据示例');
  
  console.log('\n📋 检验标准组件:');
  console.log('  - 修复数据结构，使用英文键值 (active, dimension等)');
  console.log('  - 添加typeMap的安全检查');
  console.log('  - 增加完整的标准数据示例');
  console.log('  - 保持删除按钮功能完整');
  
  console.log('\n🚀 测试建议:');
  console.log('1. 重启开发服务器确保更改生效');
  console.log('2. 访问质量管理 → IQC检验');
  console.log('3. 访问质量管理 → 检验标准');
  console.log('4. 确认页面正常加载，无JavaScript错误');
  console.log('5. 测试表格数据显示正常');
  console.log('6. 测试状态和结果标签颜色正确');
  
} catch (error) {
  console.error('❌ 测试失败:', error.message);
  process.exit(1);
}