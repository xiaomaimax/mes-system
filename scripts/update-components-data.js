#!/usr/bin/env node

/**
 * 更新组件数据源脚本
 * 让各个组件使用mockData.js中的五金注塑数据
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 开始更新组件数据源...\n');

// 需要更新的组件列表
const componentsToUpdate = [
  {
    path: 'client/src/components/equipment/EquipmentMasterData.js',
    dataType: 'equipment',
    description: '设备主数据'
  },
  {
    path: 'client/src/components/process/ProcessRouting.js',
    dataType: 'processRoutes',
    description: '工艺路线'
  },
  {
    path: 'client/src/components/inventory/InventoryMasterData.js',
    dataType: 'materials',
    description: '库存主数据'
  },
  {
    path: 'client/src/components/production/ProductionMasterDataManagement.js',
    dataType: 'products',
    description: '生产主数据'
  }
];

try {
  // 1. 更新设备主数据组件
  console.log('⚙️ 更新设备主数据组件...');
  updateEquipmentMasterData();
  
  // 2. 更新工艺路线组件
  console.log('🔧 更新工艺路线组件...');
  updateProcessRouting();
  
  // 3. 更新库存主数据组件
  console.log('📦 更新库存主数据组件...');
  updateInventoryMasterData();
  
  // 4. 更新生产主数据组件
  console.log('📊 更新生产主数据组件...');
  updateProductionMasterData();
  
  console.log('\n✅ 所有组件数据源更新完成！');
  
} catch (error) {
  console.error('❌ 更新失败:', error.message);
  process.exit(1);
}

function updateEquipmentMasterData() {
  const filePath = path.join(__dirname, '../client/src/components/equipment/EquipmentMasterData.js');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 添加mockData导入
  if (!content.includes('import mockData')) {
    content = content.replace(
      /import ButtonActions from '\.\.\/\.\.\/utils\/buttonActions';/,
      `import ButtonActions from '../../utils/buttonActions';\nimport mockData from '../../data/mockData';`
    );
  }
  
  // 替换设备数据
  const newEquipmentData = `
  // 设备基础数据 - 使用mockData中的数据
  const equipmentData = [
    ...mockData.baseData.equipment.map(eq => ({
      key: eq.id,
      equipmentCode: eq.id,
      equipmentName: eq.name,
      category: eq.type,
      model: eq.model || 'N/A',
      manufacturer: eq.manufacturer || 'N/A',
      specifications: eq.specifications || {
        power: 'N/A',
        capacity: 'N/A',
        dimensions: 'N/A'
      },
      status: eq.status === '运行中' ? 'active' : 'inactive',
      createDate: '2024-12-25',
      utilization: eq.utilization || 0,
      line: eq.line
    }))
  ];`;
  
  // 替换原有的equipmentData定义
  content = content.replace(
    /\/\/ 设备基础数据[\s\S]*?\];/,
    newEquipmentData
  );
  
  fs.writeFileSync(filePath, content);
  console.log('  ✅ 设备主数据组件已更新');
}

function updateProcessRouting() {
  const filePath = path.join(__dirname, '../client/src/components/process/ProcessRouting.js');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 添加mockData导入
  if (!content.includes('import mockData')) {
    content = content.replace(
      /import ButtonActions from '\.\.\/\.\.\/utils\/buttonActions';/,
      `import ButtonActions from '../../utils/buttonActions';\nimport mockData from '../../data/mockData';`
    );
  }
  
  // 替换工艺路线数据
  const newRoutingData = `
  // 工艺路线数据 - 使用mockData中的数据
  const routingData = [
    ...mockData.processData.processRoutes.map(route => ({
      key: route.id,
      routeCode: route.id,
      routeName: route.productName + '工艺路线',
      productCode: route.productId,
      productName: route.productName,
      version: route.version,
      status: route.status === '有效' ? '生效中' : '已停用',
      totalSteps: route.steps.length,
      cycleTime: route.steps.reduce((sum, step) => sum + step.standardTime, 0),
      createDate: '2024-12-25',
      creator: '工艺工程师',
      operations: route.steps.map(step => ({
        seq: step.stepNo,
        opCode: \`OP\${step.stepNo.toString().padStart(3, '0')}\`,
        opName: step.stepName,
        workCenter: step.equipment,
        standardTime: step.standardTime,
        setupTime: Math.round(step.standardTime * 0.2),
        description: step.description
      }))
    }))
  ];`;
  
  // 替换原有的routingData定义
  content = content.replace(
    /\/\/ 工艺路线数据[\s\S]*?\];/,
    newRoutingData
  );
  
  fs.writeFileSync(filePath, content);
  console.log('  ✅ 工艺路线组件已更新');
}

function updateInventoryMasterData() {
  const filePath = path.join(__dirname, '../client/src/components/inventory/InventoryMasterData.js');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 添加mockData导入
  if (!content.includes('import mockData')) {
    content = content.replace(
      /import ButtonActions from '\.\.\/\.\.\/utils\/buttonActions';/,
      `import ButtonActions from '../../utils/buttonActions';\nimport mockData from '../../data/mockData';`
    );
  }
  
  // 替换物料主数据
  const newMaterialsData = `
  // 物料主数据 - 使用mockData中的数据
  const materialsData = [
    ...mockData.baseData.materials.map(material => ({
      key: material.id,
      materialCode: material.id,
      materialName: material.name,
      specification: material.spec,
      category: material.category,
      unit: material.unit,
      supplier: material.supplier,
      unitPrice: material.price || 0,
      currentStock: Math.floor(Math.random() * 1000) + 100,
      safetyStock: Math.floor(Math.random() * 200) + 50,
      maxStock: Math.floor(Math.random() * 2000) + 1000,
      storageLocation: \`\${material.category === '金属材料' ? 'A' : 'B'}区-01-01\`,
      shelfLife: material.category === '塑料粒子' ? 365 : 0,
      status: 'active',
      remarks: \`\${material.category}专用\`
    }))
  ];`;
  
  // 替换原有的materialsData定义
  content = content.replace(
    /\/\/ 物料主数据[\s\S]*?\];/,
    newMaterialsData
  );
  
  fs.writeFileSync(filePath, content);
  console.log('  ✅ 库存主数据组件已更新');
}

function updateProductionMasterData() {
  const filePath = path.join(__dirname, '../client/src/components/production/ProductionMasterDataManagement.js');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 添加mockData导入
  if (!content.includes('import mockData')) {
    content = content.replace(
      /import ButtonActions from '\.\.\/\.\.\/utils\/buttonActions';/,
      `import ButtonActions from '../../utils/buttonActions';\nimport mockData from '../../data/mockData';`
    );
  }
  
  // 查找并替换产品数据
  const productDataRegex = /const productData = \[[\s\S]*?\];/;
  if (productDataRegex.test(content)) {
    const newProductData = `
  const productData = [
    ...mockData.baseData.products.map(product => ({
      key: product.id,
      productCode: product.id,
      productName: product.name,
      productModel: product.model,
      category: product.category,
      unit: product.unit,
      status: '启用',
      createTime: '2024-12-25 10:00:00',
      updateTime: '2024-12-25 10:00:00',
      creator: '系统管理员',
      remark: \`\${product.category}产品\`
    }))
  ];`;
    
    content = content.replace(productDataRegex, newProductData);
  }
  
  fs.writeFileSync(filePath, content);
  console.log('  ✅ 生产主数据组件已更新');
}

console.log('\n🎯 更新完成后的效果:');
console.log('• 设备管理: 将显示五金和注塑设备');
console.log('• 工艺管理: 将显示五金和注塑工艺路线');
console.log('• 库存管理: 将显示金属和塑料原材料');
console.log('• 生产管理: 将显示五金和注塑产品');

console.log('\n🔄 请重启前端服务查看效果:');
console.log('1. 停止当前服务 (Ctrl+C)');
console.log('2. 重新启动: npm start');
console.log('3. 访问系统查看更新后的数据');

console.log('\n🎉 组件数据源更新完成！');