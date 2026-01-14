#!/usr/bin/env node

/**
 * 五金注塑MES数据导入脚本
 * 将真实的五金和注塑制造数据导入到MES系统中
 */

const fs = require('fs');
const path = require('path');

console.log('🏭 开始导入五金注塑MES数据...\n');

// 读取现有的mockData.js文件
const mockDataPath = path.join(__dirname, '../client/src/data/mockData.js');
const hardwareDataPath = path.join(__dirname, '../client/src/data/hardwareInjectionMockData.js');

try {
  // 检查文件是否存在
  if (!fs.existsSync(mockDataPath)) {
    console.log('❌ mockData.js文件不存在');
    process.exit(1);
  }

  if (!fs.existsSync(hardwareDataPath)) {
    console.log('❌ hardwareInjectionMockData.js文件不存在');
    process.exit(1);
  }

  // 读取现有数据
  let mockDataContent = fs.readFileSync(mockDataPath, 'utf8');
  
  // 在文件开头添加导入语句
  const importStatement = `import hardwareInjectionData from './hardwareInjectionMockData.js';\n`;
  
  if (!mockDataContent.includes('hardwareInjectionMockData')) {
    mockDataContent = importStatement + mockDataContent;
  }

  // 查找并更新各个数据部分
  console.log('📝 更新产品主数据...');
  
  // 更新产品数据 - 在现有产品数据后添加五金注塑产品
  const productDataRegex = /(export const products = \[[\s\S]*?\];)/;
  if (productDataRegex.test(mockDataContent)) {
    mockDataContent = mockDataContent.replace(productDataRegex, (match) => {
      // 移除最后的 ];
      const withoutClosing = match.slice(0, -2);
      return withoutClosing + `,
  // 五金产品
  ...hardwareInjectionData.productMasterData.hardware.map(product => ({
    key: product.productCode,
    productCode: product.productCode,
    productName: product.productName,
    category: product.category,
    specification: product.specification,
    unit: product.unit,
    standardPrice: product.standardPrice,
    customer: product.customerName,
    status: product.status === 'active' ? '启用' : '停用',
    createTime: '2024-12-25 10:00:00',
    remark: \`\${product.material} - \${product.surfaceTreatment}\`
  })),
  // 注塑产品  
  ...hardwareInjectionData.productMasterData.injection.map(product => ({
    key: product.productCode,
    productCode: product.productCode,
    productName: product.productName,
    category: product.category,
    specification: product.specification,
    unit: product.unit,
    standardPrice: product.standardPrice,
    customer: product.customerName,
    status: product.status === 'active' ? '启用' : '停用',
    createTime: '2024-12-25 10:00:00',
    remark: \`\${product.material} - \${product.surfaceTreatment}\`
  }))
];`;
    });
  }

  console.log('🔧 更新工艺路线数据...');
  
  // 更新工艺路线数据
  const processRoutesRegex = /(export const processRoutes = \[[\s\S]*?\];)/;
  if (processRoutesRegex.test(mockDataContent)) {
    mockDataContent = mockDataContent.replace(processRoutesRegex, (match) => {
      const withoutClosing = match.slice(0, -2);
      return withoutClosing + `,
  // 五金工艺路线
  {
    key: 'RT-HW001',
    routeCode: 'RT-HW001',
    routeName: '不锈钢门把手工艺路线',
    productCode: 'HW-001',
    productName: '不锈钢门把手',
    version: 'V2.1',
    status: '启用',
    operationCount: 5,
    standardTime: 35,
    createTime: '2024-12-25 09:00:00',
    operations: hardwareInjectionData.processRoutes['HW-001'].operations
  },
  // 注塑工艺路线
  {
    key: 'RT-INJ001',
    routeCode: 'RT-INJ001', 
    routeName: '汽车仪表盘外壳注塑工艺',
    productCode: 'INJ-001',
    productName: '汽车仪表盘外壳',
    version: 'V4.2',
    status: '启用',
    operationCount: 5,
    standardTime: 258.5,
    createTime: '2024-12-25 09:00:00',
    operations: hardwareInjectionData.processRoutes['INJ-001'].operations
  }
];`;
    });
  }

  console.log('⚙️ 更新设备主数据...');
  
  // 更新设备数据
  const equipmentRegex = /(export const equipment = \[[\s\S]*?\];)/;
  if (equipmentRegex.test(mockDataContent)) {
    mockDataContent = mockDataContent.replace(equipmentRegex, (match) => {
      const withoutClosing = match.slice(0, -2);
      return withoutClosing + `,
  // 五金设备
  ...hardwareInjectionData.equipmentMasterData.filter(eq => eq.workshop === '五金车间').map(equipment => ({
    key: equipment.equipmentCode,
    equipmentCode: equipment.equipmentCode,
    equipmentName: equipment.equipmentName,
    model: equipment.model,
    manufacturer: equipment.manufacturer,
    workshop: equipment.workshop,
    workCenter: equipment.workCenter,
    status: equipment.status === 'running' ? '运行中' : equipment.status === 'maintenance' ? '维护中' : '停机',
    installDate: equipment.installDate,
    lastMaintenance: equipment.lastMaintenance,
    nextMaintenance: equipment.nextMaintenance,
    specifications: equipment.specifications
  })),
  // 注塑设备
  ...hardwareInjectionData.equipmentMasterData.filter(eq => eq.workshop === '注塑车间').map(equipment => ({
    key: equipment.equipmentCode,
    equipmentCode: equipment.equipmentCode,
    equipmentName: equipment.equipmentName,
    model: equipment.model,
    manufacturer: equipment.manufacturer,
    workshop: equipment.workshop,
    workCenter: equipment.workCenter,
    status: equipment.status === 'running' ? '运行中' : equipment.status === 'maintenance' ? '维护中' : '停机',
    installDate: equipment.installDate,
    lastMaintenance: equipment.lastMaintenance,
    nextMaintenance: equipment.nextMaintenance,
    specifications: equipment.specifications
  }))
];`;
    });
  }

  console.log('📦 更新库存数据...');
  
  // 更新库存数据
  const inventoryRegex = /(export const inventory = \[[\s\S]*?\];)/;
  if (inventoryRegex.test(mockDataContent)) {
    mockDataContent = mockDataContent.replace(inventoryRegex, (match) => {
      const withoutClosing = match.slice(0, -2);
      return withoutClosing + `,
  // 五金注塑原材料
  ...hardwareInjectionData.materialInventory.map(material => ({
    key: material.materialCode,
    materialCode: material.materialCode,
    materialName: material.materialName,
    specification: material.specification,
    category: material.category,
    unit: material.unit,
    supplier: material.supplier,
    unitPrice: material.unitPrice,
    currentStock: material.currentStock,
    safetyStock: material.safetyStock,
    maxStock: material.maxStock,
    location: material.location,
    status: material.qualityStatus === 'qualified' ? '合格' : '待检',
    lastInbound: material.lastInbound,
    inboundQty: material.inboundQty
  }))
];`;
    });
  }

  console.log('📊 更新生产计划数据...');
  
  // 更新生产计划数据
  const productionPlansRegex = /(export const productionPlans = \[[\s\S]*?\];)/;
  if (productionPlansRegex.test(mockDataContent)) {
    mockDataContent = mockDataContent.replace(productionPlansRegex, (match) => {
      const withoutClosing = match.slice(0, -2);
      return withoutClosing + `,
  // 五金注塑生产计划
  ...hardwareInjectionData.productionPlans.map(plan => ({
    key: plan.planCode,
    planCode: plan.planCode,
    productCode: plan.productCode,
    productName: plan.productName,
    customerOrder: plan.customerOrder,
    planQty: plan.planQty,
    completedQty: plan.completedQty,
    planStartDate: plan.planStartDate,
    planEndDate: plan.planEndDate,
    actualStartDate: plan.actualStartDate,
    priority: plan.priority === 'high' ? '高' : plan.priority === 'medium' ? '中' : '低',
    status: plan.status === 'in_progress' ? '进行中' : plan.status === 'planned' ? '计划中' : '已完成',
    workshop: plan.workshop,
    productionLine: plan.productionLine,
    planManager: plan.planManager,
    progress: Math.round((plan.completedQty / plan.planQty) * 100)
  }))
];`;
    });
  }

  console.log('🔍 更新质量检验数据...');
  
  // 更新质量检验数据
  const qualityInspectionsRegex = /(export const qualityInspections = \[[\s\S]*?\];)/;
  if (qualityInspectionsRegex.test(mockDataContent)) {
    mockDataContent = mockDataContent.replace(qualityInspectionsRegex, (match) => {
      const withoutClosing = match.slice(0, -2);
      return withoutClosing + `,
  // 五金注塑质量检验
  ...hardwareInjectionData.qualityInspections.map(inspection => ({
    key: inspection.inspectionCode,
    inspectionCode: inspection.inspectionCode,
    inspectionType: inspection.inspectionType,
    materialCode: inspection.materialCode || inspection.productCode,
    materialName: inspection.materialName || inspection.productName,
    batchNo: inspection.batchNo || inspection.workOrder,
    supplier: inspection.supplier || '内部生产',
    inspectionDate: inspection.inspectionDate,
    inspector: inspection.inspector,
    sampleQty: inspection.sampleQty,
    totalQty: inspection.totalQty,
    result: inspection.result === 'qualified' ? '合格' : '不合格',
    defectRate: inspection.defectRate,
    inspectionItems: inspection.inspectionItems
  }))
];`;
    });
  }

  console.log('📋 更新工作报告数据...');
  
  // 更新工作报告数据
  const workReportsRegex = /(export const workReports = \[[\s\S]*?\];)/;
  if (workReportsRegex.test(mockDataContent)) {
    mockDataContent = mockDataContent.replace(workReportsRegex, (match) => {
      const withoutClosing = match.slice(0, -2);
      return withoutClosing + `,
  // 五金注塑工作报告
  ...hardwareInjectionData.workReports.map(report => ({
    key: report.reportCode,
    reportCode: report.reportCode,
    workOrder: report.workOrder,
    productCode: report.productCode,
    operation: report.operation,
    operator: report.operator,
    workCenter: report.workCenter,
    equipment: report.equipment,
    reportDate: report.reportDate,
    shift: report.shift,
    startTime: report.startTime,
    endTime: report.endTime,
    planQty: report.planQty,
    completedQty: report.completedQty,
    qualifiedQty: report.qualifiedQty,
    defectQty: report.defectQty,
    scrapQty: report.scrapQty,
    efficiency: report.efficiency,
    defectRate: report.defectRate,
    defectReasons: report.defectReasons
  }))
];`;
    });
  }

  // 写入更新后的文件
  fs.writeFileSync(mockDataPath, mockDataContent);
  
  console.log('✅ 数据导入完成！\n');
  
  console.log('📈 导入数据统计:');
  console.log(`• 产品数据: ${6}个 (3个五金产品 + 3个注塑产品)`);
  console.log(`• 工艺路线: ${2}条 (五金工艺 + 注塑工艺)`);
  console.log(`• 设备数据: ${4}台 (2台五金设备 + 2台注塑设备)`);
  console.log(`• 原材料: ${4}种 (2种金属材料 + 2种塑料材料)`);
  console.log(`• 生产计划: ${2}个`);
  console.log(`• 质量检验: ${3}项 (IQC + IPQC + FQC)`);
  console.log(`• 工作报告: ${2}份`);
  
  console.log('\n🎯 业务场景覆盖:');
  console.log('• 五金制造: 不锈钢门把手、铝合金窗锁、精密轴承座');
  console.log('• 注塑制造: 汽车仪表盘、家电面板、医疗器械外壳');
  console.log('• 工艺流程: 下料→冲压→精加工→表面处理→检验包装');
  console.log('• 注塑流程: 原料准备→注塑成型→去毛刺→UV涂装→最终检验');
  console.log('• 质量管控: IQC来料检验→IPQC过程检验→FQC成品检验');
  console.log('• 设备管理: 预防性维护、日常保养、OEE监控');
  console.log('• 库存管理: 原材料入库、生产领料、安全库存');
  
  console.log('\n🔄 系统测试建议:');
  console.log('1. 重启前端服务: npm start');
  console.log('2. 登录系统查看各模块数据');
  console.log('3. 测试工艺路线: 工艺管理 → 工艺路线');
  console.log('4. 查看生产计划: 生产管理 → 车间计划管理');
  console.log('5. 检查设备状态: 设备管理 → 设备主数据');
  console.log('6. 验证质量数据: 质量管理 → 各检验模块');
  console.log('7. 查看库存状态: 库存管理 → 库存主数据');
  console.log('8. 分析报表数据: 报表分析 → 各类报表');

} catch (error) {
  console.error('❌ 数据导入失败:', error.message);
  process.exit(1);
}

console.log('\n🎉 五金注塑MES数据导入成功完成！');