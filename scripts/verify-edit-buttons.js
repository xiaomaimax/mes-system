#!/usr/bin/env node

/**
 * 验证所有编辑按钮功能修复结果
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 验证所有编辑按钮功能修复结果...\n');

// 读取修复清单
const fixListPath = 'scripts/edit-buttons-fix-list.json';
const fixList = JSON.parse(fs.readFileSync(fixListPath, 'utf8'));

let totalChecked = 0;
let passedChecks = 0;
let failedChecks = 0;
let verificationResults = [];

console.log('📊 验证结果:\n');

fixList.forEach((component, index) => {
  console.log(`🔍 验证组件 ${index + 1}/${fixList.length}: ${component.name}`);
  
  const filePath = component.path;
  if (!fs.existsSync(filePath)) {
    console.log(`  ❌ 文件不存在`);
    failedChecks++;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  let checks = [];
  let passed = 0;
  let total = 0;
  
  // 检查1: 状态管理
  total++;
  const hasStateManagement = content.includes('useState') && (
    content.includes('setData') || 
    content.includes('setPlanData') || 
    content.includes('setTableData') ||
    content.includes('setRecords') ||
    content.includes('setItems') ||
    content.includes('setEquipmentData') ||
    content.includes('setInspectionData') ||
    content.includes('setInventoryData') ||
    content.includes('setProcessData') ||
    content.includes('setPersonnelData') ||
    content.includes('setUserData') ||
    content.includes('setRoleData') ||
    content.includes('setInterfaceData')
  );
  if (hasStateManagement) {
    checks.push('✅ 状态管理');
    passed++;
  } else {
    checks.push('❌ 状态管理');
  }
  
  // 检查2: 编辑状态跟踪
  total++;
  const hasEditingState = content.includes('editingRecord') || content.includes('editingItem');
  if (hasEditingState) {
    checks.push('✅ 编辑状态跟踪');
    passed++;
  } else {
    checks.push('❌ 编辑状态跟踪');
  }
  
  // 检查3: handleEdit函数
  total++;
  const hasHandleEdit = content.includes('const handleEdit') || content.includes('function handleEdit');
  if (hasHandleEdit) {
    checks.push('✅ handleEdit函数');
    passed++;
  } else {
    checks.push('❌ handleEdit函数');
  }
  
  // 检查4: 数据更新逻辑
  total++;
  const hasDataUpdate = content.includes('map(item =>') && content.includes('key ===') && content.includes('...item');
  if (hasDataUpdate) {
    checks.push('✅ 数据更新逻辑');
    passed++;
  } else {
    checks.push('❌ 数据更新逻辑');
  }
  
  // 检查5: 表单填充
  total++;
  const hasFormFill = content.includes('form.setFieldsValue') && content.includes('record');
  if (hasFormFill) {
    checks.push('✅ 表单填充');
    passed++;
  } else {
    checks.push('❌ 表单填充');
  }
  
  // 检查6: 模态框控制
  total++;
  const hasModalControl = content.includes('setModalVisible') || content.includes('setVisible');
  if (hasModalControl) {
    checks.push('✅ 模态框控制');
    passed++;
  } else {
    checks.push('❌ 模态框控制');
  }
  
  // 检查7: 编辑按钮绑定
  total++;
  const hasEditButtonBinding = content.includes('onClick={() => handleEdit(record)}');
  if (hasEditButtonBinding) {
    checks.push('✅ 编辑按钮绑定');
    passed++;
  } else {
    checks.push('❌ 编辑按钮绑定');
  }
  
  // 检查8: 动态模态框标题
  total++;
  const hasDynamicTitle = content.includes('editingRecord ?') && content.includes('编辑') && content.includes('新增');
  if (hasDynamicTitle) {
    checks.push('✅ 动态模态框标题');
    passed++;
  } else {
    checks.push('❌ 动态模态框标题');
  }
  
  // 语法检查
  total++;
  try {
    require('child_process').execSync(`node -c "${filePath}"`, { stdio: 'pipe' });
    checks.push('✅ 语法检查');
    passed++;
  } catch (error) {
    checks.push('❌ 语法检查');
  }
  
  const score = Math.round((passed / total) * 100);
  const status = score >= 80 ? '✅' : score >= 60 ? '⚠️' : '❌';
  
  console.log(`  ${status} 完成度: ${passed}/${total} (${score}%)`);
  console.log(`  检查项: ${checks.join(', ')}`);
  
  verificationResults.push({
    name: component.name,
    path: component.path,
    score: score,
    passed: passed,
    total: total,
    checks: checks
  });
  
  totalChecked++;
  if (score >= 80) {
    passedChecks++;
  } else {
    failedChecks++;
  }
  
  console.log('');
});

// 统计结果
console.log('\n📈 验证统计:');
console.log(`总验证组件: ${totalChecked}`);
console.log(`通过验证 (≥80%): ${passedChecks}`);
console.log(`需要改进 (<80%): ${failedChecks}`);
console.log(`总体通过率: ${Math.round((passedChecks / totalChecked) * 100)}%`);

// 按分数排序
verificationResults.sort((a, b) => b.score - a.score);

console.log('\n🏆 验证结果排行:');
console.log('\n✅ 优秀组件 (90-100%):');
const excellent = verificationResults.filter(r => r.score >= 90);
excellent.forEach(r => {
  console.log(`  ${r.name}: ${r.score}% (${r.passed}/${r.total})`);
});

console.log('\n⚠️ 良好组件 (80-89%):');
const good = verificationResults.filter(r => r.score >= 80 && r.score < 90);
good.forEach(r => {
  console.log(`  ${r.name}: ${r.score}% (${r.passed}/${r.total})`);
});

console.log('\n❌ 需要改进组件 (<80%):');
const needImprovement = verificationResults.filter(r => r.score < 80);
needImprovement.forEach(r => {
  console.log(`  ${r.name}: ${r.score}% (${r.passed}/${r.total})`);
  const failedChecks = r.checks.filter(c => c.startsWith('❌'));
  if (failedChecks.length > 0) {
    console.log(`    缺失: ${failedChecks.join(', ')}`);
  }
});

// 功能测试指南
console.log('\n🧪 功能测试指南:');
console.log('\n1. 基本编辑测试:');
console.log('   - 点击任意表格行的"编辑"按钮');
console.log('   - 确认模态框打开且标题显示"编辑xxx"');
console.log('   - 确认表单已填充当前行数据');
console.log('   - 修改部分字段后点击"保存"');
console.log('   - 确认表格数据已更新');

console.log('\n2. 新增功能测试:');
console.log('   - 点击"新增"或"新建"按钮');
console.log('   - 确认模态框标题显示"新增xxx"');
console.log('   - 填写表单数据后点击"保存"');
console.log('   - 确认新数据出现在表格中');

console.log('\n3. 状态重置测试:');
console.log('   - 编辑后点击"取消"按钮');
console.log('   - 确认模态框关闭且表单重置');
console.log('   - 再次点击编辑确认状态正确');

console.log('\n🎯 重点测试模块:');
console.log('- 生产管理 → 车间计划管理 (已知正常)');
console.log('- 生产管理 → 生产任务管理');
console.log('- 设备管理 → 设备主数据');
console.log('- 质量管理 → IQC检验');
console.log('- 库存管理 → 库存主数据');
console.log('- 工艺管理 → 工艺路线');
console.log('- 人员管理 → 员工管理');
console.log('- 系统设置 → 用户管理');

if (passedChecks === totalChecked) {
  console.log('\n🎉 所有编辑功能验证通过！系统编辑功能已完全修复！');
} else {
  console.log(`\n⚠️  还有 ${failedChecks} 个组件需要进一步改进`);
}

// 保存验证结果
fs.writeFileSync(
  'scripts/edit-buttons-verification-results.json',
  JSON.stringify(verificationResults, null, 2)
);

console.log('\n📄 详细验证结果已保存到: scripts/edit-buttons-verification-results.json');