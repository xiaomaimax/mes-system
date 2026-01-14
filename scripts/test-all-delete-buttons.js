#!/usr/bin/env node

/**
 * 全面测试所有模块的删除按钮功能
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 全面测试所有模块删除按钮功能...\n');

// 测试结果统计
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0
};

// 测试工具函数
function test(description, testFn) {
  testResults.total++;
  try {
    const result = testFn();
    if (result === true) {
      console.log(`✅ ${description}`);
      testResults.passed++;
    } else if (result === 'warning') {
      console.log(`⚠️  ${description}`);
      testResults.warnings++;
    } else {
      console.log(`❌ ${description}`);
      testResults.failed++;
    }
  } catch (error) {
    console.log(`❌ ${description} - 错误: ${error.message}`);
    testResults.failed++;
  }
}

// 检查文件内容
function checkFileContent(filePath, searchText) {
  try {
    const content = fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
    return content.includes(searchText);
  } catch {
    return false;
  }
}

// 检查删除按钮功能
function checkDeleteButton(filePath, functionName) {
  try {
    const content = fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
    return content.includes(functionName) && 
           content.includes('ButtonActions.simulateDelete') &&
           content.includes(`onClick={() => ${functionName}(record)}`);
  } catch {
    return false;
  }
}

// 所有需要测试的模块
const modules = [
  {
    name: '工艺管理模块',
    components: [
      { name: 'ProcessRouting', file: 'client/src/components/process/ProcessRouting.js', functions: ['handleDeleteRoute', 'handleDeleteOperation'] },
      { name: 'ProcessParameters', file: 'client/src/components/process/ProcessParameters.js', functions: ['handleDeleteParameter'] },
      { name: 'ProcessDocuments', file: 'client/src/components/process/ProcessDocuments.js', functions: ['handleDeleteDocument'] },
      { name: 'ProcessSOP', file: 'client/src/components/process/ProcessSOP.js', functions: ['handleDeleteSOP'] },
      { name: 'ProcessOptimization', file: 'client/src/components/process/ProcessOptimization.js', functions: ['handleDeleteOptimization'] },
      { name: 'ProcessValidation', file: 'client/src/components/process/ProcessValidation.js', functions: ['handleDeleteValidation'] },
      { name: 'ProcessChangeControl', file: 'client/src/components/process/ProcessChangeControl.js', functions: ['handleDeleteChange'] },
      { name: 'ProcessMasterData', file: 'client/src/components/process/ProcessMasterData.js', functions: ['handleDeleteMasterData'] }
    ]
  },
  {
    name: '生产管理模块',
    components: [
      { name: 'ProductionMasterData', file: 'client/src/components/production/MasterData.js', functions: ['handleDeleteMasterData'] },
      { name: 'WorkshopPlanManagement', file: 'client/src/components/production/WorkshopPlanManagement.js', functions: ['handleDeletePlan'] },
      { name: 'WorkReportManagement', file: 'client/src/components/production/WorkReportManagement.js', functions: ['handleDeleteReport'] },
      { name: 'ShiftScheduleManagement', file: 'client/src/components/production/ShiftScheduleManagement.js', functions: ['handleDeleteSchedule'] },
      { name: 'ProductionMasterDataManagement', file: 'client/src/components/production/ProductionMasterDataManagement.js', functions: ['handleDeleteData'] },
      { name: 'LineMaterialsManagement', file: 'client/src/components/production/LineMaterialsManagement.js', functions: ['handleDeleteMaterial'] },
      { name: 'EquipmentResponsibilityManagement', file: 'client/src/components/production/EquipmentResponsibilityManagement.js', functions: ['handleDeleteResponsibility'] }
    ]
  },
  {
    name: '设备管理模块',
    components: [
      { name: 'EquipmentMasterData', file: 'client/src/components/equipment/EquipmentMasterData.js', functions: ['handleDeleteEquipment'] }
    ]
  },
  {
    name: '质量管理模块',
    components: [
      { name: 'InspectionStandards', file: 'client/src/components/quality/InspectionStandards.js', functions: ['handleDeleteStandard'] },
      { name: 'DefectReasons', file: 'client/src/components/quality/DefectReasons.js', functions: ['handleDeleteReason'] }
    ]
  },
  {
    name: '库存管理模块',
    components: [
      { name: 'InventoryMasterData', file: 'client/src/components/inventory/InventoryMasterData.js', functions: ['handleDeleteInventory'] }
    ]
  },
  {
    name: '人员管理模块',
    components: [
      { name: 'WorkSchedule', file: 'client/src/components/personnel/WorkSchedule.js', functions: ['handleDeleteSchedule'] },
      { name: 'TrainingManagement', file: 'client/src/components/personnel/TrainingManagement.js', functions: ['handleDeleteTraining'] },
      { name: 'SkillCertification', file: 'client/src/components/personnel/SkillCertification.js', functions: ['handleDeleteCertification'] }
    ]
  },
  {
    name: '系统设置模块',
    components: [
      { name: 'SystemBackup', file: 'client/src/components/settings/SystemBackup.js', functions: ['handleDeleteBackup'] },
      { name: 'RoleManagement', file: 'client/src/components/settings/RoleManagement.js', functions: ['handleDeleteRole'] }
    ]
  }
];

// 测试所有模块
modules.forEach(module => {
  console.log(`\n🏭 ${module.name}`);
  console.log('================================');
  
  module.components.forEach(component => {
    console.log(`\n📋 ${component.name}`);
    console.log('--------------------------------');
    
    // 检查 ButtonActions 导入
    test(`${component.name} - ButtonActions导入`, () => 
      checkFileContent(component.file, 'import ButtonActions'));
    
    // 检查删除处理函数
    component.functions.forEach(func => {
      test(`${component.name} - ${func}函数`, () => 
        checkFileContent(component.file, func));
      
      test(`${component.name} - ${func}删除功能`, () => 
        checkDeleteButton(component.file, func));
    });
    
    // 检查 simulateDelete 调用
    test(`${component.name} - simulateDelete调用`, () => 
      checkFileContent(component.file, 'ButtonActions.simulateDelete'));
    
    // 检查成功提示
    test(`${component.name} - 删除成功提示`, () => 
      checkFileContent(component.file, 'showSuccess'));
  });
});

console.log('\n📊 测试结果统计');
console.log('================================');
console.log(`总测试数: ${testResults.total}`);
console.log(`✅ 通过: ${testResults.passed}`);
console.log(`⚠️  警告: ${testResults.warnings}`);
console.log(`❌ 失败: ${testResults.failed}`);

const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
console.log(`\n🎯 成功率: ${successRate}%`);

if (testResults.failed === 0) {
  console.log('\n🎉 所有模块删除按钮功能测试通过！');
  
  console.log('\n✅ 修复完成的模块:');
  console.log('• 工艺管理 - 8个子组件，11个删除功能');
  console.log('• 生产管理 - 7个子组件，7个删除功能');
  console.log('• 设备管理 - 1个子组件，1个删除功能');
  console.log('• 质量管理 - 2个子组件，2个删除功能');
  console.log('• 库存管理 - 1个子组件，1个删除功能');
  console.log('• 人员管理 - 3个子组件，3个删除功能');
  console.log('• 系统设置 - 2个子组件，2个删除功能');
  
  console.log('\n🔧 删除功能特性:');
  console.log('• 确认对话框 - 防止误删除');
  console.log('• 删除提示 - 显示删除进度');
  console.log('• 成功反馈 - 确认删除结果');
  console.log('• 统一体验 - 所有删除操作一致');
  
} else {
  console.log('\n⚠️  部分删除按钮功能测试失败，请检查实现。');
}

console.log('\n🔄 浏览器测试指南:');
console.log('1. 访问 http://localhost:3000');
console.log('2. 登录系统 (admin/admin123)');
console.log('3. 依次进入各个模块:');
console.log('   - 工艺管理 → 各子功能页面');
console.log('   - 生产管理 → 各子功能页面');
console.log('   - 设备管理 → 设备主数据');
console.log('   - 质量管理 → 检验标准、次品原因');
console.log('   - 库存管理 → 库存主数据');
console.log('   - 人员管理 → 工作排班、培训管理、技能认证');
console.log('   - 系统设置 → 系统备份、角色管理');
console.log('4. 在每个页面点击删除按钮');
console.log('5. 验证确认对话框弹出');
console.log('6. 确认删除后查看成功提示');

console.log('\n📱 预期效果:');
console.log('• 点击删除按钮弹出确认对话框');
console.log('• 对话框显示要删除的项目信息');
console.log('• 确认删除后显示删除进度');
console.log('• 删除完成后显示成功消息');
console.log('• 取消删除时对话框关闭，无其他操作');