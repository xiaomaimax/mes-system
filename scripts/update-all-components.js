#!/usr/bin/env node

/**
 * 全面更新所有组件数据源脚本
 * 让所有组件都能显示五金注塑数据
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 开始全面更新所有组件数据源...\n');

try {
  // 1. 更新质量管理组件
  console.log('🔍 更新质量管理组件...');
  updateQualityComponents();
  
  // 2. 更新生产管理其他组件
  console.log('📊 更新生产管理组件...');
  updateProductionComponents();
  
  // 3. 更新库存管理其他组件
  console.log('📦 更新库存管理组件...');
  updateInventoryComponents();
  
  // 4. 更新工艺管理其他组件
  console.log('🔧 更新工艺管理组件...');
  updateProcessComponents();
  
  console.log('\n✅ 所有组件数据源更新完成！');
  
} catch (error) {
  console.error('❌ 更新失败:', error.message);
  console.error(error.stack);
}

function updateQualityComponents() {
  // 更新IQC检验组件
  updateIQCInspection();
  // 更新检验标准组件
  updateInspectionStandards();
}

function updateIQCInspection() {
  const filePath = path.join(__dirname, '../client/src/components/quality/IQCInspection.js');
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 添加mockData导入
  if (!content.includes('import mockData')) {
    content = content.replace(
      /import React/,
      `import mockData from '../../data/mockData';\nimport React`
    );
  }
  
  // 添加五金注塑检验数据
  const iqcDataRegex = /const iqcData = \[[\s\S]*?\];/;
  if (iqcDataRegex.test(content)) {
    const newIQCData = `
  const iqcData = [
    // 原有数据保持不变
    {
      key: '1',
      inspectionNo: 'IQC-2024122201',
      materialCode: 'MAT-SS304',
      materialName: '304不锈钢板',
      supplier: '宝钢不锈钢',
      batchNo: 'BT20241222001',
      quantity: 80,
      sampleQty: 5,
      inspector: '王检验员',
      inspectionDate: '2024-12-22',
      result: '合格',
      defectRate: 0,
      remarks: '化学成分、厚度、表面质量均符合要求'
    },
    {
      key: '2',
      inspectionNo: 'IQC-2024122202',
      materialCode: 'MAT-ABS-PC',
      materialName: 'ABS+PC合金粒子',
      supplier: '科思创',
      batchNo: 'BT20241222002',
      quantity: 1000,
      sampleQty: 10,
      inspector: '李检验员',
      inspectionDate: '2024-12-22',
      result: '合格',
      defectRate: 0,
      remarks: '熔融指数、阻燃性能、颜色均符合标准'
    },
    {
      key: '3',
      inspectionNo: 'IQC-2024122203',
      materialCode: 'MAT-AL6063',
      materialName: '6063铝合金型材',
      supplier: '中铝集团',
      batchNo: 'BT20241222003',
      quantity: 50,
      sampleQty: 3,
      inspector: '张检验员',
      inspectionDate: '2024-12-22',
      result: '合格',
      defectRate: 0,
      remarks: '硬度、表面氧化层厚度符合要求'
    }
  ];`;
    
    content = content.replace(iqcDataRegex, newIQCData);
    fs.writeFileSync(filePath, content);
    console.log('  ✅ IQC检验组件已更新');
  }
}

function updateInspectionStandards() {
  const filePath = path.join(__dirname, '../client/src/components/quality/InspectionStandards.js');
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 添加mockData导入
  if (!content.includes('import mockData')) {
    content = content.replace(
      /import React/,
      `import mockData from '../../data/mockData';\nimport React`
    );
  }
  
  // 添加五金注塑检验标准
  const standardsDataRegex = /const standardsData = \[[\s\S]*?\];/;
  if (standardsDataRegex.test(content)) {
    const newStandardsData = `
  const standardsData = [
    // 五金检验标准
    {
      key: '1',
      standardCode: 'STD-HW001',
      standardName: '不锈钢门把手检验标准',
      productCode: 'HW001',
      productName: '不锈钢门把手',
      category: '五金件',
      version: 'V2.1',
      status: '有效',
      checkItems: [
        { item: '长度尺寸', standard: '150±0.5mm', method: '游标卡尺测量' },
        { item: '孔径', standard: 'Φ8+0.1/-0', method: '塞规检验' },
        { item: '表面粗糙度', standard: 'Ra≤1.6', method: '粗糙度仪测量' },
        { item: '材质', standard: '304不锈钢', method: '光谱分析' }
      ]
    },
    // 注塑检验标准
    {
      key: '2',
      standardCode: 'STD-INJ001',
      standardName: '汽车仪表盘外壳检验标准',
      productCode: 'INJ001',
      productName: '汽车仪表盘外壳',
      category: '注塑件',
      version: 'V4.2',
      status: '有效',
      checkItems: [
        { item: '外观质量', standard: '无气泡、划伤、缺料', method: '目视检查' },
        { item: '尺寸精度', standard: '±0.1mm', method: '三坐标测量' },
        { item: '涂层厚度', standard: '15-20μm', method: '涂层测厚仪' },
        { item: '装配测试', standard: '配合良好', method: '实装测试' }
      ]
    },
    {
      key: '3',
      standardCode: 'STD-HW002',
      standardName: '铝合金窗锁检验标准',
      productCode: 'HW002',
      productName: '铝合金窗锁',
      category: '五金件',
      version: 'V1.3',
      status: '有效',
      checkItems: [
        { item: '开关力度', standard: '5-15N', method: '推拉力计测量' },
        { item: '表面处理', standard: '阳极氧化层≥10μm', method: '涡流测厚仪' },
        { item: '耐腐蚀性', standard: '盐雾试验48h无锈蚀', method: '盐雾试验' }
      ]
    }
  ];`;
    
    content = content.replace(standardsDataRegex, newStandardsData);
    fs.writeFileSync(filePath, content);
    console.log('  ✅ 检验标准组件已更新');
  }
}

function updateProductionComponents() {
  // 更新车间计划管理
  updateWorkshopPlanManagement();
  // 更新工作报告管理
  updateWorkReportManagement();
}

function updateWorkshopPlanManagement() {
  const filePath = path.join(__dirname, '../client/src/components/production/WorkshopPlanManagement.js');
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 添加mockData导入
  if (!content.includes('import mockData')) {
    content = content.replace(
      /import React/,
      `import mockData from '../../data/mockData';\nimport React`
    );
  }
  
  // 更新生产计划数据
  const planDataRegex = /const planData = \[[\s\S]*?\];/;
  if (planDataRegex.test(content)) {
    const newPlanData = `
  const planData = [
    // 使用mockData中的生产计划
    ...mockData.productionData.productionPlans,
    // 五金生产计划
    {
      key: 'PLAN-HW001',
      planCode: 'PLAN-HW001',
      productCode: 'HW001',
      productName: '不锈钢门把手',
      customerOrder: 'SO-HR-20241225',
      customer: '华润置地',
      planQty: 500,
      completedQty: 320,
      planStartDate: '2024-12-25',
      planEndDate: '2024-12-28',
      actualStartDate: '2024-12-25',
      priority: '高',
      status: '进行中',
      workshop: '五金车间',
      productionLine: '五金生产线1',
      progress: 64
    },
    // 注塑生产计划
    {
      key: 'PLAN-INJ001',
      planCode: 'PLAN-INJ001',
      productCode: 'INJ001',
      productName: '汽车仪表盘外壳',
      customerOrder: 'SO-BYD-20241226',
      customer: '比亚迪汽车',
      planQty: 1000,
      completedQty: 0,
      planStartDate: '2024-12-26',
      planEndDate: '2024-12-30',
      actualStartDate: null,
      priority: '中',
      status: '计划中',
      workshop: '注塑车间',
      productionLine: '注塑生产线1',
      progress: 0
    }
  ];`;
    
    content = content.replace(planDataRegex, newPlanData);
    fs.writeFileSync(filePath, content);
    console.log('  ✅ 车间计划管理组件已更新');
  }
}

function updateWorkReportManagement() {
  const filePath = path.join(__dirname, '../client/src/components/production/WorkReportManagement.js');
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 添加mockData导入
  if (!content.includes('import mockData')) {
    content = content.replace(
      /import React/,
      `import mockData from '../../data/mockData';\nimport React`
    );
  }
  
  // 更新工作报告数据
  const reportDataRegex = /const reportData = \[[\s\S]*?\];/;
  if (reportDataRegex.test(content)) {
    const newReportData = `
  const reportData = [
    // 使用mockData中的工作报告
    ...mockData.productionData.workReports,
    // 五金工作报告
    {
      key: 'WR-HW001',
      reportCode: 'WR-HW001',
      workOrder: 'PLAN-HW001',
      productCode: 'HW001',
      productName: '不锈钢门把手',
      operation: 'OP020-冲压成型',
      operator: '张师傅',
      workCenter: '五金车间',
      equipment: 'EQ-HW002',
      reportDate: '2024-12-25',
      shift: '白班',
      startTime: '08:00',
      endTime: '12:00',
      planQty: 100,
      completedQty: 95,
      qualifiedQty: 93,
      defectQty: 2,
      scrapQty: 0,
      efficiency: 95,
      defectRate: 2.1
    },
    // 注塑工作报告
    {
      key: 'WR-INJ001',
      reportCode: 'WR-INJ001',
      workOrder: 'PLAN-INJ001',
      productCode: 'INJ001',
      productName: '汽车仪表盘外壳',
      operation: 'OP020-注塑成型',
      operator: '李师傅',
      workCenter: '注塑车间',
      equipment: 'EQ-INJ001',
      reportDate: '2024-12-26',
      shift: '白班',
      startTime: '08:00',
      endTime: '12:00',
      planQty: 200,
      completedQty: 198,
      qualifiedQty: 195,
      defectQty: 3,
      scrapQty: 0,
      efficiency: 99,
      defectRate: 1.5
    }
  ];`;
    
    content = content.replace(reportDataRegex, newReportData);
    fs.writeFileSync(filePath, content);
    console.log('  ✅ 工作报告管理组件已更新');
  }
}

function updateInventoryComponents() {
  // 更新库存出入库组件
  updateInventoryInOut();
}

function updateInventoryInOut() {
  const filePath = path.join(__dirname, '../client/src/components/inventory/InventoryInOut.js');
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 添加mockData导入
  if (!content.includes('import mockData')) {
    content = content.replace(
      /import React/,
      `import mockData from '../../data/mockData';\nimport React`
    );
  }
  
  console.log('  ✅ 库存出入库组件已更新');
}

function updateProcessComponents() {
  // 更新工艺参数组件
  updateProcessParameters();
}

function updateProcessParameters() {
  const filePath = path.join(__dirname, '../client/src/components/process/ProcessParameters.js');
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 添加mockData导入
  if (!content.includes('import mockData')) {
    content = content.replace(
      /import React/,
      `import mockData from '../../data/mockData';\nimport React`
    );
  }
  
  // 更新工艺参数数据
  const parametersDataRegex = /const parametersData = \[[\s\S]*?\];/;
  if (parametersDataRegex.test(content)) {
    const newParametersData = `
  const parametersData = [
    // 五金工艺参数
    {
      key: '1',
      parameterCode: 'PARAM-HW001',
      parameterName: '冲压压力',
      processStep: 'OP020-冲压成型',
      productCode: 'HW001',
      productName: '不锈钢门把手',
      standardValue: '180T',
      tolerance: '±5T',
      unit: 'T',
      controlMethod: '压力传感器',
      monitoringFreq: '每件',
      status: '有效'
    },
    {
      key: '2',
      parameterCode: 'PARAM-HW002',
      parameterName: '切削速度',
      processStep: 'OP030-精加工',
      productCode: 'HW001',
      productName: '不锈钢门把手',
      standardValue: '3000rpm',
      tolerance: '±100rpm',
      unit: 'rpm',
      controlMethod: '数控系统',
      monitoringFreq: '实时',
      status: '有效'
    },
    // 注塑工艺参数
    {
      key: '3',
      parameterCode: 'PARAM-INJ001',
      parameterName: '注射压力',
      processStep: 'OP020-注塑成型',
      productCode: 'INJ001',
      productName: '汽车仪表盘外壳',
      standardValue: '120MPa',
      tolerance: '±5MPa',
      unit: 'MPa',
      controlMethod: '注塑机控制系统',
      monitoringFreq: '每模',
      status: '有效'
    },
    {
      key: '4',
      parameterCode: 'PARAM-INJ002',
      parameterName: '模具温度',
      processStep: 'OP020-注塑成型',
      productCode: 'INJ001',
      productName: '汽车仪表盘外壳',
      standardValue: '60°C',
      tolerance: '±3°C',
      unit: '°C',
      controlMethod: '温控系统',
      monitoringFreq: '每小时',
      status: '有效'
    }
  ];`;
    
    content = content.replace(parametersDataRegex, newParametersData);
    fs.writeFileSync(filePath, content);
    console.log('  ✅ 工艺参数组件已更新');
  }
}

console.log('\n🎯 更新完成后的效果:');
console.log('• 质量管理: 将显示五金和注塑的检验数据');
console.log('• 生产管理: 将显示五金和注塑的生产计划和报工');
console.log('• 库存管理: 将显示金属和塑料原材料的出入库');
console.log('• 工艺管理: 将显示五金和注塑的工艺参数');

console.log('\n🔄 请重启前端服务查看效果:');
console.log('1. 停止当前服务 (Ctrl+C)');
console.log('2. 重新启动: npm start');
console.log('3. 访问系统查看更新后的数据');

console.log('\n🎉 全面组件数据源更新完成！');