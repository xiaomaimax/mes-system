#!/usr/bin/env node

/**
 * 五金注塑数据集成脚本
 * 直接将五金注塑数据集成到现有的mockData.js中
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 开始集成五金注塑数据到MES系统...\n');

// 五金注塑数据
const hardwareInjectionData = {
  // 五金产品数据
  hardwareProducts: [
    {
      id: 'HW001',
      name: '不锈钢门把手',
      model: 'DH-SS304-150',
      category: '五金件',
      unit: '个',
      material: '304不锈钢',
      weight: 0.35,
      customer: '华润置地',
      price: 28.50
    },
    {
      id: 'HW002',
      name: '铝合金窗锁',
      model: 'WL-AL6063-V2',
      category: '五金件',
      unit: '套',
      material: '6063铝合金',
      weight: 0.28,
      customer: '万科集团',
      price: 45.80
    },
    {
      id: 'HW003',
      name: '精密轴承座',
      model: 'BS-45Steel-P02',
      category: '机械零件',
      unit: '个',
      material: '45#钢',
      weight: 1.25,
      customer: '三一重工',
      price: 85.60
    }
  ],

  // 注塑产品数据
  injectionProducts: [
    {
      id: 'INJ001',
      name: '汽车仪表盘外壳',
      model: 'DB-ABS-PC-V4',
      category: '注塑件',
      unit: '个',
      material: 'ABS+PC合金',
      weight: 0.85,
      customer: '比亚迪汽车',
      price: 125.00
    },
    {
      id: 'INJ002',
      name: '家电控制面板',
      model: 'CP-PC-FR-V2',
      category: '注塑件',
      unit: '个',
      material: 'PC阻燃料',
      weight: 0.15,
      customer: '美的集团',
      price: 18.50
    },
    {
      id: 'INJ003',
      name: '医疗器械外壳',
      model: 'MS-PC-MED-V1',
      category: '注塑件',
      unit: '个',
      material: '医用PC',
      weight: 0.45,
      customer: '迈瑞医疗',
      price: 68.00
    }
  ],

  // 五金设备数据
  hardwareEquipment: [
    {
      id: 'EQ-HW001',
      name: '数控剪板机',
      type: '剪切设备',
      line: 'LINE-HW01',
      status: '运行中',
      utilization: 85,
      model: 'QC12Y-8×3200',
      manufacturer: '南通锻压'
    },
    {
      id: 'EQ-HW002',
      name: '200T冲床',
      type: '冲压设备',
      line: 'LINE-HW01',
      status: '运行中',
      utilization: 92,
      model: 'J23-200',
      manufacturer: '扬州锻压'
    },
    {
      id: 'EQ-HW003',
      name: 'CNC加工中心',
      type: '精加工设备',
      line: 'LINE-HW01',
      status: '运行中',
      utilization: 88,
      model: 'VMC-850',
      manufacturer: '大连机床'
    }
  ],

  // 注塑设备数据
  injectionEquipment: [
    {
      id: 'EQ-INJ001',
      name: '350T注塑机',
      type: '注塑设备',
      line: 'LINE-INJ01',
      status: '运行中',
      utilization: 94,
      model: 'HTF350X2',
      manufacturer: '海天国际'
    },
    {
      id: 'EQ-INJ002',
      name: 'UV涂装线',
      type: '涂装设备',
      line: 'LINE-INJ01',
      status: '维护中',
      utilization: 0,
      model: 'UV-LINE-2000',
      manufacturer: '东莞涂装'
    },
    {
      id: 'EQ-INJ003',
      name: '干燥机',
      type: '辅助设备',
      line: 'LINE-INJ01',
      status: '运行中',
      utilization: 78,
      model: 'DRY-500',
      manufacturer: '德马格'
    }
  ],

  // 五金原材料
  hardwareMaterials: [
    {
      id: 'MAT-SS304',
      name: '304不锈钢板',
      spec: '3mm×1500mm×3000mm',
      supplier: '宝钢不锈钢',
      category: '金属材料',
      unit: '张',
      price: 285.00
    },
    {
      id: 'MAT-AL6063',
      name: '6063铝合金型材',
      spec: '40mm×60mm×6000mm',
      supplier: '中铝集团',
      category: '金属材料',
      unit: '根',
      price: 45.60
    },
    {
      id: 'MAT-45STEEL',
      name: '45#钢棒',
      spec: 'Φ50mm×3000mm',
      supplier: '宝钢集团',
      category: '金属材料',
      unit: '根',
      price: 125.80
    }
  ],

  // 注塑原材料
  injectionMaterials: [
    {
      id: 'MAT-ABS-PC',
      name: 'ABS+PC合金粒子',
      spec: 'Bayblend T65XF',
      supplier: '科思创',
      category: '塑料粒子',
      unit: 'kg',
      price: 28.50
    },
    {
      id: 'MAT-PC-FR',
      name: 'PC阻燃粒子',
      spec: 'Makrolon 2458',
      supplier: '拜耳材料',
      category: '塑料粒子',
      unit: 'kg',
      price: 35.80
    },
    {
      id: 'MAT-PC-MED',
      name: '医用PC粒子',
      spec: 'Makrolon 2805',
      supplier: '拜耳材料',
      category: '塑料粒子',
      unit: 'kg',
      price: 58.60
    }
  ],

  // 五金生产线
  hardwareLines: [
    {
      id: 'LINE-HW01',
      name: '五金生产线1',
      type: '五金加工线',
      capacity: 500,
      status: '运行中',
      workshop: '五金车间'
    }
  ],

  // 注塑生产线
  injectionLines: [
    {
      id: 'LINE-INJ01',
      name: '注塑生产线1',
      type: '注塑成型线',
      capacity: 1000,
      status: '运行中',
      workshop: '注塑车间'
    }
  ],

  // 五金生产计划
  hardwareProductionPlans: [
    {
      id: 'PLAN-HW001',
      productId: 'HW001',
      productName: '不锈钢门把手',
      planDate: '2024-12-25',
      planQty: 500,
      actualQty: 320,
      status: '进行中',
      progress: 64,
      startTime: '08:00',
      endTime: '18:00',
      lineId: 'LINE-HW01',
      lineName: '五金生产线1',
      customer: '华润置地',
      priority: '高'
    }
  ],

  // 注塑生产计划
  injectionProductionPlans: [
    {
      id: 'PLAN-INJ001',
      productId: 'INJ001',
      productName: '汽车仪表盘外壳',
      planDate: '2024-12-26',
      planQty: 1000,
      actualQty: 0,
      status: '计划中',
      progress: 0,
      startTime: '08:00',
      endTime: '20:00',
      lineId: 'LINE-INJ01',
      lineName: '注塑生产线1',
      customer: '比亚迪汽车',
      priority: '中'
    }
  ],

  // 五金工艺路线
  hardwareProcessRoutes: [
    {
      id: 'ROUTE-HW001',
      productId: 'HW001',
      productName: '不锈钢门把手',
      version: 'V2.1',
      status: '有效',
      steps: [
        { stepNo: 10, stepName: '下料', equipment: 'EQ-HW001', standardTime: 5, description: '304不锈钢板剪切' },
        { stepNo: 20, stepName: '冲压成型', equipment: 'EQ-HW002', standardTime: 8, description: '200T冲床成型' },
        { stepNo: 30, stepName: '精加工', equipment: 'EQ-HW003', standardTime: 12, description: 'CNC精密加工' },
        { stepNo: 40, stepName: '表面处理', equipment: 'EQ-HW004', standardTime: 6, description: '拉丝处理' },
        { stepNo: 50, stepName: '质检包装', equipment: 'EQ-HW005', standardTime: 4, description: '检验和包装' }
      ]
    }
  ],

  // 注塑工艺路线
  injectionProcessRoutes: [
    {
      id: 'ROUTE-INJ001',
      productId: 'INJ001',
      productName: '汽车仪表盘外壳',
      version: 'V4.2',
      status: '有效',
      steps: [
        { stepNo: 10, stepName: '原料准备', equipment: 'EQ-INJ003', standardTime: 240, description: '干燥4小时' },
        { stepNo: 20, stepName: '注塑成型', equipment: 'EQ-INJ001', standardTime: 3.5, description: '350T注塑机成型' },
        { stepNo: 30, stepName: '去毛刺', equipment: 'EQ-INJ004', standardTime: 2, description: '手工去毛刺' },
        { stepNo: 40, stepName: 'UV涂装', equipment: 'EQ-INJ002', standardTime: 8, description: 'UV涂层处理' },
        { stepNo: 50, stepName: '最终检验', equipment: 'EQ-INJ005', standardTime: 5, description: '三坐标检测' }
      ]
    }
  ]
};

try {
  // 读取现有的mockData.js文件
  const mockDataPath = path.join(__dirname, '../client/src/data/mockData.js');
  let mockDataContent = fs.readFileSync(mockDataPath, 'utf8');

  console.log('📝 集成产品数据...');
  
  // 在baseData.products数组中添加五金注塑产品
  const productsRegex = /(products: \[[\s\S]*?\])/;
  if (productsRegex.test(mockDataContent)) {
    mockDataContent = mockDataContent.replace(productsRegex, (match) => {
      // 移除最后的 ]
      const withoutClosing = match.slice(0, -1);
      return withoutClosing + `,
    // 五金产品
    { id: 'HW001', name: '不锈钢门把手', model: 'DH-SS304-150', category: '五金件', unit: '个' },
    { id: 'HW002', name: '铝合金窗锁', model: 'WL-AL6063-V2', category: '五金件', unit: '套' },
    { id: 'HW003', name: '精密轴承座', model: 'BS-45Steel-P02', category: '机械零件', unit: '个' },
    // 注塑产品
    { id: 'INJ001', name: '汽车仪表盘外壳', model: 'DB-ABS-PC-V4', category: '注塑件', unit: '个' },
    { id: 'INJ002', name: '家电控制面板', model: 'CP-PC-FR-V2', category: '注塑件', unit: '个' },
    { id: 'INJ003', name: '医疗器械外壳', model: 'MS-PC-MED-V1', category: '注塑件', unit: '个' }
  ]`;
    });
  }

  console.log('🏭 集成生产线数据...');
  
  // 在baseData.productionLines数组中添加五金注塑生产线
  const productionLinesRegex = /(productionLines: \[[\s\S]*?\])/;
  if (productionLinesRegex.test(mockDataContent)) {
    mockDataContent = mockDataContent.replace(productionLinesRegex, (match) => {
      const withoutClosing = match.slice(0, -1);
      return withoutClosing + `,
    // 五金注塑生产线
    { id: 'LINE-HW01', name: '五金生产线1', type: '五金加工线', capacity: 500, status: '运行中' },
    { id: 'LINE-INJ01', name: '注塑生产线1', type: '注塑成型线', capacity: 1000, status: '运行中' }
  ]`;
    });
  }

  console.log('⚙️ 集成设备数据...');
  
  // 在baseData.equipment数组中添加五金注塑设备
  const equipmentRegex = /(equipment: \[[\s\S]*?\])/;
  if (equipmentRegex.test(mockDataContent)) {
    mockDataContent = mockDataContent.replace(equipmentRegex, (match) => {
      const withoutClosing = match.slice(0, -1);
      return withoutClosing + `,
    // 五金设备
    { id: 'EQ-HW001', name: '数控剪板机', type: '剪切设备', line: 'LINE-HW01', status: '运行中', utilization: 85 },
    { id: 'EQ-HW002', name: '200T冲床', type: '冲压设备', line: 'LINE-HW01', status: '运行中', utilization: 92 },
    { id: 'EQ-HW003', name: 'CNC加工中心', type: '精加工设备', line: 'LINE-HW01', status: '运行中', utilization: 88 },
    // 注塑设备
    { id: 'EQ-INJ001', name: '350T注塑机', type: '注塑设备', line: 'LINE-INJ01', status: '运行中', utilization: 94 },
    { id: 'EQ-INJ002', name: 'UV涂装线', type: '涂装设备', line: 'LINE-INJ01', status: '维护中', utilization: 0 },
    { id: 'EQ-INJ003', name: '干燥机', type: '辅助设备', line: 'LINE-INJ01', status: '运行中', utilization: 78 }
  ]`;
    });
  }

  console.log('📦 集成物料数据...');
  
  // 在baseData.materials数组中添加五金注塑材料
  const materialsRegex = /(materials: \[[\s\S]*?\])/;
  if (materialsRegex.test(mockDataContent)) {
    mockDataContent = mockDataContent.replace(materialsRegex, (match) => {
      const withoutClosing = match.slice(0, -1);
      return withoutClosing + `,
    // 五金原材料
    { id: 'MAT-SS304', name: '304不锈钢板', spec: '3mm×1500mm×3000mm', supplier: '宝钢不锈钢', category: '金属材料', unit: '张' },
    { id: 'MAT-AL6063', name: '6063铝合金型材', spec: '40mm×60mm×6000mm', supplier: '中铝集团', category: '金属材料', unit: '根' },
    { id: 'MAT-45STEEL', name: '45#钢棒', spec: 'Φ50mm×3000mm', supplier: '宝钢集团', category: '金属材料', unit: '根' },
    // 注塑原材料
    { id: 'MAT-ABS-PC', name: 'ABS+PC合金粒子', spec: 'Bayblend T65XF', supplier: '科思创', category: '塑料粒子', unit: 'kg' },
    { id: 'MAT-PC-FR', name: 'PC阻燃粒子', spec: 'Makrolon 2458', supplier: '拜耳材料', category: '塑料粒子', unit: 'kg' },
    { id: 'MAT-PC-MED', name: '医用PC粒子', spec: 'Makrolon 2805', supplier: '拜耳材料', category: '塑料粒子', unit: 'kg' }
  ]`;
    });
  }

  console.log('📊 集成生产计划数据...');
  
  // 在productionData.productionPlans数组中添加五金注塑计划
  const productionPlansRegex = /(productionPlans: \[[\s\S]*?\])/;
  if (productionPlansRegex.test(mockDataContent)) {
    mockDataContent = mockDataContent.replace(productionPlansRegex, (match) => {
      const withoutClosing = match.slice(0, -1);
      return withoutClosing + `,
    // 五金注塑生产计划
    {
      id: 'PLAN-HW001',
      productId: 'HW001',
      productName: '不锈钢门把手',
      planDate: '2024-12-25',
      planQty: 500,
      actualQty: 320,
      status: '进行中',
      progress: 64,
      startTime: '08:00',
      endTime: '18:00',
      lineId: 'LINE-HW01',
      lineName: '五金生产线1'
    },
    {
      id: 'PLAN-INJ001',
      productId: 'INJ001',
      productName: '汽车仪表盘外壳',
      planDate: '2024-12-26',
      planQty: 1000,
      actualQty: 0,
      status: '计划中',
      progress: 0,
      startTime: '08:00',
      endTime: '20:00',
      lineId: 'LINE-INJ01',
      lineName: '注塑生产线1'
    }
  ]`;
    });
  }

  console.log('🔧 集成工艺路线数据...');
  
  // 在processData.processRoutes数组中添加五金注塑工艺
  const processRoutesRegex = /(processRoutes: \[[\s\S]*?\])/;
  if (processRoutesRegex.test(mockDataContent)) {
    mockDataContent = mockDataContent.replace(processRoutesRegex, (match) => {
      const withoutClosing = match.slice(0, -1);
      return withoutClosing + `,
    // 五金工艺路线
    {
      id: 'ROUTE-HW001',
      productId: 'HW001',
      productName: '不锈钢门把手',
      version: 'V2.1',
      status: '有效',
      steps: [
        { stepNo: 10, stepName: '下料', equipment: 'EQ-HW001', standardTime: 5, description: '304不锈钢板剪切' },
        { stepNo: 20, stepName: '冲压成型', equipment: 'EQ-HW002', standardTime: 8, description: '200T冲床成型' },
        { stepNo: 30, stepName: '精加工', equipment: 'EQ-HW003', standardTime: 12, description: 'CNC精密加工' },
        { stepNo: 40, stepName: '表面处理', equipment: 'EQ-HW004', standardTime: 6, description: '拉丝处理' },
        { stepNo: 50, stepName: '质检包装', equipment: 'EQ-HW005', standardTime: 4, description: '检验和包装' }
      ]
    },
    // 注塑工艺路线
    {
      id: 'ROUTE-INJ001',
      productId: 'INJ001',
      productName: '汽车仪表盘外壳',
      version: 'V4.2',
      status: '有效',
      steps: [
        { stepNo: 10, stepName: '原料准备', equipment: 'EQ-INJ003', standardTime: 240, description: '干燥4小时' },
        { stepNo: 20, stepName: '注塑成型', equipment: 'EQ-INJ001', standardTime: 3.5, description: '350T注塑机成型' },
        { stepNo: 30, stepName: '去毛刺', equipment: 'EQ-INJ004', standardTime: 2, description: '手工去毛刺' },
        { stepNo: 40, stepName: 'UV涂装', equipment: 'EQ-INJ002', standardTime: 8, description: 'UV涂层处理' },
        { stepNo: 50, stepName: '最终检验', equipment: 'EQ-INJ005', standardTime: 5, description: '三坐标检测' }
      ]
    }
  ]`;
    });
  }

  // 移除未使用的导入语句
  mockDataContent = mockDataContent.replace(/import hardwareInjectionData from '\.\/hardwareInjectionMockData\.js';\n/, '');

  // 写入更新后的文件
  fs.writeFileSync(mockDataPath, mockDataContent);
  
  console.log('✅ 数据集成完成！\n');
  
  console.log('📈 集成数据统计:');
  console.log(`• 产品数据: 6个 (3个五金产品 + 3个注塑产品)`);
  console.log(`• 生产线: 2条 (五金生产线 + 注塑生产线)`);
  console.log(`• 设备数据: 6台 (3台五金设备 + 3台注塑设备)`);
  console.log(`• 原材料: 6种 (3种金属材料 + 3种塑料材料)`);
  console.log(`• 生产计划: 2个 (五金计划 + 注塑计划)`);
  console.log(`• 工艺路线: 2条 (五金工艺 + 注塑工艺)`);
  
  console.log('\n🎯 业务场景覆盖:');
  console.log('• 五金制造: 不锈钢门把手、铝合金窗锁、精密轴承座');
  console.log('• 注塑制造: 汽车仪表盘、家电面板、医疗器械外壳');
  console.log('• 客户覆盖: 华润置地、万科集团、三一重工、比亚迪、美的、迈瑞医疗');
  console.log('• 工艺流程: 完整的五金加工和注塑成型工艺');
  
  console.log('\n🔄 系统测试建议:');
  console.log('1. 重启前端服务: npm start');
  console.log('2. 登录系统查看各模块数据');
  console.log('3. 查看产品数据: 在产品列表中搜索"HW001"或"INJ001"');
  console.log('4. 查看生产计划: 在生产计划中查看五金和注塑计划');
  console.log('5. 查看设备状态: 在设备管理中查看五金和注塑设备');
  console.log('6. 查看工艺路线: 在工艺管理中查看五金和注塑工艺');

} catch (error) {
  console.error('❌ 数据集成失败:', error.message);
  process.exit(1);
}

console.log('\n🎉 五金注塑数据集成成功完成！');