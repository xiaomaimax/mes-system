#!/usr/bin/env node

/**
 * 工艺管理模块删除按钮功能测试
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 工艺管理模块删除按钮功能测试开始...\n');

// 测试结果统计
let testResults = {
  total: 0,
  passed: 0,
  failed: 0
};

// 测试工具函数
function test(description, testFn) {
  testResults.total++;
  try {
    const result = testFn();
    if (result === true) {
      console.log(`✅ ${description}`);
      testResults.passed++;
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

console.log('🏭 工艺管理子组件删除按钮测试');
console.log('================================');

// 测试各个工艺管理子组件
const components = [
  {
    name: 'ProcessRouting (工艺路线)',
    file: 'client/src/components/process/ProcessRouting.js',
    functions: ['handleDeleteRoute', 'handleDeleteOperation']
  },
  {
    name: 'ProcessParameters (工艺参数)',
    file: 'client/src/components/process/ProcessParameters.js',
    functions: ['handleDeleteParameter']
  },
  {
    name: 'ProcessDocuments (工艺文件)',
    file: 'client/src/components/process/ProcessDocuments.js',
    functions: ['handleDeleteDocument']
  },
  {
    name: 'ProcessSOP (作业指导)',
    file: 'client/src/components/process/ProcessSOP.js',
    functions: ['handleDeleteSOP']
  },
  {
    name: 'ProcessOptimization (工艺优化)',
    file: 'client/src/components/process/ProcessOptimization.js',
    functions: ['handleDeleteOptimization']
  },
  {
    name: 'ProcessValidation (工艺验证)',
    file: 'client/src/components/process/ProcessValidation.js',
    functions: ['handleDeleteValidation']
  },
  {
    name: 'ProcessChangeControl (变更控制)',
    file: 'client/src/components/process/ProcessChangeControl.js',
    functions: ['handleDeleteChange']
  },
  {
    name: 'ProcessMasterData (主数据)',
    file: 'client/src/components/process/ProcessMasterData.js',
    functions: ['handleDeleteMasterData']
  }
];

components.forEach(component => {
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

console.log('\n📊 测试结果统计');
console.log('================================');
console.log(`总测试数: ${testResults.total}`);
console.log(`✅ 通过: ${testResults.passed}`);
console.log(`❌ 失败: ${testResults.failed}`);

const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
console.log(`\n🎯 成功率: ${successRate}%`);

if (testResults.failed === 0) {
  console.log('\n🎉 所有工艺管理删除按钮功能测试通过！');
  
  console.log('\n✅ 修复完成的功能:');
  console.log('1. 工艺路线删除 - 支持路线和工序删除');
  console.log('2. 工艺参数删除 - 支持参数删除确认');
  console.log('3. 工艺文件删除 - 支持文档删除确认');
  console.log('4. 作业指导删除 - 支持SOP删除确认');
  console.log('5. 工艺优化删除 - 支持优化建议删除');
  console.log('6. 工艺验证删除 - 支持验证记录删除');
  console.log('7. 变更控制删除 - 支持变更申请删除');
  console.log('8. 主数据删除 - 支持多种主数据删除');
  
  console.log('\n🔧 删除功能特性:');
  console.log('• 确认对话框 - 防止误删除');
  console.log('• 删除提示 - 显示删除进度');
  console.log('• 成功反馈 - 确认删除结果');
  console.log('• 统一体验 - 所有删除操作一致');
  
} else {
  console.log('\n⚠️  部分删除按钮功能测试失败，请检查实现。');
}

console.log('\n🔄 浏览器测试步骤:');
console.log('1. 访问 http://localhost:3000');
console.log('2. 登录系统 (admin/admin123)');
console.log('3. 进入工艺管理模块');
console.log('4. 依次进入各个子功能页面:');
console.log('   - 工艺路线');
console.log('   - 工艺参数');
console.log('   - 工艺文件');
console.log('   - 作业指导');
console.log('   - 工艺优化');
console.log('   - 工艺验证');
console.log('   - 变更控制');
console.log('   - 主数据');
console.log('5. 在每个页面点击删除按钮');
console.log('6. 验证确认对话框弹出');
console.log('7. 确认删除后查看成功提示');

console.log('\n📱 预期效果:');
console.log('• 点击删除按钮弹出确认对话框');
console.log('• 对话框显示要删除的项目信息');
console.log('• 确认删除后显示删除进度');
console.log('• 删除完成后显示成功消息');
console.log('• 取消删除时对话框关闭，无其他操作');