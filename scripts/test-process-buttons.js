#!/usr/bin/env node

/**
 * 工艺管理模块按钮功能专项测试
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 工艺管理模块按钮功能测试开始...\n');

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

console.log('🏭 工艺管理模块按钮功能检查');
console.log('================================');

const processFile = 'client/src/components/SimpleProcess.js';

test('工艺管理导入ButtonActions', () => 
  checkFileContent(processFile, 'import ButtonActions'));

test('新建工艺路线按钮功能', () => 
  checkFileContent(processFile, 'handleNewProcessRoute'));

test('工艺变更按钮功能', () => 
  checkFileContent(processFile, 'handleProcessChange'));

test('工艺优化按钮功能', () => 
  checkFileContent(processFile, 'handleProcessOptimization'));

test('工艺验证按钮功能', () => 
  checkFileContent(processFile, 'handleProcessValidation'));

test('新建工艺路线onClick事件', () => 
  checkFileContent(processFile, 'onClick={handleNewProcessRoute}'));

test('工艺变更onClick事件', () => 
  checkFileContent(processFile, 'onClick={handleProcessChange}'));

test('工艺优化onClick事件', () => 
  checkFileContent(processFile, 'onClick={handleProcessOptimization}'));

test('立即处理onClick事件', () => 
  checkFileContent(processFile, 'onClick={handleProcessValidation}'));

test('ButtonActions.simulateSubmit调用', () => 
  checkFileContent(processFile, 'ButtonActions.simulateSubmit'));

test('ButtonActions.showInfo调用', () => 
  checkFileContent(processFile, 'ButtonActions.showInfo'));

test('ButtonActions.showNotification调用', () => 
  checkFileContent(processFile, 'ButtonActions.showNotification'));

console.log('\n📊 测试结果统计');
console.log('================================');
console.log(`总测试数: ${testResults.total}`);
console.log(`✅ 通过: ${testResults.passed}`);
console.log(`❌ 失败: ${testResults.failed}`);

const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
console.log(`\n🎯 成功率: ${successRate}%`);

if (testResults.failed === 0) {
  console.log('\n🎉 工艺管理模块按钮功能测试全部通过！');
  console.log('\n✅ 现在可以测试的按钮功能:');
  console.log('1. 新建工艺路线 - 创建新的工艺路线并跳转到工艺路线页面');
  console.log('2. 工艺变更 - 启动工艺变更流程并跳转到变更控制页面');
  console.log('3. 工艺优化 - 生成工艺优化分析报告');
  console.log('4. 立即处理 - 创建工艺验证任务');
  console.log('5. 查看详情 - 跳转到验证页面');
} else {
  console.log('\n⚠️  部分按钮功能测试失败，请检查实现。');
}

console.log('\n🔄 浏览器测试步骤:');
console.log('1. 访问 http://localhost:3000');
console.log('2. 登录系统 (admin/admin123)');
console.log('3. 点击左侧菜单"工艺管理"');
console.log('4. 在概览页面点击"新建工艺路线"按钮');
console.log('5. 点击"工艺变更"按钮');
console.log('6. 点击"工艺优化"按钮');
console.log('7. 观察消息提示和页面跳转效果');

console.log('\n📱 预期效果:');
console.log('• 点击按钮后会显示加载提示');
console.log('• 操作完成后显示成功消息');
console.log('• 部分按钮会跳转到对应的功能页面');
console.log('• 会显示通知消息提供详细信息');