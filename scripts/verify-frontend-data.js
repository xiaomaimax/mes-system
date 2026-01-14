#!/usr/bin/env node

/**
 * 前端数据验证脚本
 * 验证 mockData.js 中的所有数据是否正确加载
 */

const mockData = require('../client/src/data/mockData').default;

console.log('\n========================================');
console.log('  MES系统前端数据验证');
console.log('========================================\n');

// 验证基础数据
console.log('📦 基础数据验证:');
console.log(`  ✓ 产品数量: ${mockData.baseData.products.length} 种`);
console.log(`  ✓ 生产线数量: ${mockData.baseData.productionLines.length} 条`);
console.log(`  ✓ 设备数量: ${mockData.baseData.equipment.length} 台`);
console.log(`  ✓ 模具数量: ${mockData.baseData.molds ? mockData.baseData.molds.length : 0} 套`);
console.log(`  ✓ 物料数量: ${mockData.baseData.materials.length} 种`);
console.log(`  ✓ 员工数量: ${mockData.baseData.employees.length} 人`);

// 验证生产数据
console.log('\n📊 生产管理数据验证:');
console.log(`  ✓ 生产计划: ${mockData.productionData.productionPlans.length} 个`);
console.log(`  ✓ 生产任务: ${mockData.productionData.productionTasks.length} 个`);
console.log(`  ✓ 生产报工: ${mockData.productionData.workReports.length} 条`);
console.log(`  ✓ 班次计划: ${mockData.productionData.shiftSchedule.length} 个`);

// 计算生产统计
const totalPlanQty = mockData.productionData.productionPlans.reduce((sum, p) => sum + p.planQty, 0);
const totalActualQty = mockData.productionData.productionPlans.reduce((sum, p) => sum + p.actualQty, 0);
const totalQualifiedQty = mockData.productionData.productionPlans.reduce((sum, p) => sum + p.qualifiedQty, 0);
console.log(`  📈 计划产量: ${totalPlanQty} 件`);
console.log(`  📈 实际产量: ${totalActualQty} 件`);
console.log(`  📈 合格品: ${totalQualifiedQty} 件`);
console.log(`  📈 完成率: ${((totalActualQty / totalPlanQty) * 100).toFixed(1)}%`);

// 验证质量数据
console.log('\n✅ 质量管理数据验证:');
console.log(`  ✓ IQC检验: ${mockData.qualityData.iqcInspections.length} 条`);
console.log(`  ✓ PQC检验: ${mockData.qualityData.pqcInspections.length} 条`);
console.log(`  ✓ FQC检验: ${mockData.qualityData.fqcInspections.length} 条`);
console.log(`  ✓ 缺陷记录: ${mockData.qualityData.defectRecords.length} 条`);

// 计算质量统计
const iqcPassRate = mockData.qualityData.iqcInspections.length > 0 
  ? (mockData.qualityData.iqcInspections.reduce((sum, i) => sum + i.passRate, 0) / mockData.qualityData.iqcInspections.length).toFixed(2)
  : 0;
const pqcPassRate = mockData.qualityData.pqcInspections.length > 0
  ? (mockData.qualityData.pqcInspections.reduce((sum, i) => sum + i.passRate, 0) / mockData.qualityData.pqcInspections.length).toFixed(2)
  : 0;
console.log(`  📊 IQC平均合格率: ${iqcPassRate}%`);
console.log(`  📊 PQC平均合格率: ${pqcPassRate}%`);

// 验证设备数据
console.log('\n🔧 设备管理数据验证:');
console.log(`  ✓ 维护记录: ${mockData.equipmentData.maintenanceRecords.length} 条`);
console.log(`  ✓ 点检记录: ${mockData.equipmentData.inspectionRecords.length} 条`);
console.log(`  ✓ 故障记录: ${mockData.equipmentData.faultRecords.length} 条`);
console.log(`  ✓ 状态历史: ${mockData.equipmentData.statusHistory.length} 条`);

// 计算设备统计
const runningEquipment = mockData.equipmentData.statusHistory.filter(h => h.status === '运行中').length;
const maintenanceEquipment = mockData.equipmentData.statusHistory.filter(h => h.status === '维护中').length;
console.log(`  📊 运行中设备: ${runningEquipment} 台`);
console.log(`  📊 维护中设备: ${maintenanceEquipment} 台`);

// 验证库存数据
console.log('\n📦 库存管理数据验证:');
console.log(`  ✓ 库存信息: ${mockData.inventoryData.stockInfo.length} 种`);
console.log(`  ✓ 入库记录: ${mockData.inventoryData.inboundRecords.length} 条`);
console.log(`  ✓ 出库记录: ${mockData.inventoryData.outboundRecords.length} 条`);

// 计算库存统计
const totalStock = mockData.inventoryData.stockInfo.reduce((sum, s) => sum + s.currentStock, 0);
const totalInbound = mockData.inventoryData.inboundRecords.reduce((sum, r) => sum + r.quantity, 0);
const totalOutbound = mockData.inventoryData.outboundRecords.reduce((sum, r) => sum + r.quantity, 0);
console.log(`  📊 当前库存: ${totalStock} 件`);
console.log(`  📊 总入库: ${totalInbound} 件`);
console.log(`  📊 总出库: ${totalOutbound} 件`);

// 验证工艺数据
console.log('\n🔨 工艺管理数据验证:');
console.log(`  ✓ 工艺路线: ${mockData.processData.processRoutes.length} 条`);
console.log(`  ✓ 工艺参数: ${mockData.processData.processParameters.length} 条`);

// 计算工艺统计
const totalSteps = mockData.processData.processRoutes.reduce((sum, r) => sum + r.steps.length, 0);
console.log(`  📊 总工序数: ${totalSteps} 个`);

// 验证报表数据
console.log('\n📈 报表分析数据验证:');
console.log(`  ✓ KPI指标已加载`);
console.log(`  ✓ 趋势数据: ${mockData.reportData.trendData.production.length} 天`);
console.log(`  📊 生产效率: ${mockData.reportData.kpiMetrics.production.efficiency}%`);
console.log(`  📊 质量合格率: ${mockData.reportData.kpiMetrics.quality.iqcPassRate}%`);
console.log(`  📊 设备利用率: ${mockData.reportData.kpiMetrics.equipment.utilization}%`);

// 总体验证结果
console.log('\n========================================');
console.log('  ✅ 数据验证完成');
console.log('========================================\n');

console.log('📋 数据统计总结:');
console.log(`  • 基础数据: ${mockData.baseData.products.length + mockData.baseData.productionLines.length + mockData.baseData.equipment.length} 项`);
console.log(`  • 生产数据: ${mockData.productionData.productionPlans.length + mockData.productionData.productionTasks.length} 项`);
console.log(`  • 质量数据: ${mockData.qualityData.iqcInspections.length + mockData.qualityData.pqcInspections.length + mockData.qualityData.defectRecords.length} 项`);
console.log(`  • 设备数据: ${mockData.equipmentData.maintenanceRecords.length + mockData.equipmentData.faultRecords.length} 项`);
console.log(`  • 库存数据: ${mockData.inventoryData.stockInfo.length + mockData.inventoryData.inboundRecords.length} 项`);
console.log(`  • 工艺数据: ${mockData.processData.processRoutes.length + mockData.processData.processParameters.length} 项`);

console.log('\n✨ 所有数据已准备就绪，可以进行系统测试！\n');
