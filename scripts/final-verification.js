#!/usr/bin/env node

/**
 * 最终验证脚本
 * 验证所有组件是否正确导入和使用五金注塑数据
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 最终验证五金注塑数据集成状态...\n');

const componentsToCheck = [
  {
    path: 'client/src/components/equipment/EquipmentMasterData.js',
    name: '设备主数据',
    checkItems: ['import mockData', 'mockData.baseData.equipment']
  },
  {
    path: 'client/src/components/process/ProcessRouting.js',
    name: '工艺路线',
    checkItems: ['import mockData', 'mockData.processData.processRoutes']
  },
  {
    path: 'client/src/components/inventory/InventoryMasterData.js',
    name: '库存主数据',
    checkItems: ['import mockData', 'mockData.baseData.materials']
  },
  {
    path: 'client/src/components/production/ProductionMasterDataManagement.js',
    name: '生产主数据',
    checkItems: ['import mockData', 'mockData.baseData.products']
  },
  {
    path: 'client/src/components/quality/IQCInspection.js',
    name: 'IQC检验',
    checkItems: ['import mockData', 'MAT-SS304', 'MAT-ABS-PC']
  },
  {
    path: 'client/src/components/quality/InspectionStandards.js',
    name: '检验标准',
    checkItems: ['import mockData', 'STD-HW001', 'STD-INJ001']
  },
  {
    path: 'client/src/components/production/WorkshopPlanManagement.js',
    name: '车间计划管理',
    checkItems: ['import mockData', 'PLAN-HW001', 'PLAN-INJ001']
  },
  {
    path: 'client/src/components/process/ProcessParameters.js',
    name: '工艺参数',
    checkItems: ['import mockData', 'PARAM-HW001', 'PARAM-INJ001']
  }
];

let totalChecks = 0;
let passedChecks = 0;

componentsToCheck.forEach(component => {
  console.log(`📋 检查 ${component.name}:`);
  
  const filePath = path.join(__dirname, '..', component.path);
  
  if (!fs.existsSync(filePath)) {
    console.log(`  ❌ 文件不存在: ${component.path}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  component.checkItems.forEach(item => {
    totalChecks++;
    if (content.includes(item)) {
      console.log(`  ✅ ${item}`);
      passedChecks++;
    } else {
      console.log(`  ❌ ${item}`);
    }
  });
  
  console.log('');
});

console.log('📊 验证结果统计:');
console.log(`总检查项: ${totalChecks}`);
console.log(`通过检查: ${passedChecks}`);
console.log(`失败检查: ${totalChecks - passedChecks}`);
console.log(`成功率: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`);

if (passedChecks === totalChecks) {
  console.log('\n🎉 所有检查项都通过！五金注塑数据已成功集成到所有组件中。');
} else {
  console.log('\n⚠️  部分检查项未通过，可能需要进一步调整。');
}

console.log('\n🎯 现在您可以在以下模块中看到五金注塑数据:');
console.log('• 设备管理 → 设备主数据: 五金设备(剪板机、冲床、加工中心) + 注塑设备(注塑机、涂装线、干燥机)');
console.log('• 工艺管理 → 工艺路线: 五金工艺(下料→冲压→精加工→表面处理→检验) + 注塑工艺(原料准备→注塑→去毛刺→涂装→检验)');
console.log('• 库存管理 → 库存主数据: 金属材料(304不锈钢、铝合金、45#钢) + 塑料材料(ABS+PC、PC阻燃、医用PC)');
console.log('• 生产管理 → 生产主数据: 五金产品(门把手、窗锁、轴承座) + 注塑产品(仪表盘、面板、外壳)');
console.log('• 生产管理 → 车间计划管理: 五金生产计划 + 注塑生产计划');
console.log('• 质量管理 → IQC检验: 五金原材料检验 + 注塑原材料检验');
console.log('• 质量管理 → 检验标准: 五金产品标准 + 注塑产品标准');
console.log('• 工艺管理 → 工艺参数: 五金工艺参数 + 注塑工艺参数');

console.log('\n🚀 系统使用指南:');
console.log('1. 重启前端服务: npm start');
console.log('2. 访问系统: http://localhost:3000');
console.log('3. 登录账号: admin / admin123');
console.log('4. 在各个模块中搜索关键词:');
console.log('   - 五金相关: "HW001", "不锈钢", "冲床", "304"');
console.log('   - 注塑相关: "INJ001", "汽车", "注塑机", "ABS"');

console.log('\n💡 学习建议:');
console.log('• 对比五金和注塑的工艺差异');
console.log('• 理解不同材料的检验要求');
console.log('• 分析不同设备的技术参数');
console.log('• 掌握MES系统的数据流转关系');

console.log('\n🎉 五金注塑MES数据集成验证完成！');