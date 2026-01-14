#!/usr/bin/env node

/**
 * 诊断JavaScript错误
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 诊断JavaScript错误...\n');

// 1. 检查所有相关组件的语法
const componentsToCheck = [
  'client/src/data/mockData.js',
  'client/src/components/process/ProcessRouting.js',
  'client/src/components/production/WorkshopPlanManagement.js',
  'client/src/components/SimpleProduction.js',
  'client/src/components/SimpleProcess.js'
];

console.log('📋 检查组件语法...');
componentsToCheck.forEach(component => {
  try {
    const { execSync } = require('child_process');
    execSync(`node -c ${component}`, { stdio: 'pipe' });
    console.log(`✅ ${component}`);
  } catch (error) {
    console.log(`❌ ${component}: ${error.message}`);
  }
});

// 2. 检查mockData结构
console.log('\n📋 检查mockData结构...');
try {
  const mockDataPath = path.join(__dirname, '../client/src/data/mockData.js');
  const content = fs.readFileSync(mockDataPath, 'utf8');
  
  // 检查processData导出
  if (content.includes('export const processData')) {
    console.log('✅ processData 导出存在');
  } else {
    console.log('❌ processData 导出缺失');
  }
  
  // 检查processRoutes
  if (content.includes('processRoutes: [')) {
    console.log('✅ processRoutes 数组存在');
  } else {
    console.log('❌ processRoutes 数组缺失');
  }
  
  // 检查steps结构
  const stepsMatches = content.match(/steps: \[[\s\S]*?\]/g);
  if (stepsMatches && stepsMatches.length >= 3) {
    console.log(`✅ 找到 ${stepsMatches.length} 个steps数组`);
    
    // 检查每个steps数组是否正确闭合
    stepsMatches.forEach((match, index) => {
      const openBrackets = (match.match(/\[/g) || []).length;
      const closeBrackets = (match.match(/\]/g) || []).length;
      if (openBrackets === closeBrackets) {
        console.log(`✅ steps数组 ${index + 1} 括号匹配`);
      } else {
        console.log(`❌ steps数组 ${index + 1} 括号不匹配: [ ${openBrackets} vs ] ${closeBrackets}`);
      }
    });
  } else {
    console.log('❌ steps数组结构有问题');
  }
  
  // 检查stepNo字段
  const stepNoCount = (content.match(/stepNo:/g) || []).length;
  console.log(`✅ 找到 ${stepNoCount} 个stepNo字段`);
  
} catch (error) {
  console.log('❌ mockData检查失败:', error.message);
}

// 3. 检查ProcessRouting组件的安全性
console.log('\n📋 检查ProcessRouting组件安全性...');
try {
  const processRoutingPath = path.join(__dirname, '../client/src/components/process/ProcessRouting.js');
  const content = fs.readFileSync(processRoutingPath, 'utf8');
  
  if (content.includes('step.stepNo || (index + 1) * 10')) {
    console.log('✅ ProcessRouting 已添加stepNo安全检查');
  } else {
    console.log('❌ ProcessRouting 缺少stepNo安全检查');
  }
  
  if (content.includes('.toString().padStart(3')) {
    console.log('✅ ProcessRouting 使用了toString()方法');
    
    // 检查是否有安全的toString调用
    if (content.includes('(step.stepNo || (index + 1) * 10).toString()')) {
      console.log('✅ toString()调用是安全的');
    } else {
      console.log('⚠️  toString()调用可能不安全');
    }
  }
  
} catch (error) {
  console.log('❌ ProcessRouting检查失败:', error.message);
}

// 4. 生成修复建议
console.log('\n💡 修复建议:');
console.log('1. 如果语法检查都通过，问题可能是浏览器缓存');
console.log('2. 停止开发服务器 (Ctrl+C)');
console.log('3. 清除浏览器缓存 (Ctrl+Shift+R 或开发者工具中禁用缓存)');
console.log('4. 重启开发服务器: npm start');
console.log('5. 如果问题仍然存在，请提供完整的浏览器控制台错误信息');

console.log('\n🔧 紧急修复方案:');
console.log('如果问题持续存在，可以尝试:');
console.log('1. 删除 node_modules/.cache 目录');
console.log('2. 删除 client/node_modules/.cache 目录');
console.log('3. 重新安装依赖: npm install');
console.log('4. 重启开发服务器');

console.log('\n🎉 诊断完成！');